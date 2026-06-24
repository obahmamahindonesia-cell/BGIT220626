import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Tidak ada file yang diunggah.' }, { status: 400 })
    }

    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Ukuran foto maksimal 2 MB.' }, { status: 400 })
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Format foto harus JPG, PNG, atau WEBP.' }, { status: 400 })
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
    const fileName = `${authUser.id}/${Date.now()}.${ext}`

    // Clean up old avatar files before uploading new one
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(authUser.id)
    if (existingFiles && existingFiles.length > 0) {
      const oldPaths = existingFiles.map(f => `${authUser.id}/${f.name}`)
      await supabase.storage.from('avatars').remove(oldPaths)
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, { contentType: file.type })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ success: false, error: 'Gagal mengunggah foto.' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const avatarUrl = urlData?.publicUrl || null

    await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      create: { userId: dbUser.id, avatarUrl },
      update: { avatarUrl },
    })

    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } })

    return NextResponse.json({ success: true, avatarUrl, message: 'Foto berhasil diperbarui.' })
  } catch (err: any) {
    console.error('Avatar upload error:', err)
    return NextResponse.json({ success: false, error: 'Gagal mengunggah foto.' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Remove avatar files from storage
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(authUser.id)

    if (files && files.length > 0) {
      const filePaths = files.map(f => `${authUser.id}/${f.name}`)
      await supabase.storage.from('avatars').remove(filePaths)
    }

    await prisma.userProfile.update({
      where: { userId: dbUser.id },
      data: { avatarUrl: null },
    })

    await supabase.auth.updateUser({ data: { avatar_url: null } })

    return NextResponse.json({ success: true, message: 'Foto berhasil dihapus.' })
  } catch (err: any) {
    console.error('Avatar delete error:', err)
    return NextResponse.json({ success: false, error: 'Gagal menghapus foto.' }, { status: 500 })
  }
}
