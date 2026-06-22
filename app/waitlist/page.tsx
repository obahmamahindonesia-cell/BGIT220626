'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    role: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name || !formData.email) {
      setError('Name and email are required')
      setLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join waitlist'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F6F1] pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#0B1F3A] mb-4">
                Join the Waitlist
              </h1>
              <p className="text-lg text-gray-600">
                Be the first to access BIGT when we launch
              </p>
            </div>

            {submitted ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="inline-block px-6 py-3 bg-green-100 text-green-800 rounded-full mb-4">
                    <span className="font-semibold">✓ You're on the list!</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#0B1F3A] mb-2">
                    Thank you, {formData.name}!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We&apos;ve added you to our waitlist. You&apos;ll receive an email at{' '}
                    <strong>{formData.email}</strong> when early access becomes available.
                  </p>
                  <p className="text-sm text-gray-500">
                    Keep an eye on your inbox for updates and exclusive offers.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Register Your Interest</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution / Organization
                      </label>
                      <Input
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="University, Company, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select your role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher / Educator</option>
                        <option value="professional">Professional</option>
                        <option value="institution">Institution Representative</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#C8102E] hover:bg-red-800 text-white py-6 text-lg"
                    >
                      {loading ? 'Joining...' : 'Join Waitlist'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By joining the waitlist, you agree to receive updates about BIGT.
                      You can unsubscribe at any time.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold text-[#0B1F3A] mb-1">Early Access</h3>
                  <p className="text-xs text-gray-600">Be among the first to try BIGT</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-semibold text-[#0B1F3A] mb-1">Special Pricing</h3>
                  <p className="text-xs text-gray-600">Exclusive discounts for early adopters</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl mb-2">📧</div>
                  <h3 className="font-semibold text-[#0B1F3A] mb-1">Updates</h3>
                  <p className="text-xs text-gray-600">Stay informed about launch dates</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
