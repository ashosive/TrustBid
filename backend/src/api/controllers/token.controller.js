const logger = require( "../logger/index.js");
const { getAllowance, getApproveTxn, getBalance, getSymbol } = require("../services/token.service.js");
const { handleError, handleResponse } = require("../utils/responseHelper.js");

const approveController = async (req,res) => {
    try {
        
        const { approver, spender, token, value } = req.body;
    
        if(!approver || !spender || !token || !value) {
            throw new TypeError("require body values approver, spender, token, value ");
        }

        const result = await getApproveTxn(approver, spender, value, token);
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

const allowanceController = async (req,res) => {
    try {
        const {approver, spender, token } = req.body;

        if(!approver || !spender || !token) {
            throw new TypeError("require body values approver, spender, token");
        }

        const result = await getAllowance(approver, spender, token);

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

const balanceController = async (req,res) => {
    try {
        const {account, token} = req.body;

        if(!account || !token) {
            throw new TypeError("require body values account, token");
        }

        const result = await getBalance(account,token);
    
        if(result.error){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message});

    } catch(err){
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

const symbolController = async (req,res) => {
    try {
        const {token} = req.body;

        if(!token){
            throw new TypeError("require body values token");
        }

        const result = await getSymbol(token);

        if(result.error){
            throw new TypeError(result.message);
        }

        handleResponse({res, statusCode: 201, result: result.message});

    } catch(err) {
        if (err instanceof TypeError) {
            handleError({ res, statusCode: 400, err: err.message });
        } else {// internal error
            handleError({ res, statusCode: 500, err: err.message });
        }
    }
}

module.exports = { approveController, allowanceController, balanceController, symbolController }