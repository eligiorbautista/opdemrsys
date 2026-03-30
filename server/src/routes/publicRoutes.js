const express = require('express');
const router = express.Router();
const QueueController = require('../controllers/queueController');
const PublicController = require('../controllers/publicController');

// Public route - no authentication required
router.get('/queue', QueueController.getAll);

// Public self-service routes
router.get('/patients/lookup', PublicController.lookupPatient);
router.post('/register', PublicController.registerRules, PublicController.selfRegister);
router.get('/queue-status', PublicController.getQueueStatus);

module.exports = router;
