const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/auditLogController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);

// Create audit log (automatically called by other services)
router.post('/', AuditLogController.create);

// Get all audit logs (Admin only)
router.get('/', requireAdmin, AuditLogController.getAll);

// Get audit logs by patient
router.get('/patient/:patientId', requireAdmin, AuditLogController.getByPatient);

// Get audit logs by user
router.get('/user/:userId', requireAdmin, AuditLogController.getByUser);

module.exports = router;