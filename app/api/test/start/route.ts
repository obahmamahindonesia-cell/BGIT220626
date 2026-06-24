import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { selectQuestions } from '@/lib/assessment/question-selector'
import { runAdaptivePlacement } from '@/lib/assessment/adaptive-lite'
import { getBlueprint, distributeQuestions } from '@/lib/blueprints'

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

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      include: { profile: true },
    })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { product, dimensions, targetLevel, questionCount: customCount } = body

    if (!product) {
      return NextResponse.json({ success: false, error: 'Produk tes wajib diisi.' }, { status: 400 })
    }

    const blueprint = getBlueprint(product.toUpperCase())
    const questionCount = customCount || blueprint?.defaultQuestionCount || 25
    const productCode = product.toUpperCase()

    let selectedQuestions: any[] = []
    let metadata: any = {}

    if (productCode === 'PLACEMENT') {
      // Adaptive-lite placement
      const recentIds = await getRecentQuestionIds(dbUser.id, 30)
      const adaptiveResult = await runAdaptivePlacement(dbUser.id, dimensions || [], recentIds)
      selectedQuestions = adaptiveResult.questions
    } else {
      const dims = dimensions && dimensions.length > 0
        ? dimensions
        : (blueprint?.dimensions || ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED'])

      const level = targetLevel || dbUser.profile?.targetLevel || 'B1'

      // Distribute questions across dimensions
      const dimDistribution = blueprint
        ? distributeQuestions(questionCount, blueprint.dimensionWeights, dims)
        : Object.fromEntries(dims.map((d: string) => [d, Math.floor(questionCount / dims.length)]))

      // Correct rounding
      const dimTotal = Object.values(dimDistribution).reduce((a: number, b: number) => a + b, 0)
      if (dimTotal < questionCount && dims.length > 0) {
        dimDistribution[dims[0]] = (dimDistribution[dims[0]] || 0) + (questionCount - dimTotal)
      }

      const recentIds = await getRecentQuestionIds(dbUser.id, 30)
      const allQuestions: any[] = []

      for (const dim of Object.keys(dimDistribution)) {
        const count = dimDistribution[dim]
        if (count <= 0) continue

        const result = await selectQuestions({
          product: productCode,
          dimensions: [dim],
          targetLevel: level,
          questionCount: count,
          excludeQuestionIds: [...recentIds, ...allQuestions.map(q => q.id)],
        })

        if (!result.success) {
          return NextResponse.json({
            success: false,
            error: result.error,
            metadata: result.metadata,
          }, { status: 422 })
        }

        allQuestions.push(...result.questions)
        metadata = result.metadata
      }

      selectedQuestions = allQuestions.slice(0, questionCount)
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tidak ada soal yang tersedia untuk konfigurasi ini.',
      }, { status: 422 })
    }

    // Create TestSession
    const session = await prisma.testSession.create({
      data: {
        userId: dbUser.id,
        product: productCode,
        targetLevel: targetLevel || null,
        status: 'IN_PROGRESS',
        questionCount: selectedQuestions.length,
        metadata: { dimensions: dimensions || null },
      },
    })

    // Create TestSessionItems with snapshots
    for (let i = 0; i < selectedQuestions.length; i++) {
      const q = selectedQuestions[i]
      const snapshot = {
        prompt: q.prompt,
        instruction: q.instruction,
        questionType: q.questionType,
        options: q.options,
        stimulus: q.stimulus,
        estimatedTime: q.estimatedTime,
        tags: q.tags,
        subskill: q.subskill,
        topic: q.topic,
      }

      await prisma.testSessionItem.create({
        data: {
          sessionId: session.id,
          questionId: q.id,
          order: i + 1,
          dimension: q.dimension as any,
          level: q.level as any,
          difficulty: q.difficulty,
          questionSnapshot: snapshot,
          maxScore: q.maxScore || 10,
          stage: (q as any).stage || null,
        },
      })
    }

    // Update exposureCount
    for (const q of selectedQuestions) {
      await prisma.questionItem.update({
        where: { id: q.id },
        data: { exposureCount: { increment: 1 } },
      })
      await prisma.itemStatistic.upsert({
        where: { questionId: q.id },
        update: { attempts: { increment: 1 }, lastUsedAt: new Date() },
        create: { questionId: q.id, attempts: 1, lastUsedAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      redirectTo: `/test/${session.id}`,
      questionCount: selectedQuestions.length,
    })
  } catch (err: any) {
    console.error('Error starting test:', err)
    return NextResponse.json({ success: false, error: err.message || 'Gagal memulai tes.' }, { status: 500 })
  }
}

async function getRecentQuestionIds(userId: string, days: number): Promise<string[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days)

  const recentItems = await prisma.testSessionItem.findMany({
    where: {
      session: { userId, startedAt: { gte: thirtyDaysAgo } },
    },
    select: { questionId: true },
  })

  return Array.from(new Set(recentItems.map(i => i.questionId)))
}
