const { betService, claimService, userBetInfoService, totalBetsInfoService, marketInfoService, withdrawBetService, resolveMarketService, getAdminService, getMarketIsCanceledService, cancelService, createMarketService } = require("../services/market.service");
const { handleError, handleResponse } = require("../utils/responseHelper");


const betController = async (req,res) => {
    try {
        const { market, amount, option, from } = req.body;

        if(!market || !amount || !option || !from) {
            throw new TypeError("require body values market, amount, option, from ");
        }

        const result = await betService(market, amount, option, from);

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

const claimController = async (req,res) => {
    try {
        const { market, from } = req.body;

        if(!from) {
            throw new TypeError("require body values from");
        }

        const result = await claimService(market, from);

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

const userBetInfoController = async (req,res) => {
    try {
        const { market, user } = req.body;

        if(!market || !user) {
            throw new TypeError("require body values market & user");
        }

        const result = await userBetInfoService(market, user);

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

const totalBetsInfoController = async (req,res) => {
    try {
        const { market } = req.body;

        if(!market) {
            throw new TypeError("require body values market");
        }

        const result = await totalBetsInfoService(market);

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

const marketInfoController = async (req,res) => {
    try {
        const { market } = req.body;

        if(!market) {
            throw new TypeError("require body values market");
        }

        const result = await marketInfoService(market);

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

const resolveMarketController = async (req,res) => {
    try {
        const {market, from } = req.body;

        if(!market || !from) {
            throw new TypeError("require body values market, from");
        }

        const result = await resolveMarketService(market);

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

const withdrawBetController = async (req,res) => {
    try {
        const { market, from } = req.body;

        if(!market || !from) {
            throw new TypeError("require body values market, from");
        }

        const result = await withdrawBetService(market);

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

const getAdminController = async (req,res) => {
    try {
        const result = await getAdminService();

        console.log("get admin ",result);

        handleResponse({res, statusCode: 201, result: result.message})
    } catch(err) {
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

const getMarketIsCanceledController = async (req,res) => {
    try {
        const {market} = req.query;

        if(!market){
            throw new Error("market address required");
        }
        
        const result = await getMarketIsCanceledService(market);

        if(result.error){
            throw new Error(result.message);
        }

        console.log("get is canceled ",result);

        handleResponse({res, statusCode: 201, result: result.message})
    } catch(err) {
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

const cancelController = async (req,res) => {
    try {
        const {user, market } = req.body;

        if(!user, !market) {
            throw new Error("market and user not found!");
        }

        const result = await cancelService(user, market);

        if(result.error){
            throw new Error(result.message);
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

const createMarketController = async (req,res) => {
    try {
        const {user, hash, noOfOptions, expireTime} = req.body;

        if(!user, !hash, !noOfOptions, !expireTime) {
            throw new Error('user, hash, no of options, expire time not found');
        }

        const result = await createMarketService(user,hash,noOfOptions,expireTime);

        if(result.error){
            throw new Error(result.message);
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

module.exports = { betController, claimController, userBetInfoController, totalBetsInfoController, marketInfoController, withdrawBetController, resolveMarketController, getAdminController, getMarketIsCanceledController, cancelController, createMarketController };