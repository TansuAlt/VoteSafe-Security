const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/create', rateLimiter, pollController.createPoll);
module.exports = router;