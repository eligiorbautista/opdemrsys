const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token || token === 'null') {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token && token !== 'null') {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next();
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
    }

    next();
  };
};

const requireAnyRole = (...allowedRoles) => {
  return requireRole(...allowedRoles);
};

const requireAdmin = requireRole('ADMIN');
const requireDoctor = requireRole('DOCTOR');
const requireNurse = requireRole('NURSE');
const requireNurseOrAdmin = requireRole('ADMIN', 'NURSE');
const requireStaff = requireRole('ADMIN', 'DOCTOR', 'NURSE');

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireAnyRole,
  requireAdmin,
  requireDoctor,
  requireNurse,
  requireNurseOrAdmin,
  requireStaff
};
