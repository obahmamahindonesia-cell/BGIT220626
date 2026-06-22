'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { AnswerResponse } from '@/types'

interface WritingQuestionProps {
  question: { id: string; type: string; content: { prompt: string } }
  answer?: AnswerResponse
  onAnswer: (answer: AnswerResponse) => void
}

export default function WritingQuestion({ question, answer, onAnswer }: WritingQuestionProps) {
  const content = question.content
  const [text, setText] = useState(answer?.text || '')
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const handleChange = (value: string) => {
    setText(value)
    onAnswer({ text: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base text-[#0B1F3A] leading-relaxed whitespace-pre-line">
          {content.prompt}
        </p>
      </div>
      <div>
        <Textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Tulis jawaban Anda di sini..."
          className="min-h-[200px] resize-y text-sm"
        />
        <div className="flex justify-between mt-2 text-xs text-[#6B7280]">
          <span>{wordCount} kata</span>
          {question.type === 'ESSAY' && (
            <span className={wordCount < 100 ? 'text-red-500' : 'text-green-600'}>
              Target: 200-300 kata
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
