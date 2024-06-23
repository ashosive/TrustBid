const { eventHashService } = require("../services/event.service");
const { handleError, handleResponse } = require("../utils/responseHelper");

const eventDecodeController = async (req,res) => {
    try {
        const { eventHash } = req.body;

        if(!eventHash) {
            throw new TypeError("require body value eventhash");
        }

        const result = await eventHashService(eventHash);

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

module.exports = { eventDecodeController };