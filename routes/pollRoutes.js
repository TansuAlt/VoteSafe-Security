const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const rateLimiter = require('../middleware/rateLimiter');

// Oluşturma
router.post('/create', rateLimiter, pollController.createPoll);

// YENİ: Görüntüleme (GET)
router.get('/data', pollController.getPoll);

// YENİ: Oy Verme (POST)
router.post('/vote', rateLimiter, pollController.vote);

module.exports = router;