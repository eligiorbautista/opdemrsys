const express = require('express');
const router = express.Router();
const QueueController = require('../controllers/queueController');

// Public route - no authentication required
router.get('/queue', QueueController.getAll);

module.exports = router;
