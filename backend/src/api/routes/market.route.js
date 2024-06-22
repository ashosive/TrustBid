const express = require('express');
const marketsController = require('../controllers/subgraph.controller');
const router = express.Router();

router.post('/market/bet',marketsController);
router.post('/market/claim',marketsController);
router.post('/market/userBetInfo',marketsController);
router.post('/market/totalBetsInfo',marketsController);
router.post('/market/betInfo',marketsController);

module.exports = router;