const { fetchMatches } = require("../utils/matchScheduleFetcher");
const teams = require("../utils/teams.json");

const fetchTeamsService = async () => {
    try {
        const result = teams;
        if(!result){
            return {
                message: "Teams not found",
                error: true
            }
        }

        return {
            message: result,
            error: false
        }
    } catch(err) {
        return {
            message: err.message,
            error: true
        }
    }
}

const fetchMatchesService = async (date) => {
    try {
        const result = await fetchMatches(date);
        if(result.error){
            return {
                message: result.msg,
                error: true
            }
        }

        return {
            message: result.msg,
            error: false
        }
    } catch(err) {
        return {
            message: err.message,
            error: true
        }
    }
}
const fetchTeamInfoService = async (queryParam) => {
    try {
        const { teamSymbol, teamId } = queryParam;

        const team = teams.find((team) => {
            console.log(team,teamId,typeof teamId, teamSymbol, typeof teamSymbol, team.id == String(teamId), team.symbol == teamSymbol);
            if(team.id == String(teamId) ||team.symbol == teamSymbol){
                return team;
            }
        })

        if (!team) {
            throw new TypeError("Team not found");
        }

        return { error: false, message: team };
    } catch(err) {
        return {
            message: err.message,
            error: true
        }
    }
}

module.exports = { fetchTeamsService, fetchMatchesService, fetchTeamInfoService }