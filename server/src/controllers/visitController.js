const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class VisitController {
  static createRules = [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('status').isIn(['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status')
  ];

  static async getAll(req, res) {
    try {
      const { patientId, status, date, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (patientId) where.patientId = patientId;
      if (status) where.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        where.arrivalTime = { gte: startDate, lt: endDate };
      }

      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { arrivalTime: 'desc' },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                gender: true,
                dateOfBirth: true
              }
            }
          }
        }),
        prisma.visit.count({ where })
      ]);

      res.json({
        success: true,
        data: visits,
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
      
      const visit = await prisma.visit.findUnique({
        where: { id },
        include: {
          patient: true,
          consultation: {
            include: {
              doctor: { select: { firstName: true, lastName: true, role: true } },
              prescriptions: {
                include: {
                  items: { include: { medication: true } }
                }
              }
            }
          },
          documentation: {
            include: {
              nurse: { select: { firstName: true, lastName: true, role: true } },
              vitals: true
            }
          },
          vitals: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!visit) {
        return res.status(404).json({ success: false, error: 'Visit not found' });
      }

      res.json({ success: true, data: visit });
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

      const { patientId, complaint, notes } = req.body;

      const visit = await prisma.visit.create({
        data: {
          patientId,
          status: 'WAITING',
          arrivalTime: new Date(),
          complaint,
          notes
        },
        include: {
          patient: true
        }
      });

      res.status(201).json({ success: true, data: visit });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(400).json({ success: false, error: 'Patient not found' });
      }
      res.status(500).json({ success: false, error: 'Failed to create visit' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { status, startTime, endTime, complaint, notes } = req.body;
      
      const updateData = {};
      if (status) updateData.status = status;
      if (startTime) updateData.startTime = new Date(startTime);
      if (endTime) updateData.endTime = new Date(endTime);
      if (complaint !== undefined) updateData.complaint = complaint;
      if (notes !== undefined) updateData.notes = notes;

      const visit = await prisma.visit.update({
        where: { id },
        data: updateData
      });

      res.json({ success: true, data: visit });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update visit' });
    }
  }

  static async startVisit(req, res) {
    try {
      const { id } = req.params;
      
      const visit = await prisma.visit.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          startTime: new Date()
        }
      });

      res.json({ success: true, data: visit });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to start visit' });
    }
  }

  static async endVisit(req, res) {
    try {
      const { id } = req.params;
      
      const visit = await prisma.visit.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          endTime: new Date()
        }
      });

      res.json({ success: true, data: visit });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to end visit' });
    }
  }

  static async getDaily(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const visits = await prisma.visit.findMany({
        where: {
          arrivalTime: { gte: today, lt: tomorrow }
        },
        include: {
          patient: true
        },
        orderBy: { arrivalTime: 'asc' }
      });

      res.json({ success: true, data: visits });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = VisitController;
