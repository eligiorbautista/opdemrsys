const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class ConsultationController {
  static createRules = [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('type').isIn(['INITIAL', 'FOLLOW_UP', 'REFERRAL', 'EMERGENCY']).withMessage('Invalid consultation type')
  ];

  static async getAll(req, res) {
    try {
      const { patientId, doctorId, type, status, date, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (patientId) where.patientId = patientId;
      if (doctorId) where.doctorId = doctorId;
      if (type) where.type = type;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt = { gte: startDate, lt: endDate };
      }

      const [consultations, total] = await Promise.all([
        prisma.consultation.findMany({
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
                gender: true,
                dateOfBirth: true
              }
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                specialization: true
              }
            },
            prescriptions: {
              include: {
                items: true
              }
            }
          }
        }),
        prisma.consultation.count({ where })
      ]);

      res.json({
        success: true,
        data: consultations,
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

      const consultation = await prisma.consultation.findUnique({
        where: { id },
        include: {
          patient: true,
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              specialization: true,
              licenseNumber: true,
              npiNumber: true
            }
          },
          visit: {
            include: {
              patient: true,
              labOrders: true,
              nursingOrders: true,
              referralOrders: true
            }
          },
          prescriptions: {
            include: {
              items: { include: { medication: true } },
              doctor: { select: { firstName: true, lastName: true } }
            }
          },
          procedureOrders: true
        }
      });

      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }

      res.json({ success: true, data: consultation });
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

      const {
        visitId,
        patientId,
        type,
        subjective,
        objective,
        assessment,
        plan,
        diagnosis,
        icd10Code,
        diagnosisNotes,
        treatmentPlan,
        followUp,
        instructions,
        notes,
        labOrders,
        nursingOrders,
        referralOrders,
        procedureOrders
      } = req.body;

      console.log('Request user:', req.user);
      console.log('User ID:', req.user?.id);

      let actualVisitId = visitId;

      // Auto-create a visit if none provided
      if (!actualVisitId && patientId) {
        console.log('Auto-creating visit for patient:', patientId);
        const visit = await prisma.visit.create({
          data: {
            patientId,
            status: 'IN_PROGRESS',
            arrivalTime: new Date(),
            visitType: 'Outpatient',
            complaint: subjective || 'New consultation',
            notes: 'Auto-created with consultation'
          }
        });
        actualVisitId = visit.id;
        console.log('Created visit with ID:', actualVisitId);
      }

      if (!actualVisitId) {
        return res.status(400).json({
          success: false,
          error: 'A visit ID is required or visit creation failed'
        });
      }

      const consultationData = {
        visitId: actualVisitId,
        patientId,
        type,
        subjective,
        objective,
        assessment,
        plan,
        diagnosis,
        icd10Code,
        diagnosisNotes,
        treatmentPlan,
        followUp: followUp ? new Date(followUp) : null,
        instructions,
        notes
      };

      // Verify authenticated user exists
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      consultationData.doctorId = req.user.id;

      console.log('Creating consultation with data:', consultationData);

      const consultation = await prisma.consultation.create({
        data: consultationData,
        include: {
          patient: true,
          doctor: true
        }
      });

      // Create orders if provided
      const ordersPromises = [];

      // Create lab orders
      if (labOrders && Array.isArray(labOrders) && labOrders.length > 0) {
        for (const order of labOrders) {
          if (order.description) {
            ordersPromises.push(
              prisma.labOrder.create({
                data: {
                  visitId: actualVisitId,
                  patientId,
                  orderedBy: req.user?.id,
                  type: 'General',
                  category: 'Laboratory',
                  description: order.description,
                  priority: order.priority || 'ROUTINE',
                  instructions: order.instructions || '',
                  notes: ''
                }
              })
            );
          }
        }
      }

      // Create nursing orders
      if (nursingOrders && Array.isArray(nursingOrders) && nursingOrders.length > 0) {
        for (const order of nursingOrders) {
          if (order.type) {
            ordersPromises.push(
              prisma.nursingOrder.create({
                data: {
                  visitId: actualVisitId,
                  patientId,
                  orderedBy: req.user?.id,
                  type: order.type,
                  frequency: order.frequency || 'Once',
                  priority: order.priority || 'ROUTINE',
                  instructions: order.instructions || '',
                  notes: ''
                }
              })
            );
          }
        }
      }

      // Create referral orders
      if (referralOrders && Array.isArray(referralOrders) && referralOrders.length > 0) {
        for (const order of referralOrders) {
          if (order.referredTo) {
            ordersPromises.push(
              prisma.referralOrder.create({
                data: {
                  visitId: actualVisitId,
                  patientId,
                  orderedBy: req.user?.id,
                  referredTo: order.referredTo,
                  specialty: order.specialty || '',
                  urgency: order.urgency || 'ROUTINE',
                  reason: order.reason || '',
                  notes: order.notes || ''
                }
              })
            );
          }
        }
      }

      // Process orders
      if (ordersPromises.length > 0) {
        await Promise.all(ordersPromises);
      }

      // Fetch the consultation with all orders
      const fullConsultation = await prisma.consultation.findUnique({
        where: { id: consultation.id },
        include: {
          patient: true,
          doctor: true,
          visit: {
            include: {
              labOrders: true,
              nursingOrders: true,
              referralOrders: true
            }
          },
          procedureOrders: true
        }
      });

      res.status(201).json({ success: true, data: fullConsultation });
    } catch (error) {
      console.error('Error creating consultation:', error);
      console.error('Error details:', error.message, error.response?.data?.error);
      res.status(500).json({ success: false, error: 'Failed to create consultation', details: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { subjective, objective, assessment, plan, diagnosis, icd10Code, diagnosisNotes, treatmentPlan, followUp, instructions, notes, isSigned, labOrders, nursingOrders, referralOrders, procedureOrders } = req.body;

      const updateData = {};
      if (subjective !== undefined) updateData.subjective = subjective;
      if (objective !== undefined) updateData.objective = objective;
      if (assessment !== undefined) updateData.assessment = assessment;
      if (plan !== undefined) updateData.plan = plan;
      if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
      if (icd10Code !== undefined) updateData.icd10Code = icd10Code;
      if (diagnosisNotes !== undefined) updateData.diagnosisNotes = diagnosisNotes;
      if (treatmentPlan !== undefined) updateData.treatmentPlan = treatmentPlan;
      if (followUp !== undefined) updateData.followUp = followUp ? new Date(followUp) : null;
      if (instructions !== undefined) updateData.instructions = instructions;
      if (notes !== undefined) updateData.notes = notes;

      // Electronic signature
      if (isSigned === true) {
        if (!req.user || !req.user.id) {
          return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        updateData.isSigned = true;
        updateData.signedAt = new Date();
        updateData.signedBy = req.user.id;
      }

      const consultation = await prisma.consultation.update({
        where: { id },
        data: updateData
      });

      // Update orders if provided and consultation has a visit
      if (consultation.visitId) {
        const ordersPromises = [];

        // Handle lab orders - delete existing and create new ones
        if (labOrders !== undefined) {
          await prisma.labOrder.deleteMany({ where: { visitId: consultation.visitId } });
          if (Array.isArray(labOrders)) {
            for (const order of labOrders) {
              if (order.description) {
                ordersPromises.push(
                  prisma.labOrder.create({
                    data: {
                      visitId: consultation.visitId,
                      patientId: consultation.patientId,
                      orderedBy: req.user?.id,
                      type: 'General',
                      category: 'Laboratory',
                      description: order.description,
                      priority: order.priority || 'ROUTINE',
                      instructions: order.instructions || '',
                      notes: ''
                    }
                  })
                );
              }
            }
          }
        }

        // Handle nursing orders - delete existing and create new ones
        if (nursingOrders !== undefined) {
          await prisma.nursingOrder.deleteMany({ where: { visitId: consultation.visitId } });
          if (Array.isArray(nursingOrders)) {
            for (const order of nursingOrders) {
              if (order.type) {
                ordersPromises.push(
                  prisma.nursingOrder.create({
                    data: {
                      visitId: consultation.visitId,
                      patientId: consultation.patientId,
                      orderedBy: req.user?.id,
                      type: order.type,
                      frequency: order.frequency || 'Once',
                      priority: order.priority || 'ROUTINE',
                      instructions: order.instructions || '',
                      notes: ''
                    }
                  })
                );
              }
            }
          }
        }

        // Handle referral orders - delete existing and create new ones
        if (referralOrders !== undefined) {
          await prisma.referralOrder.deleteMany({ where: { visitId: consultation.visitId } });
          if (Array.isArray(referralOrders)) {
            for (const order of referralOrders) {
              if (order.referredTo) {
                ordersPromises.push(
                  prisma.referralOrder.create({
                    data: {
                      visitId: consultation.visitId,
                      patientId: consultation.patientId,
                      orderedBy: req.user?.id,
                      referredTo: order.referredTo,
                      specialty: order.specialty || '',
                      urgency: order.urgency || 'ROUTINE',
                      reason: order.reason || '',
                      notes: order.notes || ''
                    }
                  })
                );
              }
            }
          }
        }

        // Process orders
        if (ordersPromises.length > 0) {
          await Promise.all(ordersPromises);
        }
      }

      // Fetch updated consultation with all orders
      const updatedConsultation = await prisma.consultation.findUnique({
        where: { id },
        include: {
          patient: true,
          doctor: true,
          visit: {
            include: {
              labOrders: true,
              nursingOrders: true,
              referralOrders: true
            }
          },
          procedureOrders: true
        }
      });

      res.json({ success: true, data: updatedConsultation });
    } catch (error) {
      console.error('Error updating consultation:', error);
      res.status(500).json({ success: false, error: 'Failed to update consultation' });
    }
  }

  static async signConsultation(req, res) {
    try {
      const { id } = req.params;

      // Check if consultation exists
      const existingConsultation = await prisma.consultation.findUnique({
        where: { id }
      });

      if (!existingConsultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }

      // Check if already signed
      if (existingConsultation.isSigned) {
        return res.status(400).json({ success: false, error: 'Consultation is already signed' });
      }

      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      const consultation = await prisma.consultation.update({
        where: { id },
        data: {
          isSigned: true,
          signedAt: new Date(),
          signedBy: req.user.id
        }
      });

      res.json({ success: true, data: consultation, message: 'Consultation signed successfully' });
    } catch (error) {
      console.error('Error signing consultation:', error);
      res.status(500).json({ success: false, error: 'Failed to sign consultation', details: error.message });
    }
  }

  static async getByPatient(req, res) {
    try {
      const { patientId } = req.params;
      
      const consultations = await prisma.consultation.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: { select: { firstName: true, lastName: true, role: true, specialization: true } }
        }
      });

      res.json({ success: true, data: consultations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Procedure Orders
  static async addProcedureOrder(req, res) {
    try {
      const { consultationId } = req.params;
      const { procedureType, cptCode, description, priority, instructions } = req.body;

      const order = await prisma.procedureOrder.create({
        data: {
          consultationId,
          procedureType,
          cptCode,
          description,
          priority: priority || 'ROUTINE',
          instructions,
          orderedBy: req.user.id
        }
      });

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to add procedure order' });
    }
  }

  static async getProcedureOrders(req, res) {
    try {
      const { consultationId } = req.params;

      const orders = await prisma.procedureOrder.findMany({
        where: { consultationId },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.consultation.delete({
        where: { id }
      });

      res.json({ success: true, message: 'Consultation deleted successfully' });
    } catch (error) {
      console.error('Error deleting consultation:', error);
      res.status(500).json({ success: false, error: 'Failed to delete consultation' });
    }
  }
}

module.exports = ConsultationController;