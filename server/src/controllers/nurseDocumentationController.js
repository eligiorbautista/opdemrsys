const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class NurseDocumentationController {
  static createRules = [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('triageLevel').isIn(['ROUTINE', 'URGENT', 'EMERGENCY']).withMessage('Invalid triage level'),
    body('chiefComplaint').notEmpty().withMessage('Chief complaint is required')
  ];

  static async getAll(req, res) {
    try {
      const { patientId, nurseId, triageLevel, fallRisk, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (patientId) where.patientId = patientId;
      if (nurseId) where.nurseId = nurseId;
      if (triageLevel) where.triageLevel = triageLevel;
      if (fallRisk !== undefined) where.fallRisk = fallRisk === 'true';

      const [documentations, total] = await Promise.all([
        prisma.nurseDocumentation.findMany({
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
                phone: true,
                dateOfBirth: true,
                gender: true
              }
            },
            nurse: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                certificationLevel: true
              }
            },
            visit: {
              select: {
                status: true,
                complaint: true
              }
            }
          }
        }),
        prisma.nurseDocumentation.count({ where })
      ]);

      res.json({
        success: true,
        data: documentations,
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
      
      const documentation = await prisma.nurseDocumentation.findUnique({
        where: { id },
        include: {
          patient: true,
          nurse: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              certificationLevel: true,
              specializedTraining: true
            }
          },
          visit: true
        }
      });

      if (!documentation) {
        return res.status(404).json({ success: false, error: 'Documentation not found' });
      }

      res.json({ success: true, data: documentation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Handle observations array
      const data = { ...req.body };
      if (typeof data.observations === 'string') {
        data.observations = data.observations.split(',').map(s => s.trim()).filter(Boolean);
      }

      let actualVisitId = data.visitId;

      // Auto-create a visit if none provided
      if (!actualVisitId && data.patientId) {
        console.log('Auto-creating visit for nurse documentation for patient:', data.patientId);
        try {
          const visit = await prisma.visit.create({
            data: {
              patientId: data.patientId,
              status: 'IN_PROGRESS',
              arrivalTime: new Date(),
              visitType: 'Outpatient',
              complaint: data.chiefComplaint || 'Nurse triage',
              notes: 'Auto-created with nurse documentation'
            }
          });
          actualVisitId = visit.id;
          console.log('Created visit with ID:', actualVisitId);
          data.visitId = actualVisitId;
        } catch (visitError) {
          console.error('Failed to create visit:', visitError);
          // Continue without visit if creation fails
        }
      }

      const documentation = await prisma.nurseDocumentation.create({
        data: {
          ...data,
          nurseId: req.user.id
        },
        include: {
          patient: true,
          nurse: true
        }
      });

      res.status(201).json({ success: true, data: documentation });
    } catch (error) {
      console.error('Error creating nurse documentation:', error);
      console.error('Error details:', error.message, error.response?.data?.error);
      res.status(500).json({ success: false, error: 'Failed to create documentation', details: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Handle observations array
      if (typeof data.observations === 'string') {
        data.observations = data.observations.split(',').map(s => s.trim()).filter(Boolean);
      }

      const documentation = await prisma.nurseDocumentation.update({
        where: { id },
        data
      });

      res.json({ success: true, data: documentation });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update documentation' });
    }
  }

  static async getByPatient(req, res) {
    try {
      const { patientId } = req.params;
      
      const documentations = await prisma.nurseDocumentation.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          nurse: { select: { firstName: true, lastName: true } }
        }
      });

      res.json({ success: true, data: documentations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Fall risk assessment
  static async assessFallRisk(req, res) {
    try {
      const { id } = req.params;
      const { fallRisk, riskFactors } = req.body;

      const documentation = await prisma.nurseDocumentation.update({
        where: { id },
        data: {
          fallRisk,
          notes: riskFactors ? `Risk factors: ${riskFactors.join(', ')}` : null
        }
      });

      res.json({ success: true, data: documentation, message: 'Fall risk assessed' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to assess fall risk' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.nurseDocumentation.delete({
        where: { id }
      });

      res.json({ success: true, message: 'Documentation deleted successfully' });
    } catch (error) {
      console.error('Error deleting documentation:', error);
      res.status(500).json({ success: false, error: 'Failed to delete documentation' });
    }
  }
}

module.exports = NurseDocumentationController;