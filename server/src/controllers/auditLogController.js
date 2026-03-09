const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class AuditLogController {
  static async create(req, res) {
    try {
      const { patientId, action, resourceType, resourceId, description, oldValue, newValue } = req.body;

      const log = await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          patientId,
          action,
          resourceType,
          resourceId,
          description,
          oldValue: oldValue ? JSON.stringify(oldValue) : null,
          newValue: newValue ? JSON.stringify(newValue) : null,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.status(201).json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create audit log' });
    }
  }

  static async getAll(req, res) {
    try {
      const { userId, patientId, action, resourceType, startDate, endDate, page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (userId) where.userId = userId;
      if (patientId) where.patientId = patientId;
      if (action) where.action = action;
      if (resourceType) where.resourceType = resourceType;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true, role: true } },
            patient: { select: { firstName: true, lastName: true } }
          }
        }),
        prisma.auditLog.count({ where })
      ]);

      res.json({
        success: true,
        data: logs,
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

  static async getByPatient(req, res) {
    try {
      const { patientId } = req.params;
      
      const logs = await prisma.auditLog.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true } }
        }
      });

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByUser(req, res) {
    try {
      const { userId } = req.params;
      
      const logs = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = AuditLogController;