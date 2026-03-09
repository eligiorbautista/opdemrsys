import api from './api'

const visitService = {
  async getAll(params) {
    const response = await api.get('/visits', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/visits/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/visits', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/visits/${id}`, data)
    return response.data
  },

  async startVisit(id) {
    const response = await api.patch(`/visits/${id}/start`)
    return response.data
  },

  async endVisit(id) {
    const response = await api.patch(`/visits/${id}/end`)
    return response.data
  },

  async getDaily() {
    const response = await api.get('/visits/daily')
    return response.data
  }
}

export default visitService
