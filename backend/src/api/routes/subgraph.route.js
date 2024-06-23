const express = require('express');
const marketsController = require('../controllers/subgraph.controller');
const router = express.Router();

router.get('/subgraph/markets',marketsController);

module.exports = router;