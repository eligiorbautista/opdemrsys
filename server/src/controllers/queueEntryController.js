const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class QueueEntryController {
  static async getAllEntries(req, res) {
    try {
      const { status, date } = req.query;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const where = {
        createdAt: { gte: today, lt: tomorrow }
      };
      
      if (status) {
        where.status = status;
      }

      const entries = await prisma.queueEntry.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              dateOfBirth: true
            }
          },
          queue: true
        }
      });

      res.json({ success: true, data: entries });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { patientId, queueId = 'default', priority, triageLevel, notes } = req.body;

      // Get today's queue or create one
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
      }

      // Get current position
      const lastEntry = await prisma.queueEntry.findFirst({
        where: { queueId: queue.id },
        orderBy: { position: 'desc' }
      });
      
      const position = (lastEntry?.position || 0) + 1;

      const entry = await prisma.queueEntry.create({
        data: {
          queueId: queue.id,
          patientId,
          priority: priority || 0,
          triageLevel: triageLevel || 'ROUTINE',
          status: 'WAITING',
          position,
          notes,
          createdBy: req.user.id
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      });

      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      console.error('Queue entry creation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { priority, status, triageLevel, notes } = req.body;

      const entry = await prisma.queueEntry.update({
        where: { id },
        data: {
          priority,
          status,
          triageLevel,
          notes
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      });

      res.json({ success: true, data: entry });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.queueEntry.delete({
        where: { id }
      });

      res.json({ success: true, message: 'Queue entry deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = QueueEntryController;