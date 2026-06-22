import { NextRequest, NextResponse } from 'next/server'
import { verifyCertificate } from '@/lib/certificate'

export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const result = await verifyCertificate(params.certificateId)

    if (!result) {
      return NextResponse.json(
        { valid: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { valid: false, error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
