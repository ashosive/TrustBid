const { fetchTeamsService, fetchMatchesService, fetchTeamInfoService, fetchMatchInfoService } = require("../services/game.service");
const { handleError, handleResponse } = require("../utils/responseHelper");

const fetchTeamsController = async (req,res) => {
    try {
        const result = await fetchTeamsService();

        console.log("result events ",result)

        if(result.error){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message})
    } catch(err) {
        if (err instanceof TypeError) {
            console.log("Error type ", err.message)
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

const fetchMatchesController = async (req, res) => {
    try {
        const date = req.query.date;

        if(!date){
            throw new Error("Invalid date!");
        }

        const result = await fetchMatchesService(date);

        console.log("result events ",result)

        if(result.error){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message})
    } catch(err) {
        if (err instanceof TypeError) {
            console.log("Error type ", err.message)
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

const fetchTeamInfoController = async (req,res) => {
    try {
        console.log(req.query);
        const { teamSymbol, teamId } = req.query;

        if(!teamSymbol && !teamId){
            throw new Error("Anyone of the team details needed to fetch team info");
        }

        // Prepare the query parameter to pass to the service
        const queryParam = teamSymbol ? { teamSymbol } : { teamId };
        console.log("params ",queryParam);
        
        const result = await fetchTeamInfoService(queryParam);

        console.log("result events ",result)

        if(result.error){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message})
    } catch(err){
        if (err instanceof TypeError) {
            console.log("Error type ", err.message)
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

const fetchMatchInfoController = async (req,res) => {
    try {
        const { date, title } = req.query;
 
        if(!date || !title){
            throw new Error("date and title not found in fetching match details");
        }
        
        const result = await fetchMatchInfoService(date,title);

        console.log("result events ",result)

        if(result.error){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message})
    } catch(err) {
        if (err instanceof TypeError) {
            console.log("Error type ", err.message)
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

module.exports = { fetchTeamsController, fetchMatchesController, fetchTeamInfoController, fetchMatchInfoController };