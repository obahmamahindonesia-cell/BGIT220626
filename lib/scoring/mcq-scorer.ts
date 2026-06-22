import { AnswerResponse, QuestionContent } from '@/types'

export function scoreMCQ(
  questionContent: QuestionContent,
  answer: AnswerResponse
): number {
  if (!answer.selectedOption || !questionContent.correctAnswer) return 0
  
  const isCorrect = String(answer.selectedOption).toLowerCase() === 
                    String(questionContent.correctAnswer).toLowerCase()
  
  return isCorrect ? 10 : 0
}
