const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class PatientController {
  static createRules = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('dateOfBirth').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date of birth required (YYYY-MM-DD)'),
    body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender')
  ];

  static updateRules = [
    body('bloodType').optional().isIn(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']),
    body('maritalStatus').optional().isIn(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER'])
  ];

  static async getAll(req, res) {
    try {
      const { search, status, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ];
      }
      if (status) where.status = status;

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            gender: true,
            dateOfBirth: true,
            status: true,
            bloodType: true,
            insuranceProvider: true,
            createdAt: true
          }
        }),
        prisma.patient.count({ where })
      ]);

      res.json({
        success: true,
        data: patients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          visits: {
            take: 10,
            orderBy: { arrivalTime: 'desc' },
            include: {
              consultation: {
                include: {
                  doctor: { select: { firstName: true, lastName: true, role: true, specialization: true } }
                }
              },
              documentation: {
                include: {
                  nurse: { select: { firstName: true, lastName: true, role: true } }
                }
              }
            }
          },
          consultations: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              doctor: { select: { firstName: true, lastName: true, role: true, specialization: true } },
              prescriptions: {
                include: {
                  items: { include: { medication: true } }
                }
              }
            }
          },
          prescriptions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              doctor: { select: { firstName: true, lastName: true, role: true } },
              items: { include: { medication: true } }
            }
          },
          vitals: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          queueEntries: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              queue: true
            }
          },
          medicalDocuments: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }

      res.json({ success: true, data: patient });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Handle array fields
      const data = { ...req.body };
      if (typeof data.dateOfBirth === 'string' && !data.dateOfBirth.includes('T')) {
        data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
      }
      if (typeof data.knownAllergies === 'string') {
        data.knownAllergies = data.knownAllergies.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (typeof data.chronicConditions === 'string') {
        data.chronicConditions = data.chronicConditions.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (typeof data.currentMedications === 'string') {
        data.currentMedications = data.currentMedications.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (typeof data.pastSurgeries === 'string') {
        data.pastSurgeries = data.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (typeof data.familyHistory === 'string') {
        data.familyHistory = data.familyHistory.split(',').map(s => s.trim()).filter(Boolean);
      }

      const patient = await prisma.patient.create({
        data
      });

      res.status(201).json({ success: true, data: patient });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, error: 'Phone number already registered' });
      }
      res.status(500).json({ success: false, error: 'Failed to create patient' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Update validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Handle array fields
      const data = { ...req.body };
      if (typeof data.dateOfBirth === 'string' && !data.dateOfBirth.includes('T')) {
        data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
      }
      if (data.knownAllergies && typeof data.knownAllergies === 'string') {
        data.knownAllergies = data.knownAllergies.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (data.chronicConditions && typeof data.chronicConditions === 'string') {
        data.chronicConditions = data.chronicConditions.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (data.currentMedications && typeof data.currentMedications === 'string') {
        data.currentMedications = data.currentMedications.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (data.pastSurgeries && typeof data.pastSurgeries === 'string') {
        data.pastSurgeries = data.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (data.familyHistory && typeof data.familyHistory === 'string') {
        data.familyHistory = data.familyHistory.split(',').map(s => s.trim()).filter(Boolean);
      }

      const patient = await prisma.patient.update({
        where: { id },
        data
      });

      res.json({ success: true, data: patient });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }
      res.status(500).json({ success: false, error: 'Failed to update patient' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.patient.delete({
        where: { id }
      });

      res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete patient' });
    }
  }

  static async getHistory(req, res) {
    try {
      const { id } = req.params;
      
      const visits = await prisma.visit.findMany({
        where: { patientId: id },
        orderBy: { arrivalTime: 'desc' },
        include: {
          consultation: {
            include: {
              doctor: { select: { firstName: true, lastName: true } }
            }
          },
          documentation: {
            include: {
              nurse: { select: { firstName: true, lastName: true } }
            }
          }
        }
      });

      res.json({ success: true, data: visits });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMedicalHistory(req, res) {
    try {
      const { id } = req.params;
      
      const patient = await prisma.patient.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          knownAllergies: true,
          chronicConditions: true,
          pastSurgeries: true,
          familyHistory: true,
          smokingStatus: true,
          alcoholUse: true,
          exerciseHabits: true,
          drugUse: true,
          medications: true
        }
      });

      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }

      res.json({ success: true, data: patient });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = PatientController;