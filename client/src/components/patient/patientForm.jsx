import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'

export default function PatientFormModal({ patient, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyContactRelation: '',
    status: 'ACTIVE',
    bloodType: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    occupation: '',
    maritalStatus: '',
    knownAllergies: '',
    chronicConditions: '',
    currentMedications: '',
    pastSurgeries: '',
    familyHistory: '',
    smokingStatus: '',
    alcoholUse: '',
    exerciseHabits: '',
    religion: ''
  })

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        emergencyPhone: patient.emergencyPhone || '',
        emergencyContactRelation: patient.emergencyContactRelation || '',
        status: patient.status || 'ACTIVE',
        bloodType: patient.bloodType || '',
        insuranceProvider: patient.insuranceProvider || '',
        insurancePolicyNumber: patient.insurancePolicyNumber || '',
        occupation: patient.occupation || '',
        maritalStatus: patient.maritalStatus || '',
        knownAllergies: Array.isArray(patient.knownAllergies) ? patient.knownAllergies.join(', ') : (typeof patient.knownAllergies === 'string' ? patient.knownAllergies : '') || '',
        chronicConditions: Array.isArray(patient.chronicConditions) ? patient.chronicConditions.join(', ') : (typeof patient.chronicConditions === 'string' ? patient.chronicConditions : '') || '',
        currentMedications: Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : (typeof patient.currentMedications === 'string' ? patient.currentMedications : '') || '',
        pastSurgeries: Array.isArray(patient.pastSurgeries) ? patient.pastSurgeries.join(', ') : (typeof patient.pastSurgeries === 'string' ? patient.pastSurgeries : '') || '',
        familyHistory: Array.isArray(patient.familyHistory) ? patient.familyHistory.join(', ') : (typeof patient.familyHistory === 'string' ? patient.familyHistory : '') || '',
        smokingStatus: patient.smokingStatus || '',
        alcoholUse: patient.alcoholUse || '',
        exerciseHabits: patient.exerciseHabits || '',
        religion: patient.religion || ''
      })
    }
  }, [patient])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Convert array fields from strings to arrays before submission
    const parseArrayField = (value) => {
      if (Array.isArray(value)) return value
      if (!value) return []
      return value.split(',').map(s => s.trim()).filter(Boolean)
    }

    const submissionData = {
      firstName: formData.firstName?.trim(),
      lastName: formData.lastName?.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone?.trim(),
      email: formData.email?.trim(),
      address: formData.address?.trim(),
      emergencyContact: formData.emergencyContact?.trim(),
      emergencyPhone: formData.emergencyPhone?.trim(),
      emergencyContactRelation: formData.emergencyContactRelation?.trim(),
      status: formData.status,
      bloodType: formData.bloodType,
      insuranceProvider: formData.insuranceProvider?.trim(),
      insurancePolicyNumber: formData.insurancePolicyNumber?.trim(),
      occupation: formData.occupation?.trim(),
      maritalStatus: formData.maritalStatus,
      knownAllergies: parseArrayField(formData.knownAllergies),
      chronicConditions: parseArrayField(formData.chronicConditions),
      currentMedications: parseArrayField(formData.currentMedications),
      pastSurgeries: parseArrayField(formData.pastSurgeries),
      familyHistory: parseArrayField(formData.familyHistory),
      smokingStatus: formData.smokingStatus,
      alcoholUse: formData.alcoholUse,
      exerciseHabits: formData.exerciseHabits,
      religion: formData.religion
    }

    console.log('Submitting patient data:', submissionData)
    onSubmit(submissionData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayField = (field, value) => {
    // always keep as string in form state for editing
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const inputClass = "input text-xs py-1"
  const labelClass = "block text-[10px] font-medium text-black mb-0.5"

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-content !max-w-5xl !w-[90vw] !max-h-[90vh] bg-white rounded-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header !py-2 !px-4">
          <h2 className="text-base font-semibold text-black">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <FaTimes className="text-black text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="col-span-2 md:col-span-4">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1">Basic Information</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className={inputClass} placeholder="First name" required />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className={inputClass} placeholder="Last name" required />
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
                    <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} className={inputClass} required>
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className={inputClass} placeholder="09123456789" required />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={inputClass} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select value={formData.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Occupation</label>
                    <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} className={inputClass} placeholder="Occupation" />
                  </div>
                  <div>
                    <label className={labelClass}>Religion</label>
                    <input type="text" value={formData.religion} onChange={(e) => handleChange('religion', e.target.value)} className={inputClass} placeholder="Religion" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Address</label>
                    <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className="input text-xs py-1" placeholder="Address" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 md:col-span-4">
              <div className="bg-emerald-50 rounded-lg p-2">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1">Clinical Information</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className={labelClass}>Blood Type</label>
                    <select value={formData.bloodType} onChange={(e) => handleChange('bloodType', e.target.value)} className={inputClass}>
                      <option value="">Unknown</option>
                      <option value="A_POSITIVE">A+</option>
                      <option value="A_NEGATIVE">A-</option>
                      <option value="B_POSITIVE">B+</option>
                      <option value="B_NEGATIVE">B-</option>
                      <option value="AB_POSITIVE">AB+</option>
                      <option value="AB_NEGATIVE">AB-</option>
                      <option value="O_POSITIVE">O+</option>
                      <option value="O_NEGATIVE">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Known Allergies <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.knownAllergies} onChange={(e) => handleArrayField('knownAllergies', e.target.value)} className={inputClass} placeholder="e.g., Penicillin, Peanuts" required />
                    <span className="text-[9px] text-black">Separate with commas</span>
                  </div>
                  <div>
                    <label className={labelClass}>Chronic Conditions</label>
                    <input type="text" value={formData.chronicConditions} onChange={(e) => handleArrayField('chronicConditions', e.target.value)} className={inputClass} placeholder="e.g., Diabetes, Hypertension" />
                    <span className="text-[9px] text-black">Separate with commas</span>
                  </div>
                  <div>
                    <label className={labelClass}>Current Medications</label>
                    <input type="text" value={formData.currentMedications} onChange={(e) => handleArrayField('currentMedications', e.target.value)} className={inputClass} placeholder="e.g., Metformin 500mg" />
                    <span className="text-[9px] text-black">Separate with commas</span>
                  </div>
                  <div>
                    <label className={labelClass}>Past Surgeries</label>
                    <input type="text" value={formData.pastSurgeries} onChange={(e) => handleArrayField('pastSurgeries', e.target.value)} className={inputClass} placeholder="e.g., Appendectomy 2020" />
                    <span className="text-[9px] text-black">Separate with commas</span>
                  </div>
                  <div>
                    <label className={labelClass}>Family History</label>
                    <input type="text" value={formData.familyHistory} onChange={(e) => handleChange('familyHistory', e.target.value)} className={inputClass} placeholder="Family history" />
                  </div>
                  <div>
                    <label className={labelClass}>Smoking Status</label>
                    <select value={formData.smokingStatus} onChange={(e) => handleChange('smokingStatus', e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      <option value="Never">Never</option>
                      <option value="Former">Former</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Alcohol Use</label>
                    <select value={formData.alcoholUse} onChange={(e) => handleChange('alcoholUse', e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      <option value="None">None</option>
                      <option value="Occasional">Occasional</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Heavy">Heavy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 md:col-span-4">
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wide mb-1">Insurance & Other</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className={labelClass}>Insurance Provider</label>
                    <input type="text" value={formData.insuranceProvider} onChange={(e) => handleChange('insuranceProvider', e.target.value)} className={inputClass} placeholder="Insurance" />
                  </div>
                  <div>
                    <label className={labelClass}>Policy Number</label>
                    <input type="text" value={formData.insurancePolicyNumber} onChange={(e) => handleChange('insurancePolicyNumber', e.target.value)} className={inputClass} placeholder="Policy #" />
                  </div>
                  <div>
                    <label className={labelClass}>Exercise Habits</label>
                    <select value={formData.exerciseHabits} onChange={(e) => handleChange('exerciseHabits', e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      <option value="None">None</option>
                      <option value="Light">Light</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Heavy">Heavy</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>

            <div className="col-span-2 md:col-span-4">
              <div className="bg-amber-50 rounded-lg p-2">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Emergency Contact</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className={labelClass}>Contact Name</label>
                    <input type="text" value={formData.emergencyContact} onChange={(e) => handleChange('emergencyContact', e.target.value)} className={inputClass} placeholder="Contact name" />
                  </div>
                  <div>
                    <label className={labelClass}>Relationship</label>
                    <input type="text" value={formData.emergencyContactRelation} onChange={(e) => handleChange('emergencyContactRelation', e.target.value)} className={inputClass} placeholder="Relationship" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" value={formData.emergencyPhone} onChange={(e) => handleChange('emergencyPhone', e.target.value)} className={inputClass} placeholder="09123456789" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black">
            <button type="button" onClick={onClose} className="btn-secondary text-xs px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs px-3 py-1.5">
              {patient ? 'Update' : 'Create'} Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
