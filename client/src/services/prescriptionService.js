import api from './api'

const prescriptionService = {
  async getAll(params) {
    const response = await api.get('/prescriptions', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/prescriptions/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/prescriptions', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/prescriptions/${id}`, data)
    return response.data
  },

  async getMedications() {
    const response = await api.get('/prescriptions/medications')
    return response.data
  },

  async getByPatient(patientId) {
    const response = await api.get(`/prescriptions/patient/${patientId}`)
    return response.data
  }
}

export default prescriptionService
