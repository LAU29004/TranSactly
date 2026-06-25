// services/aiService.ts
import api from './Api.client'
import { AIResponse } from '../types/Api.types'

export const aiService = {
  async ask(message: string): Promise<AIResponse> {
    const { data } = await api.post<AIResponse>(
      '/ai/chat',
      { message }
    )

    return data
  },
}