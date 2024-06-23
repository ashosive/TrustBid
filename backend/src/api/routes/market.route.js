const express = require('express');
const { betController, claimController, userBetInfoController, totalBetsInfoController, marketInfoController } = require('../controllers/market.controller');
const router = express.Router();

router.post('/market/bet',betController);
router.post('/market/claim',claimController);
router.post('/market/userBetInfo',userBetInfoController);
router.post('/market/totalBetsInfo',totalBetsInfoController);
router.post('/market/marketInfo',marketInfoController);

module.exports = router;