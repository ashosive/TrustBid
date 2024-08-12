const express = require('express');
const {fetchTeamsController, fetchMatchesController, fetchTeamInfoController} = require('../controllers/game.controller');
const router = express.Router();

router.get("/game/teams",fetchTeamsController);
router.get("/game/team-info",fetchTeamInfoController);
router.get("/game/matches/upcoming/3-days",fetchMatchesController);

module.exports = router;