import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  FaUserNurse,
  FaFileMedical,
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaProcedures,
  FaPlus,
  FaTimes,
  FaClipboardList,
  FaSpinner
} from 'react-icons/fa'
import nurseService from '../services/nurseService'
import patientService from '../services/patientService'

function NurseDocumentation() {
  const [documentations, setDocumentations] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDocumentation, setSelectedDocumentation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPatients()
    loadDocumentations()
  }, [])

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll()
      setPatients(data.data || data)
    } catch (error) {
      console.error('Failed to load patients:', error)
    }
  }

  const loadDocumentations = async () => {
    setLoading(true)
    try {
      const data = await nurseService.getAll()
      setDocumentations(data.data || data)
    } catch (error) {
      console.error('Failed to load documentations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(docData) {
    try {
      const response = await nurseService.create(docData)
      loadDocumentations()
      setShowModal(false)
      toast.success('Documentation saved successfully')
    } catch (error) {
      console.error('Failed to create documentation:', error)
      toast.error(error.response?.data?.error || 'Failed to save documentation')
    }
  }

  async function handleUpdate(id, docData) {
    try {
      const response = await nurseService.update(id, docData)
      loadDocumentations()
      setShowModal(false)
      toast.success('Documentation updated successfully')
    } catch (error) {
      console.error('Failed to update documentation:', error)
      toast.error(error.response?.data?.error || 'Failed to update documentation')
    }
  }

  function openModal(existingDoc = null) {
    if (existingDoc) {
      setSelectedDocumentation(existingDoc)
      setSelectedPatient(existingDoc.patient || null)
    } else {
      setSelectedDocumentation(null)
      setSelectedPatient(null)
    }
    setShowModal(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Nurse Documentation</h1>
            <p className="page-subtitle">Patient triage, vitals, and nursing assessments</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            <FaPlus />
            New Documentation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Documentation</p>
              <p className="text-2xl font-bold text-black mt-1">{documentations?.length || 0}</p>
            </div>
            <div className="stat-card-icon bg-blue-50 text-blue-600">
              <FaFileMedical />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Emergency</p>
              <p className="text-2xl font-bold text-black mt-1">{documentations?.filter(d => d.triageLevel === 'EMERGENCY').length || 0}</p>
            </div>
            <div className="stat-card-icon bg-red-50 text-red-600">
              <FaExclamationTriangle />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Fall Risk</p>
              <p className="text-2xl font-bold text-black mt-1">{documentations?.filter(d => d.fallRisk).length || 0}</p>
            </div>
            <div className="stat-card-icon bg-orange-50 text-orange-600">
              <FaProcedures />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Completed Today</p>
              <p className="text-2xl font-bold text-black mt-1">{documentations?.filter(d => new Date(d.createdAt).toDateString() === new Date().toDateString()).length || 0}</p>
            </div>
            <div className="stat-card-icon bg-emerald-50 text-emerald-600">
              <FaCheckCircle />
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-primary-600" />
          </div>
        ) : documentations?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Triage Level</th>
                  <th>Chief Complaint</th>
                  <th>Vitals</th>
                  <th>Date</th>
                  <th>Flags</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documentations.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-black">
                          <FaUser />
                        </div>
                        <div>
                          <p className="font-medium text-black">{doc.patient?.firstName} {doc.patient?.lastName}</p>
                          <p className="text-xs text-black">{doc.patient?.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.triageLevel === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                        doc.triageLevel === 'URGENT' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-black'
                      }`}>
                        {doc.triageLevel}
                      </span>
                    </td>
                    <td className="text-sm">{doc.chiefComplaint || '--'}</td>
                    <td className="text-xs">
                      <div className="space-y-0.5">
                        {doc.temperature && <div>Temp: {doc.temperature}°C</div>}
                        {doc.bloodPressure && <div>BP: {doc.bloodPressure}</div>}
                        {doc.heartRate && <div>HR: {doc.heartRate}</div>}
                        {doc.spo2 && <div>SpO2: {doc.spo2}%</div>}
                      </div>
                    </td>
                    <td className="text-sm">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '--'}</td>
                    <td>
                      <div className="flex gap-1">
                        {doc.fallRisk && <span className="badge badge-warning">Fall Risk</span>}
                        {doc.isolationRequired && <span className="badge badge-danger">Isolation</span>}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openModal(doc)} className="p-2 hover:bg-slate-100 rounded-lg text-black hover:text-primary-600 transition" title="View/Edit">
                          <FaClipboardList />
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
              <FaUserNurse className="text-black text-2xl" />
            </div>
            <p className="text-black">No documentation found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NurseFormModal
          patient={selectedPatient}
          documentation={selectedDocumentation}
          onClose={() => setShowModal(false)}
          onSubmit={selectedDocumentation ? (data) => handleUpdate(selectedDocumentation.id, data) : handleCreate}
          allPatients={patients}
        />
      )}
    </div>
  )
}

function NurseFormModal({ patient, documentation, onClose, onSubmit, allPatients = [] }) {
  const [formData, setFormData] = useState({
    patientId: patient?.id || documentation?.patientId || '',
    visitId: '',
    triageLevel: 'ROUTINE',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    observations: '',
    // Vitals
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    spo2: '',
    painScale: 0,
    // Clinical
    allergies: patient?.knownAllergies?.join(', ') || '',
    currentMedications: '',
    fallRisk: false,
    isolationRequired: false,
    // Notes
    assessment: '',
    nursingDiagnosis: '',
    notes: ''
  })

  useEffect(() => {
    if (documentation) {
      setFormData({
        patientId: documentation.patientId || '',
        visitId: documentation.visitId || '',
        triageLevel: documentation.triageLevel || 'ROUTINE',
        chiefComplaint: documentation.chiefComplaint || '',
        historyOfPresentIllness: documentation.historyOfPresentIllness || '',
        observations: Array.isArray(documentation.observations) ? documentation.observations.join(', ') : documentation.observations || '',
        temperature: documentation.temperature || '',
        bloodPressure: documentation.bloodPressure || '',
        heartRate: documentation.heartRate || '',
        respiratoryRate: documentation.respiratoryRate || '',
        spo2: documentation.spo2 || '',
        painScale: documentation.painScale || 0,
        allergies: documentation.allergies || '',
        currentMedications: documentation.currentMedications || '',
        fallRisk: documentation.fallRisk || false,
        isolationRequired: documentation.isolationRequired || false,
        assessment: documentation.assessment || '',
        nursingDiagnosis: documentation.nursingDiagnosis || '',
        notes: documentation.notes || ''
      })
    }
  }, [documentation])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.patientId) {
      toast.error('Patient is required')
      return
    }
    if (!formData.chiefComplaint.trim()) {
      toast.error('Chief complaint is required')
      return
    }

    // Convert vitals to numbers
    const submissionData = {
      ...formData,
      temperature: parseFloat(formData.temperature) || null,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
      respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
      spo2: formData.spo2 ? parseInt(formData.spo2) : null,
      painScale: parseInt(formData.painScale) || 0
    }

    onSubmit(submissionData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content !max-w-4xl !w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header !py-2 !px-4">
          <h2 className="text-base font-semibold text-black">Triage Documentation</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-black text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-2 max-h-[80vh] overflow-y-auto">
          {/* Patient Info */}
          <div className="bg-slate-100 rounded-lg p-2">
            <label className="block text-[10px] font-medium text-black mb-1">Patient</label>
            <select value={formData.patientId} onChange={(e) => handleChange('patientId', e.target.value)} className="input text-xs py-1">
              <option value="">Select a patient...</option>
              {allPatients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} - {p.phone}
                </option>
              ))}
            </select>
            {documentation?.patient && (
              <div className="mt-2 text-sm">
<p className="font-semibold text-black">{documentation.patient.firstName} {documentation.patient.lastName}</p>
              <p className="text-xs text-black">DOB: {documentation.patient.dateOfBirth ? new Date(documentation.patient.dateOfBirth).toLocaleDateString() : 'Unknown'} | {documentation.patient.gender || ''}</p>
              </div>
            )}
          </div>

          {/* Triage Level & Chief Complaint */}
          <div className="bg-slate-100 rounded-lg p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Triage Level</label>
                <select value={formData.triageLevel} onChange={(e) => handleChange('triageLevel', e.target.value)} className="input text-xs py-1">
                  <option value="ROUTINE">Routine (Green)</option>
                  <option value="URGENT">Urgent (Yellow)</option>
                  <option value="EMERGENCY">Emergency (Red)</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="block text-[10px] font-medium text-black mb-0.5">Chief Complaint <span className="text-red-500">*</span></label>
                <input type="text" value={formData.chiefComplaint} onChange={(e) => handleChange('chiefComplaint', e.target.value)} className="input text-xs py-1" placeholder="Reason for visit..." required />
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-slate-100 rounded-lg p-2">
            <p className="text-[10px] font-bold text-black uppercase tracking-wide mb-1">Vital Signs</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Temp (°C)</label>
                <input type="number" step="0.1" value={formData.temperature} onChange={(e) => handleChange('temperature', e.target.value)} className="input text-xs py-1" placeholder="36.5" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">BP (mmHg)</label>
                <input type="text" value={formData.bloodPressure} onChange={(e) => handleChange('bloodPressure', e.target.value)} className="input text-xs py-1" placeholder="120/80" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">HR</label>
                <input type="number" value={formData.heartRate} onChange={(e) => handleChange('heartRate', e.target.value)} className="input text-xs py-1" placeholder="72" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">RR</label>
                <input type="number" value={formData.respiratoryRate} onChange={(e) => handleChange('respiratoryRate', e.target.value)} className="input text-xs py-1" placeholder="16" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">SpO2 (%)</label>
                <input type="number" value={formData.spo2} onChange={(e) => handleChange('spo2', e.target.value)} className="input text-xs py-1" placeholder="98" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-black mb-0.5">Pain (0-10)</label>
                <input type="range" min="0" max="10" value={formData.painScale || 0} onChange={(e) => handleChange('painScale', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded appearance-none accent-primary-600" />
                <p className={`text-xs text-center font-medium ${formData.painScale > 7 ? 'text-red-500' : formData.painScale > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>{formData.painScale || 0}</p>
              </div>
            </div>
          </div>

          {/* Safety Assessment */}
          <div className="bg-slate-100 rounded-lg p-2">
            <p className="text-[10px] font-bold text-black uppercase tracking-wide mb-1">Safety Assessment</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={formData.fallRisk} onChange={(e) => handleChange('fallRisk', e.target.checked)} className="w-4 h-4 text-primary-600" />
                <div>
                  <p className="text-xs font-medium text-black">Fall Risk</p>
                  <p className="text-[10px] text-black">At risk for falls</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={formData.isolationRequired} onChange={(e) => handleChange('isolationRequired', e.target.checked)} className="w-4 h-4 text-primary-600" />
                <div>
                  <p className="text-xs font-medium text-black">Isolation Required</p>
                  <p className="text-[10px] text-black">Infection control</p>
                </div>
              </label>
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-red-50 rounded-lg p-2 border border-red-200">
            <label className="block text-[10px] font-medium text-red-700 mb-0.5">Known Allergies</label>
            <input type="text" value={formData.allergies} onChange={(e) => handleChange('allergies', e.target.value)} className="input text-xs py-1 bg-white border-red-200" placeholder="List allergies" />
          </div>

          {/* Nursing Assessment & Notes */}
          <div className="bg-slate-100 rounded-lg p-2">
            <label className="block text-[10px] font-medium text-black mb-0.5">Nursing Assessment</label>
            <textarea value={formData.assessment} onChange={(e) => handleChange('assessment', e.target.value)} className="input text-xs py-1" rows="2" placeholder="Clinical observations..." />
          </div>

          <div className="bg-slate-100 rounded-lg p-2">
            <label className="block text-[10px] font-medium text-black mb-0.5">Additional Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} className="input text-xs py-1" rows="1" placeholder="Any additional notes..." />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn-secondary text-xs px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs px-3 py-1.5">
              {documentation ? 'Update' : 'Save'} Documentation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NurseDocumentation
