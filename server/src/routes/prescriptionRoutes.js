const express = require('express');
const router = express.Router();
const PrescriptionController = require('../controllers/prescriptionController');
const { authenticate, requireStaff } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', PrescriptionController.getAll);
router.get('/medications', PrescriptionController.getMedications);
router.get('/:id', PrescriptionController.getById);
router.get('/patient/:patientId', PrescriptionController.getByPatient);
router.post('/', requireStaff, PrescriptionController.createRules, PrescriptionController.create);
router.put('/:id', requireStaff, PrescriptionController.update);

module.exports = router;
