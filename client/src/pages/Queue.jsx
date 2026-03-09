import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  FaPlus,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaHourglass,
  FaHourglassHalf,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaUser,
  FaSearch,
  FaPhone
} from 'react-icons/fa'
import patientService from '../services/patientService'
import queueService from '../services/queueService'

function Queue() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [queue, setQueue] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQueue()
    loadPatients()
  }, [])

  const loadQueue = async () => {
    setLoading(true)
    try {
      const data = await queueService.getAll()
      setQueue(data.data || [])
    } catch (error) {
      console.error('Failed to load queue:', error)
      toast.error('Failed to load queue')
    } finally {
      setLoading(false)
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

  async function handleCallNext() {
    try {
      const response = await queueService.callNext('default')
      if (response.success) {
        toast.success(`Called next patient: ${response.data.patient?.firstName} ${response.data.patient?.lastName}`)
        loadQueue()
      }
    } catch (error) {
      console.error('Failed to call next:', error)
      toast.error('Failed to call next patient')
    }
  }

  async function handleComplete(id) {
    try {
      await queueService.complete(id)
      toast.success('Queue entry completed')
      loadQueue()
    } catch (error) {
      console.error('Failed to complete:', error)
      toast.error('Failed to complete entry')
    }
  }

  async function handleSkip(id) {
    try {
      await queueService.skip(id)
      toast.success('Queue entry skipped')
      loadQueue()
    } catch (error) {
      console.error('Failed to skip:', error)
      toast.error('Failed to skip entry')
    }
  }

  async function handleAddToQueue(data) {
    try {
      await queueService.create(data)
      toast.success('Added to queue successfully')
      setShowAddModal(false)
      loadQueue()
      return true
    } catch (error) {
      console.error('Failed to add to queue:', error)
      toast.error(error.response?.data?.error || 'Failed to add to queue')
      return false
    }
  }

  const waitingCount = queue.filter(e => e.status === 'WAITING').length
  const inProgressCount = queue.filter(e => e.status === 'IN_PROGRESS').length
  const completedCount = queue.filter(e => e.status === 'COMPLETED').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">OPD Queue</h1>
            <p className="page-subtitle">Patient queue with priority-based ordering</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <FaPlus />
            Add to Queue
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Waiting</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{waitingCount}</p>
            </div>
            <div className="stat-card-icon bg-amber-50 text-amber-600">
              <FaHourglass />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{inProgressCount}</p>
            </div>
            <div className="stat-card-icon bg-blue-50 text-blue-600">
              <FaHourglassHalf />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</p>
            </div>
            <div className="stat-card-icon bg-emerald-50 text-emerald-600">
              <FaCheckCircle />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Emergency</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {queue.filter(e => e.priority >= 2 || e.triageLevel === 'EMERGENCY').length}
              </p>
            </div>
            <div className="stat-card-icon bg-red-50 text-red-600">
              <FaExclamationTriangle />
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title mb-0">Today's Queue</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-primary-600" />
          </div>
        ) : queue.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Notes</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.priority >= 2 ? 'bg-red-100 text-red-700' :
                        entry.priority === 1 ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {entry.position || index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                          <FaUser />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{entry.patient?.firstName} {entry.patient?.lastName}</p>
                          <p className="text-xs text-slate-500">{entry.patient?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        entry.status === 'COMPLETED' ? 'badge-success' :
                        entry.status === 'IN_PROGRESS' ? 'badge-info' :
                        entry.status === 'CALLED' ? 'badge-warning' :
                        entry.status === 'SKIPPED' ? 'badge-danger' :
                        'badge-neutral'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs ${
                        entry.priority >= 2 ? 'text-red-700' :
                        entry.priority === 1 ? 'text-amber-700' :
                        'text-slate-700'
                      }`}>
                        Priority {entry.priority}
                      </span>
                    </td>
                    <td className="text-sm">{entry.notes || '--'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {entry.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleComplete(entry.id)}
                            className="p-2 hover:bg-emerald-50 rounded-lg text-slate-600 hover:text-emerald-600 transition"
                            title="Mark Complete"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        {entry.status === 'WAITING' && (
                          <button
                            onClick={() => handleSkip(entry.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary-600 transition"
                            title="Skip"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHourglass className="text-slate-400 text-2xl" />
            </div>
            <p className="text-slate-500">Queue is empty</p>
            <p className="text-sm text-slate-400 mt-1">Add patients to get started</p>
          </div>
        )}
      </div>

      {/* Triage Guidelines */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Triage Priority Guidelines</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <FaExclamationTriangle className="text-red-600" />
            <div>
              <p className="font-medium text-red-700">Emergency (Priority 2)</p>
              <p className="text-xs text-red-600">Immediate care needed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <FaClock className="text-amber-600" />
            <div>
              <p className="font-medium text-amber-700">Urgent (Priority 1)</p>
              <p className="text-xs text-amber-600">Within 1 hour</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <FaUsers className="text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700">Routine (Priority 0)</p>
              <p className="text-xs text-emerald-600">First come, first served</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call Next Action */}
      {waitingCount > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleCallNext}
            className="btn-primary shadow-lg flex items-center gap-2 px-6 py-3"
          >
            <FaPhone />
            Call Next Patient ({waitingCount} waiting)
          </button>
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <AddToQueueModal
          patients={patients}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddToQueue}
        />
      )}
    </div>
  )
}

function AddToQueueModal({ patients, onClose, onSuccess }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [triageLevel, setTriageLevel] = useState('ROUTINE')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }

    setLoading(true)
    try {
      const priorityMap = { 'ROUTINE': 0, 'URGENT': 1, 'EMERGENCY': 2 }

      const success = await onSuccess({
        patientId: selectedPatient.id,
        priority: priorityMap[triageLevel],
        notes
      })

      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Failed to add to queue:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content !max-w-lg !w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header !py-2 !px-4">
          <h2 className="text-base font-semibold text-slate-900">Add to Queue</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-slate-500 text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <div className="bg-slate-100 rounded-lg p-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Search Patient</label>
              <div className="input-group flex-1">
                <FaSearch className="input-group-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-with-icon text-xs py-1"
                  placeholder="Search by name or phone..."
                />
              </div>
            </div>

            {selectedPatient && (
              <div className="mt-2 p-2 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-sm font-medium text-slate-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                <p className="text-xs text-slate-500">{selectedPatient.phone}</p>
              </div>
            )}

            {searchTerm && !selectedPatient && filteredPatients.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg">
                {filteredPatients.slice(0, 8).map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(patient)
                      setSearchTerm('')
                    }}
                    className="w-full text-left p-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-xs"
                  >
                    <p className="font-medium text-slate-900">{patient.firstName} {patient.lastName}</p>
                    <p className="text-slate-500">{patient.phone}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-100 rounded-lg p-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Triage Priority</label>
              <select
                value={triageLevel}
                onChange={(e) => setTriageLevel(e.target.value)}
                className="input text-xs py-1"
              >
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent (1 hour)</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Chief Complaint</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input text-xs py-1"
                rows="2"
                placeholder="Reason for visit..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs px-3 py-1.5 flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !selectedPatient} className="btn-primary text-xs px-3 py-1.5 flex-1">
              {loading ? 'Adding...' : 'Add to Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Queue
