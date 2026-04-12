const express = require('express');
const router = express.Router();
const ConsultationController = require('../controllers/consultationController');
const { authenticate, requireStaff } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', ConsultationController.getAll);
router.get('/patient/:patientId', ConsultationController.getByPatient);
router.get('/:id', ConsultationController.getById);
router.get('/:id/procedures', ConsultationController.getProcedureOrders);
router.post('/', requireStaff, ConsultationController.createRules, ConsultationController.create);
router.put('/:id', requireStaff, ConsultationController.update);
router.delete('/:id', requireStaff, ConsultationController.delete);
router.put('/:id/sign', requireStaff, ConsultationController.signConsultation);
router.post('/:id/procedures', requireStaff, ConsultationController.addProcedureOrder);

module.exports = router;