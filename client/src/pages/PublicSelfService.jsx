import { useState, useEffect } from 'react'
import { 
  FaHeartbeat, 
  FaUserPlus, 
  FaPhone, 
  FaSearch, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaCalendarCheck,
  FaClock,
  FaUsers,
  FaArrowRight,
  FaSpinner,
  FaTicketAlt
} from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function PublicSelfService() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [step, setStep] = useState('phone') // phone, details, confirm, success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queueStatus, setQueueStatus] = useState(null)
  
  // Form data
  const [phone, setPhone] = useState('')
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    address: ''
  })
  const [priority, setPriority] = useState('0') // 0=ROUTINE, 1=URGENT, 2=EMERGENCY
  const [notes, setNotes] = useState('')
  
  // Result data
  const [registrationResult, setRegistrationResult] = useState(null)
  const [existingPatient, setExistingPatient] = useState(null)

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    // Load queue status
    loadQueueStatus()
    const statusInterval = setInterval(loadQueueStatus, 30000) // Refresh every 30 seconds
    
    return () => {
      clearInterval(clockInterval)
      clearInterval(statusInterval)
    }
  }, [])

  const loadQueueStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/public/queue-status`)
      const data = await response.json()
      if (data.success) {
        setQueueStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to load queue status:', error)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-PH', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-PH', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handlePhoneLookup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/public/patients/lookup?phone=${encodeURIComponent(phone)}`)
      const data = await response.json()
      
      if (data.success) {
        if (data.data) {
          // Existing patient
          setExistingPatient(data.data)
          setPatientData({
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split('T')[0] : '',
            gender: data.data.gender,
            email: data.data.email || '',
            address: data.data.address || ''
          })
        }
        setStep('details')
      } else {
        setError(data.error || 'Failed to lookup patient')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/public/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...patientData,
          phone,
          priority: parseInt(priority),
          notes
        })
      })

      const data = await response.json()

      if (data.success) {
        setRegistrationResult(data.data)
        setStep('success')
      } else {
        if (data.data?.queueNumber) {
          // Already in queue
          setRegistrationResult(data.data)
          setStep('success')
        } else {
          setError(data.error || 'Registration failed')
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityLabel = (value) => {
    switch (value) {
      case '2': return { label: 'Emergency', color: 'text-red-400', bg: 'bg-red-500/20' }
      case '1': return { label: 'Urgent', color: 'text-orange-400', bg: 'bg-orange-500/20' }
      default: return { label: 'Routine', color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
    }
  }

  const resetForm = () => {
    setStep('phone')
    setPhone('')
    setPatientData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      address: ''
    })
    setPriority('0')
    setNotes('')
    setRegistrationResult(null)
    setExistingPatient(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header - Matches QueueDisplay styling */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FaHeartbeat className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Self-Service Registration</h1>
              <p className="text-white/70 text-sm">OPD Queue Registration</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{formatTime(currentTime)}</p>
            <p className="text-white/70 text-sm">{formatDate(currentTime)}</p>
          </div>
        </div>
      </header>

      {/* Queue Status Bar */}
      {queueStatus && (
        <div className="bg-white/5 border-b border-white/10 px-8 py-3">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <FaUsers className="text-blue-400" />
              <span className="text-white/70">Waiting:</span>
              <span className="text-white font-bold">{queueStatus.waitingCount}</span>
            </div>
            {queueStatus.currentlyServing && (
              <div className="flex items-center gap-2">
                <FaTicketAlt className="text-emerald-400" />
                <span className="text-white/70">Now Serving:</span>
                <span className="text-emerald-400 font-bold">#{queueStatus.currentlyServing.queueNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'phone' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'}`}>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</span>
                <span>Phone</span>
              </div>
              <FaArrowRight className="text-white/30" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'details' ? 'bg-emerald-500 text-white' : step === 'success' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'}`}>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</span>
                <span>Details</span>
              </div>
              <FaArrowRight className="text-white/30" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'success' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'}`}>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</span>
                <span>Done</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-2xl p-4 flex items-center gap-3">
              <FaExclamationTriangle className="text-red-400 text-xl flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Step 1: Phone Lookup */}
          {step === 'phone' && (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPhone className="text-emerald-400 text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Enter Your Phone Number</h2>
                <p className="text-white/70">We'll check if you're already registered in our system</p>
              </div>

              <form onSubmit={handlePhoneLookup} className="space-y-6">
                <div>
                  <label className="block text-white/70 mb-2">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09XX XXX XXXX"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 text-lg"
                      required
                    />
                    <FaPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Check Registration
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Patient Details */}
          {step === 'details' && (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserPlus className="text-blue-400 text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {existingPatient ? 'Welcome Back!' : 'Complete Your Registration'}
                </h2>
                {existingPatient && (
                  <p className="text-emerald-400 flex items-center justify-center gap-2">
                    <FaCheckCircle />
                    We found your record. Please verify and update if needed.
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={patientData.firstName}
                      onChange={(e) => setPatientData({...patientData, firstName: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={patientData.lastName}
                      onChange={(e) => setPatientData({...patientData, lastName: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={patientData.dateOfBirth}
                      onChange={(e) => setPatientData({...patientData, dateOfBirth: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 mb-2">Gender *</label>
                    <select
                      value={patientData.gender}
                      onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                      required
                    >
                      <option value="" className="bg-slate-800">Select Gender</option>
                      <option value="MALE" className="bg-slate-800">Male</option>
                      <option value="FEMALE" className="bg-slate-800">Female</option>
                      <option value="OTHER" className="bg-slate-800">Other</option>
                    </select>
                  </div>
                </div>

                {/* Optional Fields */}
                <div>
                  <label className="block text-white/70 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={patientData.email}
                    onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2">Address (Optional)</label>
                  <input
                    type="text"
                    value={patientData.address}
                    onChange={(e) => setPatientData({...patientData, address: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-white/70 mb-3">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: '0', label: 'Routine', color: 'emerald', icon: FaCalendarCheck },
                      { value: '1', label: 'Urgent', color: 'orange', icon: FaExclamationTriangle },
                      { value: '2', label: 'Emergency', color: 'red', icon: FaHeartbeat }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPriority(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          priority === option.value
                            ? `border-${option.color}-400 bg-${option.color}-500/20`
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <option.icon className={`text-${option.color}-400 text-2xl`} />
                        <span className={`text-${option.color}-400 font-semibold`}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chief Complaint */}
                <div>
                  <label className="block text-white/70 mb-2">Reason for Visit / Chief Complaint</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-500/30"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <FaTicketAlt />
                      Join Queue
                    </>
                  )}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white/70 py-3 rounded-xl transition-all"
                >
                  Back to Phone Entry
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && registrationResult && (
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md rounded-3xl border border-emerald-400/30 p-8 text-center">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/50">
                <FaTicketAlt className="text-white text-4xl" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {registrationResult.isExistingPatient ? 'Welcome Back!' : 'Registration Complete!'}
              </h2>
              
              <div className="my-8">
                <p className="text-white/70 mb-2">Your Queue Number</p>
                <div className="text-8xl font-bold text-emerald-400 mb-4">
                  #{registrationResult.queueEntry.queueNumber}
                </div>
                <p className="text-xl text-white">
                  {registrationResult.patient.firstName} {registrationResult.patient.lastName}
                </p>
              </div>

              {/* Queue Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 rounded-2xl p-4">
                  <FaClock className="text-blue-400 text-2xl mx-auto mb-2" />
                  <p className="text-white/70 text-sm">Est. Wait Time</p>
                  <p className="text-white font-bold text-lg">
                    {registrationResult.queueEntry.estimatedWaitMinutes} mins
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  {(() => {
                    const priority = getPriorityLabel(registrationResult.queueEntry.priority.toString())
                    return (
                      <>
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${priority.bg.replace('/20', '')}`} />
                        <p className="text-white/70 text-sm">Priority</p>
                        <p className={`font-bold text-lg ${priority.color}`}>{priority.label}</p>
                      </>
                    )
                  })()}
                </div>
              </div>

              <p className="text-white/70 mb-6">
                Please wait in the waiting area. You will be called when it's your turn.
              </p>

              <button
                onClick={resetForm}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl transition-all"
              >
                Register Another Patient
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 px-8 py-6">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaHeartbeat className="text-emerald-400 text-xl" />
              <span className="text-white/70">Self-Service Queue</span>
            </div>
            <p className="text-white/50 text-sm">Quick and Easy Registration</p>
          </div>
          <div className="text-center border-l border-white/10 pl-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaCalendarCheck className="text-blue-400 text-xl" />
              <span className="text-white/70">No Login Required</span>
            </div>
            <p className="text-white/50 text-sm">Walk-in Welcome</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicSelfService
