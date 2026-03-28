# OPDEMRSYS - System Flow Guide

## What is OPDEMRSYS?

OPDEMRSYS is a digital Outpatient Department (OPD) Electronic Medical Records system that helps clinics and hospitals manage patient visits from registration to treatment.

---

## System Users & Roles

| Role | What They Do |
|------|-------------|
| **Admin** | Manages users, system settings, and views reports |
| **Doctor** | Examines patients, creates diagnoses, and prescribes treatments |
| **Nurse** | Records patient vital signs and initial assessments |
| **Clinic Staff** | Registers patients and manages the queue |
| **Student** | View-only access for learning purposes |

---

## Patient Journey Flow

```
┌─────────────────┐
│  1. REGISTRATION │  ← Clinic Staff creates patient record
│    (Patients)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   2. QUEUE      │  ← Patient added to waiting list
│    (Queue)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. NURSE CHECK │  ← Nurse records vital signs (BP, temp, etc.)
│  (Nurse Doc)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. DOCTOR VISIT │  ← Doctor examines, diagnoses, prescribes
│ (Consultation)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   5. PHARMACY   │  ← Prescription generated for medicines
│  (Prescription) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   6. COMPLETE   │  ← Visit ends, records saved
│    (History)    │
└─────────────────┘
```

---

## Detailed Workflow

### Step 1: Patient Registration
**Who:** Clinic Staff  
**Where:** Patients Page

- Search if patient exists (by name or phone)
- If new: Create patient profile
  - Name, Age, Gender, Contact
  - Address, Emergency Contact
  - Medical History (optional)
- System generates unique Patient ID

### Step 2: Add to Queue
**Who:** Clinic Staff  
**Where:** Queue Page

- Select patient from list
- Choose visit type:
  - New Consultation
  - Follow-up
  - Emergency
- Patient appears in waiting queue

### Step 3: Nurse Assessment
**Who:** Nurse  
**Where:** Nurse Documentation Page

- Calls next patient from queue
- Records:
  - Vital Signs (BP, Temperature, Pulse, etc.)
  - Chief Complaint (why patient came)
  - Pain Level
  - Initial Notes
- Marks patient as "Ready for Doctor"

### Step 4: Doctor Consultation
**Who:** Doctor  
**Where:** Doctor Consultation Page

- Reviews nurse assessment
- Examines patient
- Creates:
  - Diagnosis (ICD codes)
  - Treatment Plan
  - Prescriptions (medicines with dosage)
  - Lab Orders (if needed)
  - Follow-up instructions
- Marks visit as "Completed"

### Step 5: Prescription & Orders
**Who:** System / Pharmacy  
**Where:** Generated automatically

- Prescription printed/PDF generated
- Medicine list sent to pharmacy
- Lab orders logged for lab staff

### Step 6: Patient History
**Who:** Any authorized user  
**Where:** Patient Detail Page

- Complete visit history stored
- Previous diagnoses viewable
- Past prescriptions accessible
- Audit trail of all actions

---

## Key Features

### For Admins:
- User management (create/disable accounts)
- Role assignment
- System reports & analytics
- Audit logs (who did what, when)

### For Doctors:
- Quick patient lookup
- Digital prescription writing
- ICD-10 diagnosis codes
- Medical history access
- Queue management

### For Nurses:
- Vital signs recording
- Patient queue view
- Pre-consultation assessment
- Allergies & alerts display

### For Clinic Staff:
- Patient registration
- Queue management
- Appointment scheduling
- Basic patient search

---

## Data Security

- All data is encrypted
- Role-based access (users only see what they need)
- Complete audit trail
- Automatic backups
- HIPAA-compliant logging

---

## Quick Access Guide

| If you need to... | Go to... |
|------------------|----------|
| Register a new patient | Patients → Add New |
| See who's waiting | Queue |
| Record vital signs | Nurse Documentation |
| Examine a patient | Doctor Consultation |
| View patient history | Patient Detail |
| Generate reports | Admin Dashboard |
| Manage users | Admin → User Management |

---

## Common Tasks

### Registering a Patient:
1. Click "Patients" in menu
2. Click "Add New Patient"
3. Fill required fields (*)
4. Click Save
5. Patient can now be added to queue

### Starting a Consultation:
1. Go to "Queue" page
2. Find patient status = "With Nurse" or "Waiting"
3. Click patient name
4. Review nurse notes
5. Add diagnosis and prescription
6. Click "Complete Visit"

### Finding Patient History:
1. Go to "Patients" page
2. Search by name or phone
3. Click patient name
4. View all past visits on right panel

---

## Support

For technical issues or questions:
- Check system settings for your role permissions
- Contact system administrator
- Review audit logs for action history

---

**System Name:** OPDEMRSYS  
**Version:** 1.0.0  
**Last Updated:** March 2026
