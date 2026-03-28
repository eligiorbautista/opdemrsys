import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaEdit,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaSpinner,
  FaProcedures,
  FaHeart,
  FaHospital,
  FaFileMedical,
  FaStethoscope,
  FaPills,
  FaNotesMedical,
  FaClipboardCheck,
  FaClipboardList,
  FaChartLine
} from 'react-icons/fa'
import { toast, Toaster } from 'sonner'
import patientService from '../services/patientService'
import PatientFormModal from '../components/patient/patientForm'

function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [orders, setOrders] = useState({ labOrders: [], procedureOrders: [], followUpOrders: [], nursingOrders: [], referralOrders: [] })
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState('demographics')

  useEffect(() => {
    loadPatient()
    loadConsultations()
    loadOrders()
  }, [id])

  const loadPatient = async () => {
    try {
      const response = await patientService.getById(id)
      setPatient(response.data || response)
    } catch (error) {
      console.error('Failed to load patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConsultations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/consultations?patientId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.data) {
        setConsultations(data.data)
      }
    } catch (error) {
      console.error('Failed to load consultations:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token')

      const [labOrdersRes, procedureOrdersRes, followUpOrdersRes, nursingOrdersRes, referralOrdersRes] = await Promise.all([
        fetch(`/api/lab-orders/patient/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/procedure-orders/patient/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/follow-up-orders/patient/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/nursing-orders/patient/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/referral-orders/patient/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      const labOrders = (await labOrdersRes.json())?.data || []
      const procedureOrders = (await procedureOrdersRes.json())?.data || []
      const followUpOrders = (await followUpOrdersRes.json())?.data || []
      const nursingOrders = (await nursingOrdersRes.json())?.data || []
      const referralOrders = (await referralOrdersRes.json())?.data || []

      setOrders({
        labOrders,
        procedureOrders,
        followUpOrders,
        nursingOrders,
        referralOrders
      })
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await patientService.update(id, formData)
      setShowEditModal(false)
      loadPatient()
      toast.success('Patient updated successfully')
    } catch (error) {
      console.error('Failed to update patient:', error)
      toast.error('Failed to update patient')
    }
  }

  const openEditModal = () => {
    setShowEditModal(true)
  }

  const tabs = [
    { id: 'demographics', label: 'Demographics', icon: FaUser },
    { id: 'vitals', label: 'Vitals & History', icon: FaNotesMedical },
    { id: 'diagnosis', label: 'Diagnosis', icon: FaStethoscope },
    { id: 'orders', label: 'Orders', icon: FaClipboardCheck },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-2xl text-primary-600" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-black">Patient not found</p>
        <Link to="/patients" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Patients
        </Link>
      </div>
    )
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
      {/* Back Link */}
      <Link to="/patients" className="inline-flex items-center gap-2 text-black hover:text-black transition">
        <FaArrowLeft />
        <span>Back to Patients</span>
      </Link>

      {/* Patient Header */}
      <div className="card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <FaUser className="text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={getStatusBadge(patient.status)}>
                    {patient.status}
                  </span>
                  <span className="text-sm text-black">{patient.gender}</span>
                  <span className="text-sm text-black">DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '--'}</span>
                  {patient.bloodType && (
                    <span className="badge badge-info">Blood: {patient.bloodType.replace('_', ' ')}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={openEditModal} className="btn-primary">
              <FaEdit />
              Edit Patient
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-black">
        <nav className="flex gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-black hover:text-black hover:border-black'
              }`}
            >
              <tab.icon className="text-sm" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Demographics Tab */}
        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Contact Info */}
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2">
                    <FaPhone /> Contact Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-black">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-xs text-black">Phone</p>
                      <p className="font-medium text-black">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-black">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-xs text-black">Email</p>
                      <p className="font-medium text-black">{patient.email || 'Not provided'}</p>
                    </div>
                  </div>
                  {patient.address && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-black flex-shrink-0">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <p className="text-xs text-black">Address</p>
                        <p className="font-medium text-black">{patient.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2">
                    <FaUser /> Personal Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-black">Occupation</p>
                      <p className="font-medium text-black">{patient.occupation || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black">Marital Status</p>
                      <p className="font-medium text-black">{patient.maritalStatus || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black">Preferred Language</p>
                      <p className="font-medium text-black">{patient.preferredLanguage || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black">Registered</p>
                      <p className="font-medium text-black">
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2">
                    <FaHospital /> Insurance
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-black">Insurance Provider</p>
                    <p className="font-medium text-black">{patient.insuranceProvider || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black">Policy Number</p>
                    <p className="font-medium text-black">{patient.insurancePolicyNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black">Preferred Pharmacy</p>
                    <p className="font-medium text-black">{patient.preferredPharmacy || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title mb-0 flex items-center gap-2">
                  <FaPhoneAlt /> Emergency Contact
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-black">Contact Name</p>
                    <p className="font-medium text-black">{patient.emergencyContact || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black">Relationship</p>
                    <p className="font-medium text-black">{patient.emergencyContactRelation || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black">Phone</p>
                    <p className="font-medium text-black">{patient.emergencyPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vitals & History Tab */}
        {activeTab === 'vitals' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Allergies & Conditions */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title mb-0 flex items-center gap-2 text-red-600">
                  <FaProcedures /> Allergies & Conditions
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-black mb-2">Known Allergies</p>
                  {patient.knownAllergies && patient.knownAllergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.knownAllergies.map((allergy, idx) => (
                        <span key={idx} className="badge badge-danger">{allergy}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">No allergies recorded</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black mb-2">Chronic Conditions</p>
                  {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.chronicConditions.map((condition, idx) => (
                        <span key={idx} className="badge badge-warning">{condition}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">None recorded</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black mb-2">Past Surgeries</p>
                  {patient.pastSurgeries && patient.pastSurgeries.length > 0 ? (
                    <ul className="list-disc list-inside text-black space-y-1">
                      {patient.pastSurgeries.map((surgery, idx) => (
                        <li key={idx}>{surgery}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-black">None recorded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Medications */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title mb-0 flex items-center gap-2 text-blue-600">
                  <FaPills /> Current Medications
                </h2>
              </div>
              <div className="p-6">
                {patient.currentMedications && patient.currentMedications.length > 0 ? (
                  <ul className="space-y-2">
                    {patient.currentMedications.map((med, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-black">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {med}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black">No current medications recorded</p>
                )}
              </div>
            </div>

            {/* Social History */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title mb-0 flex items-center gap-2">
                  <FaHeart /> Social History
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-100 rounded-lg">
                    <p className="text-xs text-black mb-1">Smoking</p>
                    <p className="font-semibold text-black">{patient.smokingStatus || 'Unknown'}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-100 rounded-lg">
                    <p className="text-xs text-black mb-1">Alcohol</p>
                    <p className="font-semibold text-black">{patient.alcoholUse || 'Unknown'}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-100 rounded-lg">
                    <p className="text-xs text-black mb-1">Exercise</p>
                    <p className="font-semibold text-black">{patient.exerciseHabits || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis Tab */}
        {activeTab === 'diagnosis' && (
          <div className="card">
            <div className="card-header">
              <h2 className="section-title mb-0 flex items-center gap-2">
                <FaFileMedical /> Clinical Notes & Diagnosis
              </h2>
            </div>
            <div className="p-6">
              {consultations && consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.slice(0, 5).map((consultation) => (
                    <div key={consultation.id} className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FaStethoscope className="text-primary-600" />
                          <span className="font-medium text-black">
                            Dr. {consultation.doctor?.firstName} {consultation.doctor?.lastName}
                          </span>
                        </div>
                        <span className="text-xs text-black">
                          {consultation.createdAt ? new Date(consultation.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      {consultation.diagnosis && (
                        <p className="text-sm text-black mb-2">
                          <span className="font-medium">Diagnosis:</span> {consultation.diagnosis}
                        </p>
                      )}
                      {consultation.icd10Code && (
                        <p className="text-xs text-black">
                          ICD-10: {consultation.icd10Code}
                        </p>
                      )}
                      {consultation.plan && (
                        <div className="mt-2">
                          <p className="text-sm text-black">
                            <span className="font-medium">Plan:</span> {consultation.plan}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileMedical className="text-black text-2xl" />
                  </div>
                  <p className="text-black">No clinical notes recorded</p>
                  <p className="text-sm text-black mt-1">Consultation notes will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Lab Orders */}
            {(orders.labOrders?.length > 0) && (
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2 text-blue-600">
                    <FaClipboardCheck /> Lab Orders
                  </h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order Type</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Ordered Date</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.labOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.type}</td>
                            <td>
                              <span className={`badge ${
                                order.priority === 'STAT' ? 'badge-danger' :
                                order.priority === 'URGENT' ? 'badge-warning' :
                                'badge-neutral'
                              }`}>
                                {order.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                order.status === 'COMPLETED' ? 'badge-success' :
                                order.status === 'IN_PROGRESS' ? 'badge-info' :
                                order.status === 'CANCELLED' ? 'badge-neutral' :
                                'badge-warning'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{order.orderedDate ? new Date(order.orderedDate).toLocaleDateString() : '--'}</td>
                            <td>{order.instructions || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Procedure Orders */}
            {(orders.procedureOrders?.length > 0) && (
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2 text-purple-600">
                    <FaProcedures /> Procedure Orders
                  </h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Procedure</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Scheduled</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.procedureOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.description || order.procedureType || 'N/A'}</td>
                            <td>
                              <span className={`badge ${
                                order.priority === 'STAT' ? 'badge-danger' :
                                order.priority === 'URGENT' ? 'badge-warning' :
                                'badge-neutral'
                              }`}>
                                {order.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                order.status === 'COMPLETED' ? 'badge-success' :
                                order.status === 'IN_PROGRESS' ? 'badge-info' :
                                order.status === 'CANCELLED' ? 'badge-neutral' :
                                'badge-warning'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{order.performedAt ? new Date(order.performedAt).toLocaleDateString() : order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '--'}</td>
                            <td>{order.instructions || 'Follow standard protocol'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up Orders */}
            {(orders.followUpOrders?.length > 0) && (
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2 text-emerald-600">
                    <FaClock /> Follow-up Orders
                  </h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Follow-up Date</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.followUpOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.followUpDate ? new Date(order.followUpDate).toLocaleDateString() : '--'}</td>
                            <td>{order.reason}</td>
                            <td>
                              <span className={`badge ${
                                order.status === 'COMPLETED' ? 'badge-success' :
                                order.status === 'CANCELLED' ? 'badge-neutral' :
                                'badge-warning'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{order.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Nursing Orders */}
            {(orders.nursingOrders?.length > 0) && (
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2 text-cyan-600">
                    <FaClipboardList /> Nursing Orders
                  </h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Frequency</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.nursingOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.type}</td>
                            <td>{order.frequency}</td>
                            <td>
                              <span className={`badge ${
                                order.priority === 'URGENT' ? 'badge-warning' :
                                'badge-neutral'
                              }`}>
                                {order.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                order.status === 'COMPLETED' ? 'badge-success' :
                                order.status === 'DISCONTINUED' ? 'badge-neutral' :
                                'badge-info'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{order.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Orders */}
            {(orders.referralOrders?.length > 0) && (
              <div className="card">
                <div className="card-header">
                  <h2 className="section-title mb-0 flex items-center gap-2 text-orange-600">
                    <FaHospital /> Referral Orders
                  </h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Specialty</th>
                          <th>Referred To</th>
                          <th>Urgency</th>
                          <th>Status</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.referralOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.specialty}</td>
                            <td>{order.referredTo}</td>
                            <td>
                              <span className={`badge ${
                                order.urgency === 'STAT' ? 'badge-danger' :
                                order.urgency === 'URGENT' ? 'badge-warning' :
                                'badge-neutral'
                              }`}>
                                {order.urgency}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                order.status === 'ACCEPTED' ? 'badge-success' :
                                order.status === 'SCHEDULED' ? 'badge-info' :
                                order.status === 'PENDING' ? 'badge-warning' :
                                'badge-neutral'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{order.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {!orders.labOrders?.length && !orders.procedureOrders?.length && !orders.followUpOrders?.length &&
             !orders.nursingOrders?.length && !orders.referralOrders?.length && (
              <div className="card">
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaClipboardCheck className="text-black text-2xl" />
                  </div>
                  <p className="text-black">No orders recorded</p>
                  <p className="text-sm text-black mt-1">Lab orders, prescriptions, and other orders will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Toaster position="bottom-right" richColors />

      {showEditModal && (
        <PatientFormModal
          patient={patient}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  )
}

export default PatientDetail
