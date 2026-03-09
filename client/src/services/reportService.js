import api from './api'

const reportService = {
  async getDailySummary(date) {
    const response = await api.get('/reports/daily-summary', { params: { date } })
    return response.data
  },

  async getPatientStatistics(startDate, endDate) {
    const response = await api.get('/reports/patient-statistics', { 
      params: { startDate, endDate } 
    })
    return response.data
  },

  async getConsultationReport(startDate, endDate) {
    const response = await api.get('/reports/consultations', { 
      params: { startDate, endDate } 
    })
    return response.data
  },

  async getPrescriptionReport(startDate, endDate) {
    const response = await api.get('/reports/prescriptions', { 
      params: { startDate, endDate } 
    })
    return response.data
  },

  async getVisitReport(startDate, endDate) {
    const response = await api.get('/reports/visits', { 
      params: { startDate, endDate } 
    })
    return response.data
  },

  async getQueueReport(date) {
    const response = await api.get('/reports/queue', { params: { date } })
    return response.data
  },

  async getOverview() {
    const response = await api.get('/reports/overview')
    return response.data
  }
}

export default reportService
