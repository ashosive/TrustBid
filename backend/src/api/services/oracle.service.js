const { fetchMatchInfo } = require("../utils/matchScheduleFetcher");

const resolveOracleService = async (date, title) => {
    try {
        const result = await fetchMatchInfo(date,title);
        console.log("txn ",result)

        if(result.error){
            return {
                message: result.msg,
                error: true
            }
        }

        const gameInfo = result.msg.gameInfo;
        console.log(gameInfo);
        // Check if the game is ongoing
        if (/^[0-9]{1,2}:[0-9]{2} [AP]M ET$/.test(gameInfo)) {
            throw new Error('Results not out yet');
        }


       // Parse the scores from the gameInfo string
        const scorePattern = /^(\w+)\s(\d+),\s(\w+)\s(\d+)$/;
        const match = scorePattern.exec(gameInfo);
        console.log(match)

        if (match) {
            const [_, team1Symbol, team1Score, team2Symbol, team2Score] = match;
            const team1ScoreNum = parseInt(team1Score, 10);
            const team2ScoreNum = parseInt(team2Score, 10);

            // Determine which team has the higher score
            let winningTeamSymbol;
            let winningTeamIndex;

            if (team1ScoreNum > team2ScoreNum) {
                winningTeamSymbol = team1Symbol;
                winningTeamIndex = 0;
            } else {
                winningTeamSymbol = team2Symbol;
                winningTeamIndex = 1;
            }

            // Find the winning team object
            // const winningTeam = ;

            const msg = {
                symbol: winningTeamSymbol,
                optionIndex: winningTeamIndex
            };

            return {
                message: msg,
                error: false
            }
        } else {
            throw new Error('Invalid gameInfo format');
        }

        
    } catch(err) {
        return {
            message: err.message,
            error: true
        }
    }
}

module.exports = { resolveOracleService }