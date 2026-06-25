import api from './Api.client'

export const chatHistoryService = {
  async getHistory() {
    const { data } = await api.get('/chat-history')
    return data
  },

  // ─── Delete single item route handler ───
  async deleteMessage(messageId: number): Promise<void> {
    await api.delete(`/chat-history/${messageId}`)
  },
}