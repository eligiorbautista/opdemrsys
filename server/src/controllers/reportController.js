const prisma = require('../config/database');

class ReportController {
  static async getDailySummary(req, res) {
    try {
      const { date } = req.query;
      const reportDate = date ? new Date(date) : new Date();
      
      const today = new Date(reportDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [totalPatients, totalVisits, totalConsultations, completedConsultations, totalPrescriptions, queueStats] = await Promise.all([
        prisma.patient.count(),
        prisma.visit.count({ where: { arrivalTime: { gte: today, lt: tomorrow } } }),
        prisma.consultation.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
        prisma.consultation.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
        prisma.prescription.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
        prisma.queueEntry.findMany({
          where: { createdAt: { gte: today, lt: tomorrow } },
          select: { status: true }
        })
      ]);

      const queueWaiting = queueStats.filter(q => q.status === 'WAITING').length;
      const queueCompleted = queueStats.filter(q => q.status === 'COMPLETED').length;

      res.json({
        success: true,
        report: {
          date: today.toISOString().split('T')[0],
          summary: {
            totalPatients,
            visitsToday: totalVisits,
            consultationsToday: totalConsultations,
            prescriptionsToday: totalPrescriptions,
            queueWaiting,
            queueCompleted
          },
          breakdown: {
            visitsByStatus: {
              waiting: 0,
              inProgress: 0,
              completed: 0
            },
            triageDistribution: {
              routine: 0,
              urgent: 0,
              emergency: 0
            }
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPatientStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [totalPatients, activePatients, newPatients, malePatients, femalePatients] = await Promise.all([
        prisma.patient.count(),
        prisma.patient.count({ where: { status: 'ACTIVE' } }),
        prisma.patient.count({ where: { ...where, createdAt: { gte: where.createdAt?.gte || new Date('1970-01-01') } } }),
        prisma.patient.count({ where: { gender: 'MALE', ...where } }),
        prisma.patient.count({ where: { gender: 'FEMALE', ...where } })
      ]);

      res.json({
        success: true,
        report: {
          totalPatients,
          activePatients,
          newPatients,
          demography: {
            male: malePatients,
            female: femalePatients,
            other: totalPatients - malePatients - femalePatients
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getConsultationReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [totalConsultations, byType] = await Promise.all([
        prisma.consultation.count({ where }),
        prisma.consultation.groupBy({
          by: ['type'],
          where,
          _count: true
        })
      ]);

      const typeBreakdown = byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {});

      res.json({
        success: true,
        report: {
          totalConsultations,
          byType: typeBreakdown
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPrescriptionReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [totalPrescriptions, byStatus] = await Promise.all([
        prisma.prescription.count({ where }),
        prisma.prescription.groupBy({
          by: ['status'],
          where,
          _count: true
        })
      ]);

      const statusBreakdown = byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {});

      const topMedications = await prisma.prescriptionItem.groupBy({
        by: ['medicationId'],
        _count: true,
        orderBy: { _count: 'desc' },
        take: 10
      });

      const medications = await prisma.medication.findMany({
        where: { id: { in: topMedications.map(m => m.medicationId) } }
      });

      res.json({
        success: true,
        report: {
          totalPrescriptions,
          byStatus: statusBreakdown,
          topMedications: topMedications.map(tm => ({
            ...medications.find(m => m.id === tm.medicationId),
            count: tm._count
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getVisitReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const where = {};
      if (startDate || endDate) {
        where.arrivalTime = {};
        if (startDate) where.arrivalTime.gte = new Date(startDate);
        if (endDate) where.arrivalTime.lte = new Date(endDate);
      }

      const [totalVisits, byStatus] = await Promise.all([
        prisma.visit.count({ where }),
        prisma.visit.groupBy({
          by: ['status'],
          where,
          _count: true
        })
      ]);

      const statusBreakdown = byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {});

      res.json({
        success: true,
        report: {
          totalVisits,
          byStatus: statusBreakdown
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getQueueReport(req, res) {
    try {
      const { date } = req.query;
      const reportDate = date ? new Date(date) : new Date();
      
      const today = new Date(reportDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [waiting, inProgress, completed, skipped] = await Promise.all([
        prisma.queueEntry.count({
          where: { createdAt: { gte: today, lt: tomorrow }, status: 'WAITING' }
        }),
        prisma.queueEntry.count({
          where: { createdAt: { gte: today, lt: tomorrow }, status: 'IN_PROGRESS' }
        }),
        prisma.queueEntry.count({
          where: { createdAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' }
        }),
        prisma.queueEntry.count({
          where: { createdAt: { gte: today, lt: tomorrow }, status: 'SKIPPED' }
        })
      ]);

      res.json({
        success: true,
        report: {
          waiting,
          inProgress,
          completed,
          skipped,
          total: waiting + inProgress + completed + skipped,
          date: today.toISOString().split('T')[0]
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOverview(req, res) {
    try {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [totalPatients, todayVisits, weekVisits, monthVisits, todayConsultations, weekConsultations, monthConsultations] = await Promise.all([
        prisma.patient.count(),
        prisma.visit.count({ where: { arrivalTime: { gte: dayAgo } } }),
        prisma.visit.count({ where: { arrivalTime: { gte: weekAgo } } }),
        prisma.visit.count({ where: { arrivalTime: { gte: monthAgo } } }),
        prisma.consultation.count({ where: { createdAt: { gte: dayAgo } } }),
        prisma.consultation.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.consultation.count({ where: { createdAt: { gte: monthAgo } } })
      ]);

      res.json({
        success: true,
        overview: {
          patients: { total: totalPatients },
          visits: {
            today: todayVisits,
            week: weekVisits,
            month: monthVisits
          },
          consultations: {
            today: todayConsultations,
            week: weekConsultations,
            month: monthConsultations
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ReportController;
