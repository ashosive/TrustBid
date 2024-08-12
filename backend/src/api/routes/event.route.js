const express = require('express');
const { eventDecodeController, eventAllInteractionsController, eventAllUserInteractionsController,eventEncodeController, eventConvertDateToUnixController} = require('../controllers/event.controller');
const router = express.Router();

router.post('/event/decode',eventDecodeController);

router.post('/event/encode',eventEncodeController);

router.get('/event/convert/date-to-unix',eventConvertDateToUnixController);

router.get('/event/interactions/all',eventAllInteractionsController);

router.get('/event/interactions/user/all',eventAllUserInteractionsController)
router.get('/event/interactions/user/all',eventAllUserInteractionsController)

module.exports = router;