const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class PrescriptionController {
  static createRules = [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('status').optional().isIn(['DRAFT', 'PRESCRIBED', 'DISPENSED', 'CANCELLED']).withMessage('Invalid status')
  ];

  static async getAll(req, res) {
    try {
      const { patientId, doctorId, consultationId, status, date, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (patientId) where.patientId = patientId;
      if (doctorId) where.doctorId = doctorId;
      if (consultationId) where.consultationId = consultationId;
      if (status) where.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt = { gte: startDate, lt: endDate };
      }

      const [prescriptions, total] = await Promise.all([
        prisma.prescription.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true
              }
            },
            consultation: {
              include: {
                patient: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
              }
            },
            items: {
              include: {
                medication: true
              }
            }
          }
        }),
        prisma.prescription.count({ where })
      ]);

      res.json({
        success: true,
        data: prescriptions,
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
      
      const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
          patient: true,
          consultation: true,
          doctor: true,
          items: {
            include: {
              medication: true
            }
          }
        }
      });

      if (!prescription) {
        return res.status(404).json({ success: false, error: 'Prescription not found' });
      }

      res.json({ success: true, data: prescription });
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

      const { patientId, consultationId, items, notes } = req.body;

      const prescription = await prisma.prescription.create({
        data: {
          patientId,
          consultationId,
          doctorId: req.user.id,
          status: 'PRESCRIBED',
          notes,
          totalCost: 0,
          items: {
            create: items
          }
        },
        include: {
          patient: true,
          doctor: true,
          items: {
            include: {
              medication: true
            }
          }
        }
      });

      res.status(201).json({ success: true, data: prescription });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create prescription' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const prescription = await prisma.prescription.update({
        where: { id },
        data: {
          status: status || undefined,
          notes: notes || undefined
        }
      });

      res.json({ success: true, data: prescription });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update prescription' });
    }
  }

  static async getMedications(req, res) {
    try {
      const medications = await prisma.medication.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      res.json({ success: true, data: medications });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByPatient(req, res) {
    try {
      const { patientId } = req.params;
      
      const prescriptions = await prisma.prescription.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: { select: { firstName: true, lastName: true } },
          items: { include: { medication: true } }
        }
      });

      res.json({ success: true, data: prescriptions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = PrescriptionController;
