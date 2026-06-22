import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function generateCertificateId(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BIGT-${timestamp}-${random}`
}

export async function createCertificate(testResultId: string) {
  const testResult = await prisma.testResult.findUnique({
    where: { id: testResultId },
    include: {
      session: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!testResult) {
    throw new Error('Test result not found')
  }

  const existingCertificate = await prisma.certificate.findUnique({
    where: { testResultId },
  })

  if (existingCertificate) {
    return existingCertificate
  }

  const certificateId = await generateCertificateId()
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateId}`

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 2,
    color: {
      dark: '#0B1F3A',
      light: '#FFFFFF',
    },
  })

  const certificate = await prisma.certificate.create({
    data: {
      certificateId,
      testResultId,
      userId: testResult.session.userId,
      userName: testResult.session.user.name || testResult.session.user.email,
      overallLevel: testResult.overallLevel,
      overallScore: testResult.overallScore,
      qrCodeUrl: qrCodeDataUrl,
    },
  })

  return certificate
}

export async function verifyCertificate(certificateId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateId },
    include: {
      testResult: {
        include: {
          session: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (!certificate) {
    return null
  }

  if (!certificate.isActive) {
    return {
      valid: false,
      reason: 'Certificate has been revoked',
      revokedAt: certificate.revokedAt,
      revokeReason: certificate.revokeReason,
    }
  }

  return {
    valid: true,
    certificate: {
      id: certificate.certificateId,
      userName: certificate.userName,
      overallLevel: certificate.overallLevel,
      overallScore: certificate.overallScore,
      issuedAt: certificate.issuedAt,
      scores: {
        listening: certificate.testResult.listeningScore,
        reading: certificate.testResult.readingScore,
        speaking: certificate.testResult.speakingScore,
        writing: certificate.testResult.writingScore,
        mediation: certificate.testResult.mediationScore,
        integrated: certificate.testResult.integratedScore,
      },
    },
  }
}
