const express = require('express');
const { resolveOracleController } = require('../controllers/oracle.controller');

const router = express.Router();

router.post('/oracle/resolve',resolveOracleController);


module.exports = router;