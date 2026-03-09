const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/healthController');

router.get('/health', HealthController.check);

module.exports = router;
