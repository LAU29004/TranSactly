// services/userService.ts

import api from './Api.client'
import { aiService } from '../services/aiService'
export const userService = {
  async getMe() {
    const { data } = await api.get('/user/me')
    return data
  },
}
export function useAIChat() {
  return {
    ask: aiService.ask,
  }
}