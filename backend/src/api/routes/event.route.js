const express = require('express');
const { eventDecodeController, eventAllInteractionsController, eventAllUserInteractionsController, } = require('../controllers/event.controller');
const router = express.Router();

router.post('/event/decode',eventDecodeController);

router.get('/event/interactions/all',eventAllInteractionsController);

router.get('/event/interactions/user/all',eventAllUserInteractionsController)

module.exports = router;