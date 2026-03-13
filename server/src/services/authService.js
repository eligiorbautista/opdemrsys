const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

class AuthService {
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  static async register(data) {
    const { email, password, firstName, lastName, role = 'DOCTOR', phone, specialization, department, licenseNumber, consultationFee, yearsExperience, nursingLicense, certificationLevel, shiftType } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);

    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      phone
    };

    // Add doctor-specific fields
    if (role === 'DOCTOR') {
      userData.specialization = specialization;
      userData.department = department;
      userData.licenseNumber = licenseNumber;
      if (consultationFee !== undefined && consultationFee !== null && consultationFee !== '') {
        userData.consultationFee = parseFloat(consultationFee);
      }
      if (yearsExperience !== undefined && yearsExperience !== null && yearsExperience !== '') {
        userData.yearsExperience = parseInt(yearsExperience);
      }
    }

    // Add nurse-specific fields
    if (role === 'NURSE') {
      userData.nursingLicense = nursingLicense;
      userData.certificationLevel = certificationLevel;
      userData.shiftType = shiftType;
    }

    const user = await prisma.user.create({
      data: userData
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  static async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = AuthService;
