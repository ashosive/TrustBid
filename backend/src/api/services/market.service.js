const marketAbi = require("../utils/abi/market.json");
const { getUnsignedTxn, getUnsignedNoParamsTxn, getReadFunction, getReadFunctionNoParams } = require("../utils/txnHelper");

const betService = async (market, amount, option, from) => {
    try {
        const params = [amount, option];
        const result = await getUnsignedTxn(market,marketAbi,"placeBet",params,from);
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

const claimService = async (market, from) => {
    try {
        const result = await getUnsignedNoParamsTxn(market,marketAbi,"claimWinnings",from);
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

const userBetInfoService = async (market,user) => {
    try {
        const params = [user];
        const result = await getReadFunction(market,marketAbi,"bets",params);
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

const totalBetsInfoService = async (market) => {
    try {
        const options = await getReadFunctionNoParams(market,marketAbi,"numberOfOptions");
        console.log("no of options ",options);

        const totalOptions = {};
        for(let i = 1; i <= options.msg; i++){
            const params = [i];
            const result = await getReadFunction(market,marketAbi,"totalBets",params);
            console.log("txn ",result);
            if(result.error){
                throw new TypeError("error fetching totalbets!");
            }
            totalOptions[i] = result.msg;
        }

        return {
            message: totalOptions,
            error: false
        }

    } catch(err){
        return {
            message: err.message,
            error: true
        }
    }
}

const marketInfoService = async (market) => {
    try {
        const marketInfo = {};
        const values = ["marketResolved","winningOption","liquidityPool","numberOfOptions","eventHash","startTime","expirationTime"];
        for(let i = 0; i < values.length; i++){
            const result = await getReadFunctionNoParams(market, marketAbi, values[i]);
            if(result.error){
                throw new TypeError(`Error fetching ${values[i]} of market info`);
            }
            marketInfo[values[i]] = result.msg;
        }

        return {
            message: marketInfo,
            error: false
        }

    } catch(err){
        return {
            message: err.message,
            error: true
        }
    }
}

module.exports = { betService, claimService, userBetInfoService, totalBetsInfoService, marketInfoService }