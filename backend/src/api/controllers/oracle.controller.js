const { resolveOracleService } = require("../services/oracle.service");
const { handleResponse, handleError } = require("../utils/responseHelper");

const resolveOracleController = async (req,res) => {
    try {
        const {date, title } = req.body;

        if(!date || !title) {
            throw new Error("date and title needed");
        }

        const result = await resolveOracleService(date,title);

        console.log("result txn ",result)

        if(result.error){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message})

    } catch(err) {
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}



module.exports = { resolveOracleController }