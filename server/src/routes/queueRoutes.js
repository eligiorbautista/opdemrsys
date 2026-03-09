const express = require('express');
const router = express.Router();
const QueueController = require('../controllers/queueController');
const QueueEntryController = require('../controllers/queueEntryController');
const { authenticate, requireStaff } = require('../middleware/authMiddleware');

router.use(authenticate);

// Queue Entries - specific routes must come before /:id
router.get('/entries/all', QueueEntryController.getAllEntries);
router.post('/entries', requireStaff, QueueEntryController.create);
router.patch('/entries/:id', requireStaff, QueueEntryController.update);
router.delete('/entries/:id', requireStaff, QueueEntryController.delete);

router.post('/call-next/:queueId', requireStaff, QueueController.callNext);
router.get('/stats', QueueController.getStats);

// General routes
router.get('/', QueueController.getAll);
router.get('/:id', QueueController.getById);
router.post('/', requireStaff, QueueController.createRules, QueueController.create);
router.patch('/:id/complete', requireStaff, QueueController.complete);
router.patch('/:id/skip', requireStaff, QueueController.skip);

module.exports = router;
