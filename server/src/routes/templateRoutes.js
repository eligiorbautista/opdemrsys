const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/templateController');
const { authenticate, requireStaff } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', TemplateController.getAll);
router.get('/:id', TemplateController.getById);
router.post('/', requireStaff, TemplateController.createRules, TemplateController.create);
router.put('/:id', requireStaff, TemplateController.update);
router.delete('/:id', requireStaff, TemplateController.delete);

module.exports = router;