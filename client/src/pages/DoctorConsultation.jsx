import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  FaPlus,
  FaStethoscope,
  FaUser,
  FaClinicMedical,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSpinner,
  FaFileSignature,
  FaProcedures,
  FaNotesMedical,
  FaEye,
  FaCalendar,
  FaFilter,
  FaSearch,
  FaSync
} from 'react-icons/fa'
import { toast } from 'sonner'
import Dialog from '../components/ui/Dialog'
import consultationService from '../services/consultationService'
import patientService from '../services/patientService'

function DoctorConsultation() {
  const { id } = useParams()
  const [consultations, setConsultations] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')

  useEffect(() => {
    loadConsultations()
    loadPatients()
    if (id) {
      loadPatientConsultations(id)
    }
  }, [id])

  const loadConsultations = async () => {
    setLoading(true)
    try {
      const data = await consultationService.getAll()
      setConsultations(data.data || data)
    } catch (error) {
      console.error('Failed to load consultations:', error)
      toast.error('Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  const loadPatientConsultations = async (patientId) => {
    try {
      const data = await consultationService.getAll({ patientId })
      setConsultations(data.data || data)
    } catch (error) {
      console.error('Failed to load patient consultations:', error)
    }
  }

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll()
      setPatients(data.data || data)
    } catch (error) {
      console.error('Failed to load patients:', error)
    }
  }

  async function handleCreate(formData) {
    try {
      await consultationService.create(formData)
      setShowModal(false)
      setSelectedPatient(null)
      loadConsultations()
      toast.success('Consultation created successfully')
    } catch (error) {
      console.error('Failed to create consultation:', error)
      console.error('Error details:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create consultation'
      toast.error(errorMessage, { duration: 10000 })
    }
  }

  async function handleUpdate(id, formData) {
    try {
      await consultationService.update(id, formData)
      setShowModal(false)
      setSelectedPatient(null)
      setSelectedConsultation(null)
      loadConsultations()
      toast.success('Consultation updated successfully')
    } catch (error) {
      console.error('Failed to update consultation:', error)
      console.error('Error details:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update consultation'
      toast.error(errorMessage)
    }
  }

  async function handleDelete(consultationId) {
    try {
      await consultationService.delete(consultationId)
      setShowDeleteModal(false)
      setSelectedConsultation(null)
      loadConsultations()
      toast.success('Consultation deleted successfully')
    } catch (error) {
      console.error('Failed to delete consultation:', error)
      toast.error('Failed to delete consultation')
    }
  }

  async function handleSign(consultationId) {
    try {
      await consultationService.sign(consultationId)
      loadConsultations()
      toast.success('Consultation signed successfully')
    } catch (error) {
      console.error('Failed to sign consultation:', error)
      const errorMessage = error.response?.data?.error || 'Failed to sign consultation'
      toast.error(errorMessage)
    }
  }

  function openCreateModal() {
    setSelectedPatient(null)
    setSelectedConsultation(null)
    setShowModal(true)
  }

  async function openEditModal(consultation) {
    try {
      const response = await consultationService.getById(consultation.id)
      setSelectedConsultation(response.data || response)
      setShowModal(true)
    } catch (error) {
      console.error('Failed to load consultation:', error)
      toast.error('Failed to load consultation')
    }
  }

  async function openDetailModal(consultation) {
    try {
      const response = await consultationService.getById(consultation.id)
      setSelectedConsultation(response.data || response)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Failed to load consultation:', error)
      toast.error('Failed to load consultation')
    }
  }

  function openDeleteModal(consultation) {
    setSelectedConsultation(consultation)
    setShowDeleteModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setShowDetailModal(false)
    setSelectedPatient(null)
    setSelectedConsultation(null)
  }

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = !searchQuery ||
      (consultation.patient?.firstName && consultation.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (consultation.patient?.lastName && consultation.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (consultation.diagnosis && consultation.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'SIGNED' ? consultation.isSigned : !consultation.isSigned)
    const matchesType = filterType === 'ALL' || consultation.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-2xl text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Consultations</h1>
          <p className="page-subtitle">Patient consultations with SOAP notes and ICD-10 coding</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <FaPlus />
          New Consultation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Consultations</p>
              <p className="text-2xl font-bold text-black mt-1">{consultations.length || 0}</p>
            </div>
            <div className="stat-card-icon bg-blue-50 text-blue-600">
              <FaNotesMedical />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Pending</p>
              <p className="text-2xl font-bold text-black mt-1">
                {consultations.filter(c => !c.isSigned).length || 0}
              </p>
            </div>
            <div className="stat-card-icon bg-amber-50 text-amber-600">
              <FaFileSignature />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Signed</p>
              <p className="text-2xl font-bold text-black mt-1">
                {consultations.filter(c => c.isSigned).length || 0}
              </p>
            </div>
            <div className="stat-card-icon bg-emerald-50 text-emerald-600">
              <FaProcedures />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Today</p>
              <p className="text-2xl font-bold text-black mt-1">
                {consultations.filter(c => {
                  const today = new Date().toDateString();
                  return c.createdAt && new Date(c.createdAt).toDateString() === today;
                }).length || 0}
              </p>
            </div>
            <div className="stat-card-icon bg-purple-50 text-purple-600">
              <FaCalendar />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <form onSubmit={(e) => { e.preventDefault() }} className="flex gap-3">
          <div className="input-group flex-1">
            <FaSearch className="input-group-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, diagnosis..."
              className="input input-with-icon"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="ALL">All Status</option>
              <option value="SIGNED">Signed</option>
              <option value="UNSIGNED">Unsigned</option>
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="ALL">All Types</option>
              <option value="INITIAL">Initial</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="REFERRAL">Referral</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>
        </form>
      </div>

      {/* Consultations Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-primary-600" />
          </div>
        ) : filteredConsultations?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Diagnosis</th>
                  <th>ICD-10</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-black">
                          <FaUser />
                        </div>
                        <div>
                          <p className="font-medium text-black">{consultation.patient?.firstName} {consultation.patient?.lastName}</p>
                          <p className="text-xs text-black">{consultation.patient?.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{consultation.type || '--'}</td>
                    <td>{consultation.diagnosis || 'Pending'}</td>
                    <td>{consultation.icd10Code || '--'}</td>
                    <td>{consultation.createdAt ? new Date(consultation.createdAt).toLocaleDateString() : '--'}</td>
                    <td>
                      <span className={consultation.isSigned ? 'badge-success' : 'badge-warning'}>
                        {consultation.isSigned ? 'Signed' : 'Pending'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailModal(consultation)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-black hover:text-blue-600 transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {!consultation.isSigned && (
                          <button
                            onClick={() => openEditModal(consultation)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-black hover:text-primary-600 transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {!consultation.isSigned && (
                          <button
                            onClick={() => handleSign(consultation.id)}
                            className="p-2 hover:bg-emerald-50 rounded-lg text-black hover:text-emerald-600 transition"
                            title="Sign"
                          >
                            <FaFileSignature />
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(consultation)}
                          className="p-2 hover:bg-red-50 rounded-lg text-black hover:text-red-600 transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStethoscope className="text-black text-2xl" />
            </div>
            <p className="text-black">No consultations found</p>
          </div>
        )}
      </div>

      {/* Render Modals */}
      {showModal && (
        <ConsultationFormModal
          patient={selectedPatient}
          consultation={selectedConsultation}
          onClose={closeModal}
          onSubmit={selectedConsultation ? (data) => handleUpdate(selectedConsultation.id, data) : handleCreate}
          allPatients={patients}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteModal && selectedConsultation && (
        <Dialog
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDelete(selectedConsultation.id)}
          title="Delete Consultation"
          message={`Are you sure you want to delete the consultation for ${selectedConsultation.patient?.firstName} ${selectedConsultation.patient?.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      )}

      {/* Consultation Detail Modal */}
      {showDetailModal && selectedConsultation && (
        <ConsultationDetailModal
          consultation={selectedConsultation}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  )
}

// Consultation Detail Modal
const ConsultationFormModal = ({ patient, consultation, onClose, onSubmit, allPatients }) => {
  const [formData, setFormData] = useState({
    patientId: patient?.id || '',
    visitId: '',
    type: 'INITIAL',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnosis: '',
    icd10Code: '',
    diagnosisNotes: '',
    treatmentPlan: '',
    followUp: '',
    instructions: '',
    notes: '',
    labOrders: [],
    procedureOrders: [],
    nursingOrders: [],
    referralOrders: [],
    followUpOrder: null
  })

  useEffect(() => {
    if (consultation) {
      setFormData({
        patientId: consultation.patientId || '',
        visitId: consultation.visitId || '',
        type: consultation.type || 'INITIAL',
        subjective: consultation.subjective || '',
        objective: consultation.objective || '',
        assessment: consultation.assessment || '',
        plan: consultation.plan || '',
        diagnosis: consultation.diagnosis || '',
        icd10Code: consultation.icd10Code || '',
        diagnosisNotes: consultation.diagnosisNotes || '',
        treatmentPlan: consultation.treatmentPlan || '',
        followUp: consultation.followUp ? new Date(consultation.followUp).toISOString().split('T')[0] : '',
        instructions: consultation.instructions || '',
        notes: consultation.notes || '',
        labOrders: consultation.visit?.labOrders || [],
        procedureOrders: consultation.procedureOrders || [],
        nursingOrders: consultation.visit?.nursingOrders || [],
        referralOrders: consultation.visit?.referralOrders || [],
        followUpOrder: null
      })
    }
  }, [consultation])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.patientId) {
      toast.error('Patient is required')
      return
    }
    if (!formData.subjective.trim()) {
      toast.error('Subjective (chief complaint) is required')
      return
    }
    if (!formData.diagnosis.trim()) {
      toast.error('Diagnosis is required')
      return
    }
    if (!formData.icd10Code.trim()) {
      toast.error('ICD-10 Code is required')
      return
    }

    onSubmit(formData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Orders Functions
  const addLabOrder = () => setFormData(prev => ({ ...prev, labOrders: [...(prev.labOrders || []), { type: '', category: 'Laboratory', description: '', priority: 'ROUTINE', instructions: '' }] }))
  const updateLabOrder = (index, field, value) => setFormData(prev => ({ ...prev, labOrders: prev.labOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || [] }))
  const removeLabOrder = (index) => setFormData(prev => ({ ...prev, labOrders: prev.labOrders?.filter((_, i) => i !== index) || [] }))

  const addProcedureOrder = () => setFormData(prev => ({ ...prev, procedureOrders: [...(prev.procedureOrders || []), { description: '', priority: 'ROUTINE', instructions: '' }] }))
  const updateProcedureOrder = (index, field, value) => setFormData(prev => ({ ...prev, procedureOrders: prev.procedureOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || [] }))
  const removeProcedureOrder = (index) => setFormData(prev => ({ ...prev, procedureOrders: prev.procedureOrders?.filter((_, i) => i !== index) || [] }))

  const addNursingOrder = () => setFormData(prev => ({ ...prev, nursingOrders: [...(prev.nursingOrders || []), { type: '', frequency: 'Once', priority: 'ROUTINE', instructions: '' }] }))
  const updateNursingOrder = (index, field, value) => setFormData(prev => ({ ...prev, nursingOrders: prev.nursingOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || [] }))
  const removeNursingOrder = (index) => setFormData(prev => ({ ...prev, nursingOrders: prev.nursingOrders?.filter((_, i) => i !== index) || [] }))

  const addReferralOrder = () => setFormData(prev => ({ ...prev, referralOrders: [...(prev.referralOrders || []), { referredTo: '', specialty: '', urgency: 'ROUTINE', reason: '', notes: '' }] }))
  const updateReferralOrder = (index, field, value) => setFormData(prev => ({ ...prev, referralOrders: prev.referralOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || [] }))
  const removeReferralOrder = (index) => setFormData(prev => ({ ...prev, referralOrders: prev.referralOrders?.filter((_, i) => i !== index) || [] }))

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content !max-w-4xl !w-[90vw] !max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header !py-2 !px-4">
          <h2 className="text-base font-semibold text-black">
            {consultation ? 'Edit' : 'New'} Consultation
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-black text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body !p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Patient Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm font-bold text-blue-700 mb-2">Patient Information</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-black mb-1">Select Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => handleChange('patientId', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  required
                >
                  <option value="">Select a patient...</option>
                  {allPatients?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} - {p.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  required
                >
                  <option value="INITIAL">Initial</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* SOAP Notes */}
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm font-bold text-purple-700 mb-2">SOAP Notes</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-black mb-1">Subjective (Chief Complaint) *</label>
                <textarea
                  value={formData.subjective}
                  onChange={(e) => handleChange('subjective', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  rows="2"
                  placeholder="Patient's complaints..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">Objective (Findings)</label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => handleChange('objective', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  rows="2"
                  placeholder="Physical examination findings..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">Assessment</label>
                <textarea
                  value={formData.assessment}
                  onChange={(e) => handleChange('assessment', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  rows="2"
                  placeholder="Clinical impression..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">Plan</label>
                <textarea
                  value={formData.plan}
                  onChange={(e) => handleChange('plan', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  rows="2"
                  placeholder="Treatment plan..."
                />
              </div>
            </div>
          </div>

          {/* Diagnosis & Code */}
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm font-bold text-green-700 mb-2">Diagnosis Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-black mb-1">Diagnosis *</label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => handleChange('diagnosis', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Primary diagnosis..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">ICD-10 Code *</label>
                <input
                  type="text"
                  value={formData.icd10Code}
                  onChange={(e) => handleChange('icd10Code', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="e.g. J01.90"
                  required
                />
              </div>
            </div>
          </div>

          {/* Lab Orders */}
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Lab Orders</p>
              <button
                type="button"
                onClick={addLabOrder}
                className="text-xs bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded flex items-center gap-1 text-black transition"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {formData.labOrders?.map((order, index) => (
              <div key={index} className="bg-white rounded p-2 mb-2 border border-yellow-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-black">Lab Order #{index + 1}</span>
                  <button type="button" onClick={() => removeLabOrder(index)} className="text-xs text-red-600 hover:text-red-700">
                    <FaTimes />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Description</label>
                    <input type="text" value={order.description} onChange={(e) => updateLabOrder(index, 'description', e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g. CBC, Lipid Profile" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Priority</label>
                    <select value={order.priority} onChange={(e) => updateLabOrder(index, 'priority', e.target.value)} className="w-full border rounded px-2 py-1">
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {(!formData.labOrders || formData.labOrders.length === 0) && (
              <div className="text-xs text-black italic text-center py-2">No lab orders added yet</div>
            )}
          </div>

          {/* Procedure Orders */}
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Procedures</p>
              <button
                type="button"
                onClick={addProcedureOrder}
                className="text-xs bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded flex items-center gap-1 text-black transition"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {formData.procedureOrders?.map((order, index) => (
              <div key={index} className="bg-white rounded p-2 mb-2 border border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-black">Procedure #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProcedureOrder(index)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Description</label>
                    <input
                      type="text"
                      value={order.description}
                      onChange={(e) => updateProcedureOrder(index, 'description', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="e.g., Wound Dressing"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Priority</label>
                    <select
                      value={order.priority}
                      onChange={(e) => updateProcedureOrder(index, 'priority', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-black mb-0.5">Instructions</label>
                    <input
                      type="text"
                      value={order.instructions}
                      onChange={(e) => updateProcedureOrder(index, 'instructions', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Procedure instructions..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.procedureOrders || formData.procedureOrders.length === 0) && (
              <div className="text-xs text-black italic text-center py-2">No procedures added yet</div>
            )}
          </div>

          {/* Nursing Orders */}
          <div className="bg-cyan-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-bold text-cyan-700 uppercase tracking-wide">Nursing Orders</p>
              <button
                type="button"
                onClick={addNursingOrder}
                className="text-xs bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded flex items-center gap-1 text-black transition"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {formData.nursingOrders?.map((order, index) => (
              <div key={index} className="bg-white rounded p-2 mb-2 border border-cyan-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-black">Nursing Order #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeNursingOrder(index)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Type</label>
                    <input
                      type="text"
                      value={order.type}
                      onChange={(e) => updateNursingOrder(index, 'type', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="e.g., Vital Signs Monitoring"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Frequency</label>
                    <select
                      value={order.frequency}
                      onChange={(e) => updateNursingOrder(index, 'frequency', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="Every 4 hours">Every 4 hours</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="Every 12 hours">Every 12 hours</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Once daily">Once daily</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Priority</label>
                    <select
                      value={order.priority}
                      onChange={(e) => updateNursingOrder(index, 'priority', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-black mb-0.5">Instructions</label>
                    <input
                      type="text"
                      value={order.instructions}
                      onChange={(e) => updateNursingOrder(index, 'instructions', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Nursing instructions..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.nursingOrders || formData.nursingOrders.length === 0) && (
              <div className="text-xs text-black italic text-center py-2">No nursing orders added yet</div>
            )}
          </div>

          {/* Referral Orders */}
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Referrals</p>
              <button
                type="button"
                onClick={addReferralOrder}
                className="text-xs bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded flex items-center gap-1 text-black transition"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {formData.referralOrders?.map((order, index) => (
              <div key={index} className="bg-white rounded p-2 mb-2 border border-indigo-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-black">Referral #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeReferralOrder(index)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Referred To</label>
                    <input
                      type="text"
                      value={order.referredTo}
                      onChange={(e) => updateReferralOrder(index, 'referredTo', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Specialist/Department"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Specialty</label>
                    <input
                      type="text"
                      value={order.specialty}
                      onChange={(e) => updateReferralOrder(index, 'specialty', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Urgency</label>
                    <select
                      value={order.urgency}
                      onChange={(e) => updateReferralOrder(index, 'urgency', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-black mb-0.5">Reason</label>
                    <input
                      type="text"
                      value={order.reason}
                      onChange={(e) => updateReferralOrder(index, 'reason', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Reason for referral"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-black mb-0.5">Notes</label>
                    <input
                      type="text"
                      value={order.notes}
                      onChange={(e) => updateReferralOrder(index, 'notes', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.referralOrders || formData.referralOrders.length === 0) && (
              <div className="text-xs text-black italic text-center py-2">No referrals added yet</div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
            <button type="button" onClick={onClose} className="btn-secondary text-xs px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs px-3 py-1.5">
              {consultation ? 'Update' : 'Save'} Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ConsultationDetailModal = ({ consultation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="w-[95vw] h-[95vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-black">Consultation Details</h2>
            <p className="text-sm text-black">Complete consultation information</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition">
            <FaTimes className="text-black text-lg" />
          </button>
        </div>

        {/* Main Content - Grid Layout */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Patient Info & Consultation Details - Left Column */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Patient Information */}
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FaUser className="text-sm" /> Patient Information
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-black">Name</p>
                    <p className="text-black">{consultation.patient?.firstName} {consultation.patient?.lastName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-black">Phone</p>
                    <p className="text-black">{consultation.patient?.phone || '--'}</p>
                  </div>
                  {consultation.patient?.email && (
                    <div>
                      <p className="font-medium text-black">Email</p>
                      <p className="text-black">{consultation.patient.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Details */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-black uppercase tracking-wide mb-3">Consultation Details</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-black">Type</p>
                    <p className="text-black">{consultation.type}</p>
                  </div>
                  <div>
                    <p className="font-medium text-black">Date</p>
                    <p className="text-black">{consultation.createdAt ? new Date(consultation.createdAt).toLocaleString() : '--'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-black">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${consultation.isSigned ? 'bg-emerald-100 text-black' : 'bg-amber-100 text-black'}`}>
                      {consultation.isSigned ? 'Signed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3">Diagnosis</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-black">Primary Diagnosis</p>
                    <p className="text-black">{consultation.diagnosis}</p>
                  </div>
                  <div>
                    <p className="font-medium text-black">ICD-10 Code</p>
                    <p className="text-black bg-green-100 inline-block px-2 py-0.5 rounded">{consultation.icd10Code}</p>
                  </div>
                  {consultation.diagnosisNotes && (
                    <div>
                      <p className="font-medium text-black">Notes</p>
                      <p className="text-black text-xs">{consultation.diagnosisNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-up */}
              {consultation.followUp && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <FaCalendar className="text-sm" /> Follow-up
                  </p>
                  <p className="text-sm text-black">Scheduled for: {new Date(consultation.followUp).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* SOAP Notes - Middle Column */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <div className="bg-purple-50 rounded-xl p-4 h-full">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">SOAP Notes</p>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm text-purple-800 mb-1">Subjective</p>
                    <p className="text-sm text-black leading-relaxed">{consultation.subjective || '--'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-purple-800 mb-1">Objective</p>
                    <p className="text-sm text-black leading-relaxed">{consultation.objective || '--'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-purple-800 mb-1">Assessment</p>
                    <p className="text-sm text-black leading-relaxed">{consultation.assessment || '--'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-purple-800 mb-1">Plan</p>
                    <p className="text-sm text-black leading-relaxed">{consultation.plan || '--'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders - Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Lab Orders */}
              {consultation.visit?.labOrders && consultation.visit.labOrders.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-3">
                    Lab Orders ({consultation.visit.labOrders.length})
                  </p>
                  <div className="space-y-3">
                    {consultation.visit.labOrders.map((order, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-200">
                        <p className="font-medium text-sm text-black">{order.description}</p>
                        <div className="space-y-1 text-xs text-black mt-1">
                          {order.priority && <span>P: {order.priority}</span>}
                          {order.instructions && <span>• {order.instructions}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedures */}
              {consultation.procedureOrders && consultation.procedureOrders.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-3">
                    Procedures ({consultation.procedureOrders.length})
                  </p>
                  <div className="space-y-3">
                    {consultation.procedureOrders.map((order, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200">
                        <p className="font-medium text-sm text-black">{order.description}</p>
                        <div className="space-y-1 text-xs text-black mt-1">
                          {order.priority && <span>P: {order.priority}</span>}
                          {order.instructions && <span>• {order.instructions}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nursing Orders */}
              {consultation.visit?.nursingOrders && consultation.visit.nursingOrders.length > 0 && (
                <div className="bg-cyan-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-cyan-700 uppercase tracking-wide mb-3">
                    Nursing Orders ({consultation.visit.nursingOrders.length})
                  </p>
                  <div className="space-y-3">
                    {consultation.visit.nursingOrders.map((order, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-cyan-200">
                        <p className="font-medium text-sm text-black">{order.type}</p>
                        <div className="space-y-1 text-xs text-black mt-1">
                          {order.frequency && <span>F: {order.frequency}</span>}
                          {order.priority && <span>• P: {order.priority}</span>}
                          {order.instructions && <span>• {order.instructions}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referrals */}
              {consultation.visit?.referralOrders && consultation.visit.referralOrders.length > 0 && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-3">
                    Referrals ({consultation.visit.referralOrders.length})
                  </p>
                  <div className="space-y-3">
                    {consultation.visit.referralOrders.map((order, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-indigo-200">
                        <p className="font-medium text-sm text-black">{order.referredTo} - {order.specialty}</p>
                        <div className="space-y-1 text-xs text-black mt-1">
                          {order.urgency && <span>U: {order.urgency}</span>}
                          {order.reason && <span>• {order.reason}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No orders placeholder */}
              {(!consultation.visit?.labOrders || consultation.visit.labOrders.length === 0) &&
               (!consultation.procedureOrders || consultation.procedureOrders.length === 0) &&
               (!consultation.visit?.nursingOrders || consultation.visit.nursingOrders.length === 0) &&
               (!consultation.visit?.referralOrders || consultation.visit.referralOrders.length === 0) && (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <FaNotesMedical className="text-4xl text-black mx-auto mb-3" />
                  <p className="text-sm text-black">No orders placed for this consultation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorConsultation