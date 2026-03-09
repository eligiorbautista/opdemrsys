import api from '../services/api'

const patientService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/patients', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/patients/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async create(data) {
    try {
      const response = await api.post('/patients', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/patients/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/patients/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async search(query, filters = {}) {
    try {
      const response = await api.get('/patients', { 
        params: { search: query, ...filters }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getHistory(id) {
    try {
      const response = await api.get(`/patients/${id}/history`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default patientService
