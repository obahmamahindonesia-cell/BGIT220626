'use client'

import { AnswerResponse } from '@/types'

interface MCQQuestionProps {
  question: { id: string; content: { prompt: string; options?: string[] } }
  answer?: AnswerResponse
  onAnswer: (answer: AnswerResponse) => void
}

export default function MCQQuestion({ question, answer, onAnswer }: MCQQuestionProps) {
  const content = question.content
  const options = content.options || []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base text-[#0B1F3A] leading-relaxed whitespace-pre-line">
          {content.prompt}
        </p>
      </div>
      <div className="space-y-3">
        {options.map((option: string, index: number) => {
          const optionLabel = String.fromCharCode(65 + index)
          const isSelected = answer?.selectedOption === optionLabel

          return (
            <label
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#C8102E] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={optionLabel}
                checked={isSelected}
                onChange={() => onAnswer({ selectedOption: optionLabel })}
                className="mt-0.5 accent-[#C8102E]"
              />
              <div>
                <span className="font-semibold text-sm text-[#0B1F3A] mr-2">{optionLabel}.</span>
                <span className="text-sm text-[#0B1F3A]">{option}</span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
