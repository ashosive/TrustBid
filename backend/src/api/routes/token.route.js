const express = require('express');
const { allowanceController, approveController, balanceController, symbolController } = require('../controllers/token.controller.js');
const router = express.Router();

router.post('/token/balance',balanceController);
router.post('/token/allowance',allowanceController);
router.post('/token/symbol',symbolController);
router.post('/token/approve',approveController);

module.exports = router;