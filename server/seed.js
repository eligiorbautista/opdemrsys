const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.queueEntry.deleteMany({})
  await prisma.queue.deleteMany({})
  await prisma.patient.deleteMany({})
  await prisma.user.deleteMany({})

  // Create admin users
  console.log('👤 Creating admin users...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@opd.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
      phone: '09123456789'
    }
  })

  // Create elidev admin user
  const elidevPassword = await bcrypt.hash('00000000', 10)
  const elidev = await prisma.user.create({
    data: {
      email: 'elidev@opd.com',
      password: elidevPassword,
      firstName: 'Eli',
      lastName: 'Dev',
      role: 'ADMIN',
      isActive: true,
      phone: '09999999999'
    }
  })
  console.log(`  ✓ Created admin: elidev@opd.com`)

  // Create doctors
  console.log('👨‍⚕️ Creating doctors...')
  const doctorPassword = await bcrypt.hash('doctor123', 10)
  const doctors = await prisma.user.createMany({
    data: [
      {
        email: 'doctor1@opd.com',
        password: doctorPassword,
        firstName: 'Maria',
        lastName: 'Santos',
        role: 'DOCTOR',
        isActive: true,
        phone: '09123456780',
        specialization: 'General Medicine',
        department: 'OPD',
        availabilitySchedule: JSON.stringify([
          { day: 'Monday', startTime: '08:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '08:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '17:00' },
          { day: 'Friday', startTime: '08:00', endTime: '17:00' }
        ])
      },
      {
        email: 'doctor2@opd.com',
        password: doctorPassword,
        firstName: 'Juan',
        lastName: 'Reyes',
        role: 'DOCTOR',
        isActive: true,
        phone: '09123456781',
        specialization: 'Internal Medicine',
        department: 'OPD',
        availabilitySchedule: JSON.stringify([
          { day: 'Monday', startTime: '09:00', endTime: '18:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '18:00' },
          { day: 'Friday', startTime: '09:00', endTime: '18:00' }
        ])
      },
      {
        email: 'doctor3@opd.com',
        password: doctorPassword,
        firstName: 'Anna',
        lastName: 'Cruz',
        role: 'DOCTOR',
        isActive: true,
        phone: '09123456782',
        specialization: 'Pediatrics',
        department: 'OPD',
        availabilitySchedule: JSON.stringify([
          { day: 'Monday', startTime: '10:00', endTime: '19:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '19:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '19:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '19:00' },
          { day: 'Friday', startTime: '10:00', endTime: '19:00' }
        ])
      }
    ]
  })

  // Create nurses
  console.log('👩‍⚕️ Creating nurses...')
  const nursePassword = await bcrypt.hash('nurse123', 10)
  const nurses = await prisma.user.createMany({
    data: [
      {
        email: 'nurse1@opd.com',
        password: nursePassword,
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'NURSE',
        isActive: true,
        phone: '09123456783',
        department: 'OPD',
        certificationLevel: 'RN'
      },
      {
        email: 'nurse2@opd.com',
        password: nursePassword,
        firstName: 'Pedro',
        lastName: 'Dela Cruz',
        role: 'NURSE',
        isActive: true,
        phone: '09123456784',
        department: 'OPD',
        certificationLevel: 'BSN'
      }
    ]
  })

  // Create mock patients
  console.log('🏥 Creating patients...')
  const patientsData = [
    {
      firstName: 'Jose',
      lastName: 'Rizal',
      dateOfBirth: new Date('1985-06-19'),
      gender: 'MALE',
      phone: '09171111111',
      email: 'jose.rizal@email.com',
      address: '123 Calle Real, Manila',
      emergencyContact: 'Maria Rizal',
      emergencyPhone: '09172222222',
      bloodType: 'O_POSITIVE',
      insuranceProvider: 'PhilHealth',
      status: 'ACTIVE'
    },
    {
      firstName: 'Maria',
      lastName: 'Clara',
      dateOfBirth: new Date('1990-03-15'),
      gender: 'FEMALE',
      phone: '09173333333',
      email: 'maria.clara@email.com',
      address: '456 Kalye Makiling, Laguna',
      emergencyContact: 'Padre Damaso',
      emergencyPhone: '09174444444',
      bloodType: 'A_POSITIVE',
      insuranceProvider: 'Maxicare',
      status: 'ACTIVE'
    },
    {
      firstName: 'Andres',
      lastName: 'Bonifacio',
      dateOfBirth: new Date('1978-11-30'),
      gender: 'MALE',
      phone: '09175555555',
      email: 'andres.bonifacio@email.com',
      address: '789 Tondo, Manila',
      emergencyContact: 'Gregoria de Jesus',
      emergencyPhone: '09176666666',
      bloodType: 'B_POSITIVE',
      insuranceProvider: 'Medicard',
      status: 'ACTIVE'
    },
    {
      firstName: 'Gabriela',
      lastName: 'Silang',
      dateOfBirth: new Date('1992-07-22'),
      gender: 'FEMALE',
      phone: '09177777777',
      email: 'gabriela.silang@email.com',
      address: '321 Ilocos Sur',
      emergencyContact: 'Diego Silang',
      emergencyPhone: '09178888888',
      bloodType: 'AB_POSITIVE',
      insuranceProvider: 'PhilHealth',
      status: 'ACTIVE'
    },
    {
      firstName: 'Emilio',
      lastName: 'Aguinaldo',
      dateOfBirth: new Date('1980-01-01'),
      gender: 'MALE',
      phone: '09179999999',
      email: 'emilio.aguinaldo@email.com',
      address: '654 Kawit, Cavite',
      emergencyContact: 'Hilaria Aguinaldo',
      emergencyPhone: '09170000000',
      bloodType: 'O_NEGATIVE',
      insuranceProvider: 'Intellicare',
      status: 'ACTIVE'
    },
    {
      firstName: 'Melchora',
      lastName: 'Aquino',
      dateOfBirth: new Date('1945-05-15'),
      gender: 'FEMALE',
      phone: '09171234567',
      email: 'melchora.aquino@email.com',
      address: '987 Balintawak, Quezon City',
      emergencyContact: 'Juan Aquino',
      emergencyPhone: '09172345678',
      bloodType: 'A_NEGATIVE',
      insuranceProvider: 'PhilHealth',
      status: 'ACTIVE'
    },
    {
      firstName: 'Antonio',
      lastName: 'Luna',
      dateOfBirth: new Date('1988-09-25'),
      gender: 'MALE',
      phone: '09173456789',
      email: 'antonio.luna@email.com',
      address: '147 Binondo, Manila',
      emergencyContact: 'Isabel Luna',
      emergencyPhone: '09174567890',
      bloodType: 'B_NEGATIVE',
      insuranceProvider: 'AXA',
      status: 'ACTIVE'
    },
    {
      firstName: 'Apolinario',
      lastName: 'Mabini',
      dateOfBirth: new Date('1975-12-12'),
      gender: 'MALE',
      phone: '09175678901',
      email: 'apolinario.mabini@email.com',
      address: '258 Tanauan, Batangas',
      emergencyContact: 'Agueda Mabini',
      emergencyPhone: '09176789012',
      bloodType: 'AB_NEGATIVE',
      insuranceProvider: 'PhilHealth',
      status: 'ACTIVE'
    },
    {
      firstName: 'Marcelo',
      lastName: 'Del Pilar',
      dateOfBirth: new Date('1982-04-05'),
      gender: 'MALE',
      phone: '09177890123',
      email: 'marcelo.delpilar@email.com',
      address: '369 Bulacan',
      emergencyContact: 'Carmen Del Pilar',
      emergencyPhone: '09178901234',
      bloodType: 'O_POSITIVE',
      insuranceProvider: 'Cocolife',
      status: 'ACTIVE'
    },
    {
      firstName: 'Graciano',
      lastName: 'Lopez Jaena',
      dateOfBirth: new Date('1995-08-18'),
      gender: 'MALE',
      phone: '09179012345',
      email: 'graciano.lopez@email.com',
      address: '741 Iloilo City',
      emergencyContact: 'Maria Lopez',
      emergencyPhone: '09170123456',
      bloodType: 'A_POSITIVE',
      insuranceProvider: 'PhilHealth',
      status: 'ACTIVE'
    },
    {
      firstName: 'Teresa',
      lastName: 'Magbanua',
      dateOfBirth: new Date('1991-11-03'),
      gender: 'FEMALE',
      phone: '09171334567',
      email: 'teresa.magbanua@email.com',
      address: '852 Pototan, Iloilo',
      emergencyContact: 'Alejandro Magbanua',
      emergencyPhone: '09172345678',
      bloodType: 'B_POSITIVE',
      insuranceProvider: 'Medicard',
      status: 'ACTIVE'
    },
    {
      firstName: 'Gregoria',
      lastName: 'De Jesus',
      dateOfBirth: new Date('1987-02-28'),
      gender: 'FEMALE',
      phone: '09173456790',
      email: 'gregoria.dejesus@email.com',
      address: '963 Caloocan',
      emergencyContact: 'Andres Bonifacio',
      emergencyPhone: '09174567890',
      bloodType: 'AB_POSITIVE',
      insuranceProvider: 'Maxicare',
      status: 'ACTIVE'
    }
  ]

  const patients = []
  for (const patientData of patientsData) {
    const patient = await prisma.patient.create({
      data: patientData
    })
    patients.push(patient)
    console.log(`  ✓ Created patient: ${patient.firstName} ${patient.lastName}`)
  }

  // Create today's queue
  console.log('📋 Creating queue for today...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const queue = await prisma.queue.create({
    data: {
      name: `OPD Queue ${today.toLocaleDateString('en-PH')}`,
      date: today,
      isActive: true
    }
  })

  // Create queue entries with different statuses
  console.log('🎫 Creating queue entries...')
  const queueStatuses = ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'WAITING', 'WAITING', 'WAITING']
  const priorities = [0, 1, 2, 0, 0, 3, 1, 0, 0, 2, 0, 1]

  // Create queue entries
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i]
    const status = queueStatuses[i % queueStatuses.length]
    const priority = priorities[i % priorities.length]
    
    let callTime = null
    if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      callTime = new Date(Date.now() - Math.random() * 3600000) // Within last hour
    }

    const queueEntry = await prisma.queueEntry.create({
      data: {
        queueId: queue.id,
        patientId: patient.id,
        priority: priority,
        status: status,
        position: i + 1,
        callTime: callTime,
        createdBy: admin.id,
        notes: priority >= 2 ? 'Priority patient' : null
      }
    })

    console.log(`  ✓ Created queue entry #${i + 1}: ${patient.firstName} ${patient.lastName} (${status})`)
  }

  // Create consultations with diagnosis and orders for some patients
  console.log('\n🏥 Creating consultations and medical records...')
  
  // Get doctor IDs for creating consultations
  const doctorUsers = await prisma.user.findMany({ where: { role: 'DOCTOR' } })
  const doctorIds = doctorUsers.map(d => d.id)
  
  // Create visits and consultations for ALL patients
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i]
    const doctorId = doctorIds[i % doctorIds.length]
    
    // Create a visit first
    const visit = await prisma.visit.create({
      data: {
        patientId: patient.id,
        status: 'COMPLETED',
        arrivalTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 + 1800000),
        endTime: new Date(),
        complaint: ['Fever', 'Cough', 'Headache', 'Chest pain', 'Back pain', 'Allergies'][Math.floor(Math.random() * 6)],
        notes: 'Patient visit completed successfully',
        visitType: 'Outpatient'
      }
    })
    
    // Sample diagnoses - extended to cover all 12 patients
    const diagnoses = [
      { diagnosis: 'Acute Upper Respiratory Infection', icd10: 'J06.9', type: 'INITIAL' },
      { diagnosis: 'Hypertension, Stage 1', icd10: 'I10', type: 'FOLLOW_UP' },
      { diagnosis: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', type: 'FOLLOW_UP' },
      { diagnosis: 'Acute Bronchitis', icd10: 'J20.9', type: 'INITIAL' },
      { diagnosis: 'Migraine without Aura', icd10: 'G43.009', type: 'INITIAL' },
      { diagnosis: 'Gastroesophageal Reflux Disease', icd10: 'K21.9', type: 'FOLLOW_UP' },
      { diagnosis: 'Allergic Rhinitis', icd10: 'J30.9', type: 'INITIAL' },
      { diagnosis: 'Low Back Pain', icd10: 'M54.5', type: 'INITIAL' },
      { diagnosis: 'Sinusitis', icd10: 'J01.90', type: 'INITIAL' },
      { diagnosis: 'Tonsillitis', icd10: 'J03.90', type: 'INITIAL' },
      { diagnosis: 'Urinary Tract Infection', icd10: 'N39.0', type: 'INITIAL' },
      { diagnosis: 'Dermatitis', icd10: 'L30.9', type: 'FOLLOW_UP' }
    ]
    
    const diagnosis = diagnoses[i % diagnoses.length]
    
    // Create consultation linked to the visit
    const consultation = await prisma.consultation.create({
      data: {
        visitId: visit.id,
        patientId: patient.id,
        doctorId: doctorId,
        type: diagnosis.type,
        subjective: `Patient presents with complaints of ${diagnosis.diagnosis.toLowerCase()}. Symptoms started ${Math.floor(Math.random() * 7 + 1)} days ago.`,
        objective: `Vital signs stable. Physical examination reveals findings consistent with ${diagnosis.diagnosis.toLowerCase()}.`,
        assessment: diagnosis.diagnosis,
        diagnosis: diagnosis.diagnosis,
        icd10Code: diagnosis.icd10,
        diagnosisNotes: `Patient diagnosed with ${diagnosis.diagnosis}. Requires follow-up in 1-2 weeks.`,
        plan: '1. Medications as prescribed\n2. Rest and hydration\n3. Follow-up if symptoms worsen',
        treatmentPlan: 'Conservative management with medications and lifestyle modifications.',
        instructions: 'Take medications as prescribed. Return for follow-up if no improvement in 3-5 days.',
        notes: 'Patient educated about condition and treatment plan.',
        isSigned: true,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    })
    
    console.log(`  ✓ Created consultation for ${patient.firstName} ${patient.lastName}: ${diagnosis.diagnosis}`)
    
    // Create lab orders
    if (Math.random() > 0.3) {
      await prisma.labOrder.create({
        data: {
          visitId: visit.id,
          patientId: patient.id,
          orderedBy: doctorId,
          type: ['CBC', 'FBS', 'Urinalysis', 'Lipid Profile', 'HBA1c'][Math.floor(Math.random() * 5)],
          category: 'Laboratory',
          description: 'Routine laboratory work-up',
          priority: ['ROUTINE', 'URGENT'][Math.floor(Math.random() * 2)],
          status: ['PENDING', 'COMPLETED'][Math.floor(Math.random() * 2)],
          orderedDate: new Date()
        }
      })
      console.log(`    ✓ Added lab order`)
    }
    
    // Create procedure orders
    if (Math.random() > 0.5) {
      await prisma.procedureOrder.create({
        data: {
          consultationId: consultation.id,
          procedureType: ['LAB', 'IMAGING', 'PROCEDURE'][Math.floor(Math.random() * 3)],
          description: ['Chest X-Ray', 'ECG', 'Ultrasound', 'Physical Therapy'][Math.floor(Math.random() * 4)],
          priority: ['ROUTINE', 'URGENT'][Math.floor(Math.random() * 2)],
          instructions: 'Perform as ordered',
          status: ['ORDERED', 'COMPLETED'][Math.floor(Math.random() * 2)],
          orderedBy: doctorId
        }
      })
      console.log(`    ✓ Added procedure order`)
    }
    
    // Create prescription with items
    if (Math.random() > 0.2) {
      const prescription = await prisma.prescription.create({
        data: {
          patientId: patient.id,
          consultationId: consultation.id,
          doctorId: doctorId,
          status: 'PRESCRIBED',
          notes: 'Take as prescribed',
          createdAt: new Date()
        }
      })
      
      // Add prescription items
      const medications = [
        { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Every 6 hours', duration: '3 days' },
        { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Every 8 hours', duration: '7 days' },
        { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days' },
        { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
        { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days' }
      ]
      
      const med = medications[Math.floor(Math.random() * medications.length)]
      const medication = await prisma.medication.upsert({
        where: { name: med.name },
        update: {},
        create: {
          name: med.name,
          description: 'Standard medication',
          category: 'General'
        }
      })
      
      await prisma.prescriptionItem.create({
        data: {
          prescriptionId: prescription.id,
          medicationId: medication.id,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: 'Take as prescribed',
          quantity: Math.floor(Math.random() * 30 + 10),
          refillsAllowed: Math.floor(Math.random() * 2)
        }
      })
      
      console.log(`    ✓ Added prescription: ${med.name}`)
    }
  }

  console.log('\n✅ Seeding completed successfully!')
  console.log('\nCreated:')
  console.log(`  • 2 Admin users (admin@opd.com / elidev@opd.com)`)
  console.log(`  • 3 Doctors (doctor1@opd.com / doctor123)`)
  console.log(`  • 2 Nurses (nurse1@opd.com / nurse123)`)
  console.log(`  • ${patients.length} Patients`)
  console.log(`  • 1 Queue for today with ${patients.length} entries`)
  console.log(`  • 8 Consultations with diagnosis and orders`)
  console.log('\nQueue display is ready at: http://localhost:3000/display')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
