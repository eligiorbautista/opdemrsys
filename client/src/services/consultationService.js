import api from './api'

const consultationService = {
  async getAll(params) {
    const response = await api.get('/consultations', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/consultations/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/consultations', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/consultations/${id}`, data)
    return response.data
  },

  async getByPatient(patientId) {
    const response = await api.get(`/consultations/patient/${patientId}`)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/consultations/${id}`)
    return response.data
  },

  async sign(id) {
    const response = await api.put(`/consultations/${id}/sign`)
    return response.data
  }
}

export default consultationService
