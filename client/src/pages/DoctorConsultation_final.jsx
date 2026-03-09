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
      toast.error(error.response?.data?.error || 'Failed to create consultation')
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
      toast.error(error.response?.data?.error || 'Failed to update consultation')
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
      toast.error('Failed to sign consultation')
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

  function openDetailModal(consultation) {
    setSelectedConsultation(consultation)
    setShowDetailModal(true)
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

  const getConsultationCountByPatient = (patientId) => {
    return consultations.filter(c => c.patientId === patientId).length
  }

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
              <p className="text-sm font-medium text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{consultations.length || 0}</p>
            </div>
            <div className="stat-card-icon bg-blue-50 text-blue-600">
              <FaNotesMedical />
            </div>
            ))}
            {(!formData.labOrders || formData.labOrders.length === 0) && (
              <div className="text-xs text-slate-400 italic text-center py-2">No lab orders added yet</div>
            )}
          </div>

          {/* Procedure Orders */}
          <div className="bg-orange-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Procedures</p>
              <button
                type="button"
                onClick={addProcedureOrder}
                className="text-[10px] bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded flex items-center gap-1 text-slate-600 transition"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {formData.procedureOrders?.map((order, index) => (
              <div key={index} className="bg-white rounded p-2 mb-2 border border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Procedure #{index + 1}</span>
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
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Description</label>
                    <input
                      type="text"
                      value={order.description}
                      onChange={(e) => updateProcedureOrder(index, 'description', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="e.g., Wound Dressing"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Priority</label>
                    <select
                      value={order.priority}
                      onChange={(e) => updateProcedureOrder(index, 'priority', e.target.value)}
                      className="input text-xs py-1"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Instructions</label>
                    <input
                      type="text"
                      value={order.instructions}
                      onChange={(e) => updateProcedureOrder(index, 'instructions', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="Procedure instructions..."
                    />
            </div>
            ))}
            {(!formData.procedureOrders || formData.procedureOrders.length === 0) && (
              <div className="text-xs text-slate-400 italic text-center py-2">No procedures added yet</div>
            )}
          </div>

          {/* Nursing Orders */}
          <div className="bg-cyan-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-wide">Nursing Orders</p>
              <button
                type="button"
                onClick={addNursingOrder}
                className="text-[10px] bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded flex items-center gap-1 text-slate-600 transition"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {formData.nursingOrders?.map((order, index) => (
              <div key={index} className="bg-white rounded p-2 mb-2 border border-cyan-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Nursing Order #{index + 1}</span>
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
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Type</label>
                    <input
                      type="text"
                      value={order.type}
                      onChange={(e) => updateNursingOrder(index, 'type', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="e.g., Vital Signs Monitoring"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Frequency</label>
                    <select
                      value={order.frequency}
                      onChange={(e) => updateNursingOrder(index, 'frequency', e.target.value)}
                      className="input text-xs py-1"
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
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Priority</label>
                    <select
                      value={order.priority}
                      onChange={(e) => updateNursingOrder(index, 'priority', e.target.value)}
                      className="input text-xs py-1"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Instructions</label>
                    <input
                      type="text"
                      value={order.instructions}
                      onChange={(e) => updateNursingOrder(index, 'instructions', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="Nursing instructions..."
                    />
            </div>
            ))}
            {(!formData.nursingOrders || formData.nursingOrders.length === 0) && (
              <div className="text-xs text-slate-400 italic text-center py-2">No nursing orders added yet</div>
            )}
          </div>

          {/* Referral Orders */}
          <div className="bg-indigo-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">Referrals</p>
              <button
                type="button"
                onClick={addReferralOrder}
                className="text-[10px] bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded flex items-center gap-1 text-slate-600 transition"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {formData.referralOrders?.map((order, index) => (
              <div key={index} className="bg-white rounded p-2 mb-2 border border-indigo-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Referral #{index + 1}</span>
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
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Referred To</label>
                    <input
                      type="text"
                      value={order.referredTo}
                      onChange={(e) => updateReferralOrder(index, 'referredTo', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="Specialist/Department"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Specialty</label>
                    <input
                      type="text"
                      value={order.specialty}
                      onChange={(e) => updateReferralOrder(index, 'specialty', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Urgency</label>
                    <select
                      value={order.urgency}
                      onChange={(e) => updateReferralOrder(index, 'urgency', e.target.value)}
                      className="input text-xs py-1"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Reason</label>
                    <input
                      type="text"
                      value={order.reason}
                      onChange={(e) => updateReferralOrder(index, 'reason', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="Reason for referral"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Notes</label>
                    <input
                      type="text"
                      value={order.notes}
                      onChange={(e) => updateReferralOrder(index, 'notes', e.target.value)}
                      className="input text-xs py-1"
                      placeholder="Additional notes..."
                    />
                  </div>
            ))}
            {(!formData.referralOrders || formData.referralOrders.length === 0) && (
              <div className="text-xs text-slate-400 italic text-center py-2">No referrals added yet</div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
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

// Consultation Form Modal
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
        labOrders: consultation.labOrders || [],
        procedureOrders: consultation.procedureOrders || [],
        nursingOrders: consultation.nursingOrders || [],
        referralOrders: consultation.referralOrders || [],
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

  const addLabOrder = () => {
    setFormData(prev => ({
      ...prev,
      labOrders: [...(prev.labOrders || []), { type: '', category: 'Laboratory', description: '', priority: 'ROUTINE', instructions: '' }]
    }))
  }

  const updateLabOrder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      labOrders: prev.labOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || []
    }))
  }

  const removeLabOrder = (index) => {
    setFormData(prev => ({
      ...prev,
      labOrders: prev.labOrders?.filter((_, i) => i !== index) || []
    }))
  }

  const addProcedureOrder = () => {
    setFormData(prev => ({
      ...prev,
      procedureOrders: [...(prev.procedureOrders || []), { description: '', priority: 'ROUTINE', instructions: '' }]
    }))
  }

  const updateProcedureOrder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      procedureOrders: prev.procedureOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || []
    }))
  }

  const removeProcedureOrder = (index) => {
    setFormData(prev => ({
      ...prev,
      procedureOrders: prev.procedureOrders?.filter((_, i) => i !== index) || []
    }))
  }

  const addNursingOrder = () => {
    setFormData(prev => ({
      ...prev,
      nursingOrders: [...(prev.nursingOrders || []), { type: '', frequency: 'Once', priority: 'ROUTINE', instructions: '' }]
    }))
  }

  const updateNursingOrder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      nursingOrders: prev.nursingOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || []
    }))
  }

  const removeNursingOrder = (index) => {
    setFormData(prev => ({
      ...prev,
      nursingOrders: prev.nursingOrders?.filter((_, i) => i !== index) || []
    }))
  }

  const addReferralOrder = () => {
    setFormData(prev => ({
      ...prev,
      referralOrders: [...(prev.referralOrders || []), { referredTo: '', specialty: '', urgency: 'ROUTINE', reason: '', notes: '' }]
    }))
  }

  const updateReferralOrder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      referralOrders: prev.referralOrders?.map((order, i) => i === index ? { ...order, [field]: value } : order) || []
    }))
  }

  const removeReferralOrder = (index) => {
    setFormData(prev => ({
      ...prev,
      referralOrders: prev.referralOrders?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content !max-w-4xl !w-[90vw] !max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header !py-2 !px-4">
          <h2 className="text-base font-semibold text-slate-900">
            {consultation ? 'Edit' : 'New'} Consultation
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-slate-500 text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-2 overflow-y-auto max-h-[calc(90vh-40px)]">
          {/* Patient Info */}
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-xs font-bold text-blue-700 mb-1">Patient Information</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Select Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => handleChange('patientId', e.target.value)}
                  className="input text-xs py-1"
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="input text-xs py-1"
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
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="text-[10px] font-bold text-purple-700 mb-1">SOAP Notes</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Subjective (Chief Complaint) *</label>
                <textarea
                  value={formData.subjective}
                  onChange={(e) => handleChange('subjective', e.target.value)}
                  className="input text-xs py-1"
                  rows="2"
                  placeholder="Patient's complaints..."
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Objective (Findings)</label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => handleChange('objective', e.target.value)}
                  className="input text-xs py-1"
                  rows="2"
                  placeholder="Physical examination findings..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Assessment</label>
                <textarea
                  value={formData.assessment}
                  onChange={(e) => handleChange('assessment', e.target.value)}
                  className="input text-xs py-1"
                  rows="2"
                  placeholder="Clinical impression..."
