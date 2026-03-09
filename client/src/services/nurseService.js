import api from './api'

const nurseService = {
  async getAll(params) {
    const response = await api.get('/nurse-documentation', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/nurse-documentation/${id}`)
    return response.data
  },

  async getByPatient(patientId) {
    const response = await api.get(`/nurse-documentation/patient/${patientId}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/nurse-documentation', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/nurse-documentation/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/nurse-documentation/${id}`)
    return response.data
  }
}

export default nurseService
