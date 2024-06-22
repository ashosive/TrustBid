const logger = require("../logger/index.js");
const erc20Abi  = require("../utils/abi/erc20.json");
const { getContractInstance, getReadFunction, getUnsignedTxn, getReadFunctionNoParams }  = require("../utils/txnHelper.js");

const getApproveTxn = async (approver, spender, value, token) => {
    try {
        const params = [spender, value];
        const result = await getUnsignedTxn(token,erc20Abi,"approve",params,approver);
        console.log("txn ",result)

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

    } catch(err){
        return {
            message: err.message,
            error: true
        }
    }
}

const getAllowance = async (approver, spender, token) => {
    try {
        const paramsArray = [approver, spender];

        const result = await getReadFunction(token, erc20Abi,"allowance",paramsArray);
        console.log(result)
        logger.debug("read value service "+result)

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

const getBalance = async (account, token) => {
    try {
        const params = [account];

        const result = await getReadFunction(token,erc20Abi,"balanceOf",params);

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

const getSymbol = async (token) => {
    try {
        
        const result = await getReadFunctionNoParams(token,erc20Abi,"symbol");

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

    } catch(err){
        return {
            message: err.message,
            error: true
        }
    }
}


module.exports = { getApproveTxn, getAllowance, getBalance, getSymbol };