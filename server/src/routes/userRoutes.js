const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/authMiddleware');
const AuthController = require('../controllers/authController');

const router = express.Router();

router.use(authenticate);

// Helper function to create audit log
async function createAuditLog(req, action, resourceType, resourceId, description, oldValue = null, newValue = null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action,
        resourceType,
        resourceId,
        description,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// Get all users (Admin only)
router.get('/', async (req, res) => {
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
          licenseNumber: true,
          consultationFee: true,
          yearsExperience: true,
          availabilitySchedule: true,
          // Nurse fields
          nursingLicense: true,
          certificationLevel: true,
          shiftType: true
        }
      }),
      prisma.user.count({ where })
    ]);

    // Parse availabilitySchedule JSON strings to arrays
    const parsedUsers = users.map(user => {
      if (user.availabilitySchedule) {
        try {
          user.availabilitySchedule = JSON.parse(user.availabilitySchedule);
        } catch (e) {
          user.availabilitySchedule = [];
        }
      }
      return user;
    });

    res.json({
      success: true,
      data: parsedUsers,
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
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
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
        licenseNumber: true,
        npiNumber: true,
        deaNumber: true,
        department: true,
        consultationFee: true,
        yearsExperience: true,
        medicalSchool: true,
        languages: true,
        boardCertifications: true,
        fellowships: true,
        availabilitySchedule: true,
        // Nurse fields
        nursingLicense: true,
        npiNumberNurse: true,
        certificationLevel: true,
        specializedTraining: true,
        shiftType: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Parse availabilitySchedule JSON string to array
    if (user.availabilitySchedule) {
      try {
        user.availabilitySchedule = JSON.parse(user.availabilitySchedule);
      } catch (e) {
        user.availabilitySchedule = [];
      }
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user (Admin only - for doctor/nurse details)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Get current user to determine role
    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userRole = data.role || currentUser.role;
    const updateData = { ...data };

    // Only include doctor fields if role is DOCTOR
    if (userRole !== 'DOCTOR') {
      delete updateData.specialization;
      delete updateData.department;
      delete updateData.licenseNumber;
      delete updateData.consultationFee;
      delete updateData.yearsExperience;
      delete updateData.availabilitySchedule;
    } else {
      // Convert availabilitySchedule array to JSON string for storage
      if (updateData.availabilitySchedule && Array.isArray(updateData.availabilitySchedule)) {
        updateData.availabilitySchedule = JSON.stringify(updateData.availabilitySchedule);
      }
    }

    // Only include nurse fields if role is NURSE
    if (userRole !== 'NURSE') {
      delete updateData.nursingLicense;
      delete updateData.certificationLevel;
      delete updateData.shiftType;
    }

    // Remove empty strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        delete updateData[key];
      }
    });

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Create audit log for user update
    const oldValue = {
      id: currentUser.id,
      email: currentUser.email,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      role: currentUser.role,
      phone: currentUser.phone,
      isActive: currentUser.isActive,
      specialization: currentUser.specialization || null,
      department: currentUser.department || null,
      certificationLevel: currentUser.certificationLevel || null,
      availabilitySchedule: currentUser.availabilitySchedule || null
    };
    const newValue = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      specialization: user.specialization || null,
      department: user.department || null,
      certificationLevel: user.certificationLevel || null,
      availabilitySchedule: user.availabilitySchedule || null
    };
    await createAuditLog(req, 'UPDATE', 'User', id, `Updated user: ${currentUser.firstName} ${currentUser.lastName} (${currentUser.role}) - ${currentUser.email}`, oldValue, newValue);

    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all doctors
router.get('/role/doctor', async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR', isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        department: true,
        yearsExperience: true,
        languages: true,
        availabilitySchedule: true
      }
    });

    // Parse availabilitySchedule JSON strings to arrays
    const parsedDoctors = doctors.map(doctor => {
      if (doctor.availabilitySchedule) {
        try {
          doctor.availabilitySchedule = JSON.parse(doctor.availabilitySchedule);
        } catch (e) {
          doctor.availabilitySchedule = [];
        }
      }
      return doctor;
    });

    res.json({ success: true, data: parsedDoctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all nurses
router.get('/role/nurse', async (req, res) => {
  try {
    const nurses = await prisma.user.findMany({
      where: { role: 'NURSE', isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        certificationLevel: true,
        specializedTraining: true,
        shiftType: true
      }
    });

    res.json({ success: true, data: nurses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deactivate user (Admin only)
router.put('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    // Create audit log for user deactivation
    await createAuditLog(req, 'DEACTIVATE', 'User', id, `Deactivated user: ${currentUser.firstName} ${currentUser.lastName} (${currentUser.role}) - ${currentUser.email}`, currentUser, user);

    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Activate user (Admin only)
router.put('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });

    // Create audit log for user activation
    await createAuditLog(req, 'ACTIVATE', 'User', id, `Activated user: ${currentUser.firstName} ${currentUser.lastName} (${currentUser.role}) - ${currentUser.email}`, currentUser, user);

    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset user password (Admin only)
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    // Create audit log for password reset
    await createAuditLog(req, 'UPDATE', 'User', id, `Reset password for user: ${currentUser.firstName} ${currentUser.lastName} (${currentUser.role}) - ${currentUser.email}`, currentUser, user);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;