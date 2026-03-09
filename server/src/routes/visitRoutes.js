const express = require('express');
const router = express.Router();
const VisitController = require('../controllers/visitController');
const { authenticate, requireStaff } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', VisitController.getAll);
router.get('/daily', VisitController.getDaily);
router.get('/:id', VisitController.getById);
router.post('/', requireStaff, VisitController.createRules, VisitController.create);
router.put('/:id', requireStaff, VisitController.update);
router.patch('/:id/start', requireStaff, VisitController.startVisit);
router.patch('/:id/end', requireStaff, VisitController.endVisit);

module.exports = router;
