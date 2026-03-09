const AuthService = require('../services/authService');
const prisma = require('../config/database');
const { body, param, validationResult } = require('express-validator');

class AuthController {
  static registerRules = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
    body('firstName')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name is required'),
    body('lastName')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name is required'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'DOCTOR', 'NURSE', 'STUDENT', 'CLINIC'])
      .withMessage('Invalid role')
  ];

  // Additional validation rules for doctors
  static doctorRules = [
    body('specialization').optional().trim(),
    body('licenseNumber').optional().trim(),
    body('npiNumber').optional().trim(),
    body('deaNumber').optional().trim(),
    body('department').optional().trim(),
    body('consultationFee').optional().isFloat(),
    body('yearsExperience').optional().isInt(),
    body('medicalSchool').optional().trim(),
    body('languages').optional().isArray()
  ];

  // Additional validation rules for nurses
  static nurseRules = [
    body('nursingLicense').optional().trim(),
    body('npiNumberNurse').optional().trim(),
    body('certificationLevel').optional().isIn(['CNA', 'LPN', 'RN', 'BSN', 'MSN', 'NP', 'DNP']),
    body('specializedTraining').optional().isArray(),
    body('shiftType').optional().isIn(['DAY', 'EVENING', 'NIGHT', 'ROTATING'])
  ];

  static loginRules = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];

  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await AuthService.register(req.body);

      // Create audit log for user creation
      if (result.user) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: req.user?.id, // Admin who created the user, if authenticated
              action: 'CREATE',
              resourceType: 'User',
              resourceId: result.user.id,
              description: `Created new user: ${result.user.firstName} ${result.user.lastName} (${result.user.role}) - ${result.user.email}`,
              newValue: JSON.stringify({
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                role: result.user.role,
                phone: result.user.phone || null,
                specialization: result.user.specialization || null,
                department: result.user.department || null,
                certificationLevel: result.user.certificationLevel || null
              }),
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent')
            }
          });
        } catch (auditError) {
          console.error('Failed to create audit log:', auditError);
        }
      }

      res.status(201).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      
      res.json({
        success: true,
        user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  static async logout(req, res) {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Admin: Get all users
  static async getAllUsers(req, res) {
    try {
      const { role, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            isActive: true,
            createdAt: true,
            // Doctor fields
            specialization: true,
            department: true,
            // Nurse fields
            certificationLevel: true
          }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: users,
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

  // Admin: Update user (doctor/nurse details)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = await prisma.user.update({
        where: { id },
        data
      });

      res.json({ success: true, data: user });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = AuthController;