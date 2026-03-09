const { body, param, validationResult } = require('express-validator');
const prisma = require('../config/database');

class TemplateController {
  static createRules = [
    body('name').trim().notEmpty().withMessage('Template name is required'),
    body('type').isIn(['SOAP', 'PRESCRIPTION', 'LAB_ORDER']).withMessage('Invalid template type'),
    body('templateData').notEmpty().withMessage('Template data is required')
  ];

  static async getAll(req, res) {
    try {
      const { type, category, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = { isActive: true };
      if (type) where.type = type;
      if (category) where.category = category;

      const [templates, total] = await Promise.all([
        prisma.medicalTemplate.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            createdBy: true,
            createdAt: true
          }
        }),
        prisma.medicalTemplate.count({ where })
      ]);

      res.json({
        success: true,
        data: templates,
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
      
      const template = await prisma.medicalTemplate.findUnique({
        where: { id }
      });

      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({ success: true, data: template });
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

      const template = await prisma.medicalTemplate.create({
        data: {
          ...req.body,
          createdBy: req.user.id
        }
      });

      res.status(201).json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create template' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      
      const template = await prisma.medicalTemplate.update({
        where: { id },
        data: req.body
      });

      res.json({ success: true, data: template });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }
      res.status(500).json({ success: false, error: 'Failed to update template' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.medicalTemplate.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete template' });
    }
  }
}

module.exports = TemplateController;