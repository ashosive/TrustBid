const express = require('express');
const { eventDecodeController, eventLatestInteractionsController, eventAllLatestInteractionsController } = require('../controllers/event.controller');
const router = express.Router();

router.post('/event/decode',eventDecodeController);

router.get('/event/interactions/latest',eventLatestInteractionsController);

router.get('/event/interactions/all/',eventAllLatestInteractionsController)

module.exports = router;