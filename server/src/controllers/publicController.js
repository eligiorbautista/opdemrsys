const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');

class PublicController {
  // Validation rules for self-registration
  static registerRules = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('dateOfBirth').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date of birth required (YYYY-MM-DD)'),
    body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
    body('priority').optional().isInt({ min: 0, max: 2 }).withMessage('Priority must be 0 (Routine), 1 (Urgent), or 2 (Emergency)'),
    body('notes').optional().trim()
  ];

  // Lookup patient by phone
  static async lookupPatient(req, res) {
    try {
      const { phone } = req.query;
      
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
      }

      const patient = await prisma.patient.findUnique({
        where: { phone },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          gender: true,
          dateOfBirth: true
        }
      });

      if (!patient) {
        return res.json({ success: true, data: null, message: 'Patient not found' });
      }

      res.json({ success: true, data: patient });
    } catch (error) {
      console.error('Lookup error:', error);
      res.status(500).json({ success: false, error: 'Failed to lookup patient' });
    }
  }

  // Self-registration: Create patient and add to queue
  static async selfRegister(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { 
        firstName, 
        lastName, 
        phone, 
        dateOfBirth, 
        gender, 
        email,
        address,
        priority = 0, 
        notes 
      } = req.body;

      console.log('Self-registration attempt:', { firstName, lastName, phone, priority });

      // Check if patient exists by phone
      let patient = await prisma.patient.findUnique({
        where: { phone }
      });

      let patientExists = false;
      if (patient) {
        patientExists = true;
        console.log('Existing patient found:', patient.id);
      } else {
        // Create new patient
        const patientData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          gender
        };

        if (email) patientData.email = email.trim();
        if (address) patientData.address = address.trim();

        patient = await prisma.patient.create({
          data: patientData
        });
        console.log('New patient created:', patient.id);
      }

      // Get or create today's queue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let queue = await prisma.queue.findFirst({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          isActive: true
        }
      });

      if (!queue) {
        queue = await prisma.queue.create({
          data: {
            name: `OPD Queue ${today.toLocaleDateString()}`,
            date: today,
            isActive: true
          }
        });
        console.log('Created new queue:', queue.id);
      }

      // Check if patient is already in queue today
      const existingEntry = await prisma.queueEntry.findFirst({
        where: {
          patientId: patient.id,
          queueId: queue.id,
          status: { in: ['WAITING', 'IN_PROGRESS'] }
        }
      });

      if (existingEntry) {
        return res.status(400).json({ 
          success: false, 
          error: 'You are already in the queue today',
          data: {
            queueNumber: existingEntry.position,
            status: existingEntry.status,
            patient: {
              firstName: patient.firstName,
              lastName: patient.lastName
            }
          }
        });
      }

      // Get position
      const lastEntry = await prisma.queueEntry.findFirst({
        where: { queueId: queue.id },
        orderBy: { position: 'desc' }
      });
      const position = (lastEntry?.position || 0) + 1;

      // Create queue entry (no createdBy for public access)
      const queueEntry = await prisma.queueEntry.create({
        data: {
          queueId: queue.id,
          patientId: patient.id,
          priority: parseInt(priority),
          status: 'WAITING',
          position,
          notes: notes || null,
          createdBy: null // Self-service has no createdBy
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      });

      console.log('Queue entry created:', queueEntry.id, 'Position:', position);

      // Get estimated wait time (rough estimate: 15 mins per patient)
      const waitingCount = await prisma.queueEntry.count({
        where: {
          queueId: queue.id,
          status: 'WAITING',
          position: { lt: position }
        }
      });
      const estimatedMinutes = waitingCount * 15;

      res.status(201).json({
        success: true,
        message: patientExists 
          ? 'Welcome back! You have been added to the queue.' 
          : 'Registration successful! You have been added to the queue.',
        data: {
          patient: {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            phone: patient.phone
          },
          queueEntry: {
            id: queueEntry.id,
            queueNumber: position,
            status: queueEntry.status,
            priority: queueEntry.priority,
            estimatedWaitMinutes: estimatedMinutes
          },
          isExistingPatient: patientExists
        }
      });

    } catch (error) {
      console.error('Self-registration error:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, error: 'Phone number already registered' });
      }
      res.status(500).json({ success: false, error: 'Failed to complete registration' });
    }
  }

  // Get queue status for display
  static async getQueueStatus(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const queue = await prisma.queue.findFirst({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          isActive: true
        }
      });

      if (!queue) {
        return res.json({
          success: true,
          data: {
            isActive: false,
            waitingCount: 0,
            currentlyServing: null
          }
        });
      }

      const [waitingCount, inProgressCount, currentlyServing] = await Promise.all([
        prisma.queueEntry.count({
          where: { queueId: queue.id, status: 'WAITING' }
        }),
        prisma.queueEntry.count({
          where: { queueId: queue.id, status: 'IN_PROGRESS' }
        }),
        prisma.queueEntry.findFirst({
          where: { queueId: queue.id, status: 'IN_PROGRESS' },
          include: {
            patient: {
              select: { firstName: true, lastName: true }
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          isActive: true,
          waitingCount,
          inProgressCount,
          currentlyServing: currentlyServing ? {
            queueNumber: currentlyServing.position,
            patientName: `${currentlyServing.patient.firstName} ${currentlyServing.patient.lastName}`
          } : null
        }
      });
    } catch (error) {
      console.error('Queue status error:', error);
      res.status(500).json({ success: false, error: 'Failed to get queue status' });
    }
  }
}

module.exports = PublicController;
