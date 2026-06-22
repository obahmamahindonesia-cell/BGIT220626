'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

interface CertificateData {
  id: string
  userName: string
  overallLevel: string
  overallScore: number
  issuedAt: string
  scores: {
    listening: number
    reading: number
    speaking: number
    writing: number
    mediation: number
    integrated: number
  }
}

export default function VerifyCertificatePage() {
  const params = useParams()
  const certificateId = params?.certificateId as string

  const [searchId, setSearchId] = useState(certificateId || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; certificate?: CertificateData; error?: string } | null>(null)

  useEffect(() => {
    if (certificateId && !result && !loading) {
      handleVerify(certificateId)
    }
  }, [certificateId])

  const handleVerify = async (id?: string) => {
    const verifyId = id || searchId
    if (!verifyId) {
      alert('Please enter a certificate ID')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/certificates/verify/${verifyId}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ valid: false, error: 'Failed to verify certificate' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F6F1] pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#0B1F3A] mb-4">
                Verify Certificate
              </h1>
              <p className="text-lg text-gray-600">
                Verify the authenticity of a BIGT certificate
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Enter Certificate ID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="e.g., BIGT-M1ABC123-XYZ789"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleVerify()}
                    disabled={loading}
                    className="bg-[#C8102E] hover:bg-red-800 text-white"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The certificate ID can be found on the certificate itself
                </p>
              </CardContent>
            </Card>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
                <p className="mt-4 text-gray-600">Verifying certificate...</p>
              </div>
            )}

            {result && !loading && (
              <Card>
                <CardContent className="pt-6">
                  {result.valid && result.certificate ? (
                    <div>
                      <div className="text-center mb-6">
                        <div className="inline-block px-6 py-3 bg-green-100 text-green-800 rounded-full mb-4">
                          <span className="font-semibold">✓ Certificate Valid</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#0B1F3A] mb-2">
                          {result.certificate.userName}
                        </h2>
                        <p className="text-gray-600">
                          Certificate ID: {result.certificate.id}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="text-center p-6 bg-[#C8102E] rounded-xl">
                          <div className="text-5xl font-bold text-white mb-2">
                            {result.certificate.overallLevel}
                          </div>
                          <div className="text-white/80 text-sm">CEFR Level</div>
                        </div>
                        <div className="text-center p-6 bg-[#0B1F3A] rounded-xl">
                          <div className="text-5xl font-bold text-white mb-2">
                            {result.certificate.overallScore.toFixed(1)}%
                          </div>
                          <div className="text-white/80 text-sm">Overall Score</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="font-semibold text-[#0B1F3A] mb-3">Skill Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(result.certificate.scores).map(([skill, score]) => (
                            <div key={skill} className="p-3 bg-[#F8F6F1] rounded-lg">
                              <div className="text-xs text-gray-600 capitalize mb-1">{skill}</div>
                              <div className="text-lg font-bold text-[#0B1F3A]">
                                {score.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-500">
                        Issued on {new Date(result.certificate.issuedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-block px-6 py-3 bg-red-100 text-red-800 rounded-full mb-4">
                        <span className="font-semibold">✗ Certificate Invalid</span>
                      </div>
                      <p className="text-gray-600">
                        {result.error || 'This certificate could not be verified'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>About Certificate Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    BIGT certificates include a unique Certificate ID and QR code that can be used to verify their authenticity.
                  </p>
                  <p>
                    To verify a certificate:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Enter the Certificate ID in the field above, or</li>
                    <li>Scan the QR code on the certificate using your smartphone</li>
                  </ul>
                  <p>
                    If the certificate is valid, you will see the certificate holder&apos;s name, CEFR level, and skill breakdown.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
