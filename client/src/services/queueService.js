import api from './api'

const queueService = {
  async getAll(params) {
    const response = await api.get('/queue', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/queue/${id}`)
    return response.data
  },

  async create(data) {
    try {
      const response = await api.post('/queue', data)
      return response.data
    } catch (error) {
      console.error('Queue service create error:', error.response?.data)
      throw error
    }
  },

  async callNext(queueId = 'default') {
    try {
      const response = await api.post(`/queue/call-next/${queueId}`)
      return response.data
    } catch (error) {
      console.error('Queue service callNext error:', error.response?.data)
      throw error
    }
  },

  async complete(id) {
    const response = await api.patch(`/queue/${id}/complete`)
    return response.data
  },

  async skip(id) {
    const response = await api.patch(`/queue/${id}/skip`)
    return response.data
  },

  async getStats(params) {
    const response = await api.get('/queue/stats', { params })
    return response.data
  }
}

export default queueService
