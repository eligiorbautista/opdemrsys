const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');
const { authenticate, requireStaff } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', PatientController.getAll);
router.get('/search', requireStaff, PatientController.getAll);
router.get('/:id', PatientController.getById);
router.get('/:id/history', PatientController.getHistory);
router.get('/:id/medical-history', PatientController.getMedicalHistory);
router.post('/', requireStaff, PatientController.createRules, PatientController.create);
router.put('/:id', requireStaff, PatientController.update);
router.delete('/:id', requireStaff, PatientController.delete);

module.exports = router;