const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class QueueController {
  static createRules = [
    body('patientId').notEmpty().withMessage('Patient ID is required')
  ];

  static async getAll(req, res) {
    try {
      const { date, status, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const queueDate = date ? new Date(date) : new Date();
      const today = new Date(queueDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const where = {
        createdAt: { gte: today, lt: tomorrow },
        status: status || undefined
      };

      const [entries, total] = await Promise.all([
        prisma.queueEntry.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                gender: true
              }
            },
            queue: true,
            assignedUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        prisma.queueEntry.count({ where })
      ]);

      res.json({
        success: true,
        data: entries,
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
      
      const entry = await prisma.queueEntry.findUnique({
        where: { id },
        include: {
          patient: true,
          queue: true,
          assignedUser: true
        }
      });

      if (!entry) {
        return res.status(404).json({ success: false, error: 'Queue entry not found' });
      }

      res.json({ success: true, data: entry });
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

      const { patientId, queueId, priority = 0, notes } = req.body;
      console.log('Creating queue entry with:', { patientId, queueId, priority, notes });

      // Auto-create queue if not provided
      let actualQueueId = queueId;
      if (!actualQueueId) {
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
          console.log('Created queue with ID:', queue.id);
        }
        actualQueueId = queue.id;
      }

      // Get current position
      const lastEntry = await prisma.queueEntry.findFirst({
        where: { queueId: actualQueueId },
        orderBy: { position: 'desc' }
      });

      const position = (lastEntry?.position || 0) + 1;

      const entry = await prisma.queueEntry.create({
        data: {
          queueId: actualQueueId,
          patientId,
          priority,
          status: 'WAITING',
          position,
          notes,
          createdBy: req.user.id
        },
        include: {
          patient: true
        }
      });

      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      console.error('Error creating queue entry:', error);
      res.status(500).json({ success: false, error: 'Failed to create queue entry', details: error.message });
    }
  }

  static async callNext(req, res) {
    try {
      const { queueId } = req.params;

      // Handle default queue ID - auto-find today's queue
      let actualQueueId = queueId;
      if (queueId === 'default') {
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
          return res.status(404).json({ success: false, error: 'No active queue found for today' });
        }
        actualQueueId = queue.id;
      }

      console.log('Finding next patient for queue:', actualQueueId);

      const entry = await prisma.queueEntry.findFirst({
        where: {
          queueId: actualQueueId,
          status: 'WAITING'
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }]
      });

      if (!entry) {
        return res.status(404).json({ success: false, error: 'No patients waiting' });
      }

      const updated = await prisma.queueEntry.update({
        where: { id: entry.id },
        data: {
          status: 'IN_PROGRESS',
          callTime: new Date(),
          assignedTo: req.user.id
        },
        include: {
          patient: true
        }
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error calling next patient:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async complete(req, res) {
    try {
      const { id } = req.params;

      const entry = await prisma.queueEntry.update({
        where: { id },
        data: {
          status: 'COMPLETED'
        }
      });

      res.json({ success: true, data: entry });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to complete entry' });
    }
  }

  static async skip(req, res) {
    try {
      const { id } = req.params;

      const entry = await prisma.queueEntry.update({
        where: { id },
        data: {
          status: 'SKIPPED'
        }
      });

      res.json({ success: true, data: entry });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to skip entry' });
    }
  }

  static async getStats(req, res) {
    try {
      const { date } = req.query;
      const queueDate = date ? new Date(date) : new Date();
      
      const today = new Date(queueDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [waiting, inProgress, completed, skipped] = await Promise.all([
        prisma.queueEntry.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            status: 'WAITING'
          }
        }),
        prisma.queueEntry.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            status: 'IN_PROGRESS'
          }
        }),
        prisma.queueEntry.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            status: 'COMPLETED'
          }
        }),
        prisma.queueEntry.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            status: 'SKIPPED'
          }
        })
      ]);

      res.json({
        success: true,
        stats: {
          waiting,
          inProgress,
          completed,
          skipped,
          total: waiting + inProgress + completed + skipped
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = QueueController;
