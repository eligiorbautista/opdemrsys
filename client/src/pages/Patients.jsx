import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaUser,
  FaCalendar,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaSpinner,
  FaPlusCircle,
  FaNotesMedical,
  FaFileMedicalAlt,
  FaProcedures,
  FaClipboardList
} from 'react-icons/fa'
import { toast } from 'sonner'
import Dialog from '../components/ui/Dialog'
import patientService from '../services/patientService'
import PatientFormModal from '../components/patient/patientForm'

function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    patientId: null,
    patientName: ''
  })
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    loadPatients()
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.pointerEvents = 'auto'
    }
  }, [])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const data = await patientService.getAll()
      setPatients(data.data || data)
    } catch (error) {
      console.error('Failed to load patients:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = search
        ? await patientService.search(search)
        : await patientService.getAll()
      setPatients(data.data || data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(formData) {
    try {
      console.log('Sending POST request to /patients:', formData)
      const response = await patientService.create(formData)
      console.log('Create response:', response)
      setShowModal(false)
      setSelectedPatient(null)
      loadPatients()
      toast.success('Patient created successfully')
    } catch (error) {
      console.error('Failed to create patient:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)

      let errorMessage = 'Failed to create patient'

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage, { duration: 10000 })
    }
  }

  async function handleUpdate(id, formData) {
    try {
      await patientService.update(id, formData)
      setShowModal(false)
      setSelectedPatient(null)
      loadPatients()
      toast.success('Patient updated successfully')
    } catch (error) {
      console.error('Failed to update patient:', error)
      toast.error('Failed to update patient')
    }
  }

  async function openEditModal(patient) {
    try {
      const response = await patientService.getById(patient.id)
      setSelectedPatient(response.data || response)
      setShowModal(true)
    } catch (error) {
      console.error('Failed to load patient details:', error)
      toast.error('Failed to load patient details')
    }
  }

  function openDeleteDialog(id, name) {
    setDeleteDialog({ isOpen: true, patientId: id, patientName: name })
  }

  async function confirmDelete() {
    try {
      await patientService.delete(deleteDialog.patientId)
      toast.success('Patient deleted successfully')
    } catch (error) {
      console.error('Failed to delete patient:', error)
      toast.error('Failed to delete patient')
    }
    setDeleteDialog({ isOpen: false, patientId: null, patientName: '' })
    loadPatients()
  }

  function openCreateModal() {
    setSelectedPatient(null)
    setShowModal(true)
  }

  function handleDoubleClick(patientId) {
    navigate(`/patients/${patientId}`)
  }

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'badge-success',
      INACTIVE: 'badge-neutral',
      SUSPENDED: 'badge-warning',
    }
    return styles[status] || 'badge-neutral'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">Manage patient records and clinical information</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <FaPlus />
          Add Patient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Patients</p>
              <p className="text-2xl font-bold text-black mt-1">{patients.length || 0}</p>
            </div>
            <div className="stat-card-icon bg-blue-50 text-blue-600">
              <FaUser />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Active</p>
              <p className="text-2xl font-bold text-black mt-1">
                {patients.filter(p => p.status === 'ACTIVE').length || 0}
              </p>
            </div>
            <div className="stat-card-icon bg-emerald-50 text-emerald-600">
              <FaNotesMedical />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">New This Week</p>
              <p className="text-2xl font-bold text-black mt-1">0</p>
            </div>
            <div className="stat-card-icon bg-purple-50 text-purple-600">
              <FaPlusCircle />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">With Allergies</p>
              <p className="text-2xl font-bold text-black mt-1">--</p>
            </div>
            <div className="stat-card-icon bg-amber-50 text-amber-600">
              <FaProcedures />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="input-group flex-1">
            <FaSearch className="input-group-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or ID..."
              className="input input-with-icon"
            />
          </div>
          <button type="submit" className="btn-secondary">
            <FaSearch />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>
      </div>

      {/* Patients Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-primary-600" />
          </div>
        ) : patients?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Blood Type</th>
                  <th>Insurance</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    onDoubleClick={() => handleDoubleClick(patient.id)}
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-black">
                          <FaUser />
                        </div>
                        <div>
                          <p className="font-medium text-black">{patient.firstName} {patient.lastName}</p>
                          <p className="text-xs text-black">{patient.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{patient.phone}</td>
                    <td>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '--'}</td>
                    <td>{patient.bloodType || '--'}</td>
                    <td>{patient.insuranceProvider || '--'}</td>
                    <td>
                      <span className={getStatusBadge(patient.status)}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="p-2 hover:bg-blue-50 rounded-lg text-black hover:text-blue-600 transition"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => openEditModal(patient)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-black hover:text-primary-600 transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(patient.id, `${patient.firstName} ${patient.lastName}`)}
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
              <FaUser className="text-black text-2xl" />
            </div>
            <p className="text-black">No patients found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PatientFormModal
          patient={selectedPatient}
          onClose={() => setShowModal(false)}
          onSubmit={selectedPatient ? (data) => handleUpdate(selectedPatient.id, data) : handleCreate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete ${deleteDialog.patientName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default Patients