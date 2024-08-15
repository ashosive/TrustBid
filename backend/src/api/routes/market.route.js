const express = require('express');
const { betController, claimController, userBetInfoController, totalBetsInfoController, marketInfoController, resolveMarketController, withdrawBetController, getAdminController, getMarketIsCanceledController, cancelController, createMarketController } = require('../controllers/market.controller');
const router = express.Router();

router.post('/market/bet',betController);
router.post('/market/claim',claimController);
router.post('/market/userBetInfo',userBetInfoController);
router.post('/market/totalBetsInfo',totalBetsInfoController);
router.post('/market/marketInfo',marketInfoController);
router.post('/market/resolveMarket',resolveMarketController);
router.post('/market/withdrawBet',withdrawBetController);
router.get('/market/admin',getAdminController);
router.get('/market/isCanceled',getMarketIsCanceledController);
router.post('/market/cancel',cancelController);
router.post("/market/create",createMarketController);

module.exports = router;