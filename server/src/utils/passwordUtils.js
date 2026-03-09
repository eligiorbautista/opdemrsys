const bcrypt = require('bcryptjs');

const PasswordUtils = {
  async hash(password, saltRounds = 10) {
    return bcrypt.hash(password, saltRounds);
  },

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  },

  validateStrength(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = PasswordUtils;
