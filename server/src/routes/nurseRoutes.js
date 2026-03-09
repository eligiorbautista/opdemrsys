const express = require('express');
const router = express.Router();
const NurseDocumentationController = require('../controllers/nurseDocumentationController');
const { authenticate, requireNurseOrAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', NurseDocumentationController.getAll);
router.get('/:id', NurseDocumentationController.getById);
router.get('/patient/:patientId', NurseDocumentationController.getByPatient);
router.post('/', requireNurseOrAdmin, NurseDocumentationController.createRules, NurseDocumentationController.create);
router.put('/:id', requireNurseOrAdmin, NurseDocumentationController.update);
router.delete('/:id', requireNurseOrAdmin, NurseDocumentationController.delete);

module.exports = router;
