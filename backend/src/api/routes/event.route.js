const express = require('express');
const { eventDecodeController } = require('../controllers/event.controller');
const router = express.Router();

router.post('/event/decode',eventDecodeController);

module.exports = router;