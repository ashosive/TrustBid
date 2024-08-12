const marketAbi = require("../utils/abi/market.json");
const marketFactoryAbi = require("../utils/abi/marketFactory.json");
const { config } = require("../utils/config");
const { getUnsignedTxn, getUnsignedNoParamsTxn, getReadFunction, getReadFunctionNoParams } = require("../utils/txnHelper");

const betService = async (market, amount, option, from) => {
    try {
        const amountWithDecimals = amount * 1e18;
        const params = [amountWithDecimals, option];
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

        const totalOptions = {
            totalBidAmount: 0, // This holds the total amount of all bids combined
            options: []
        };
        const result = await getReadFunctionNoParams(market, marketAbi,"liquidityPool");
        if(result.error){
            throw new TypeError(result.msg);
        }
         totalOptions.totalBidAmount = result.msg / 1e18;

        for(let i = 0; i < options.msg; i++){
            const params = [i];
            const result = await getReadFunction(market,marketAbi,"totalBets",params);
            console.log("txn ",result);
            if(result.error){
                throw new TypeError("error fetching totalbets!");
            }
            totalOptions.options[i] = result.msg / 1e18;
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

const resolveMarketService = async(market,from) => {
    try {
        const result = await getUnsignedNoParamsTxn(market,marketAbi,"resolveMarket",from);
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
    } catch(err) {
        return {
            message: err.message,
            error: true
        }
    }
}

const withdrawBetService = async (market, from) => {
    try {
        const result = await getUnsignedNoParamsTxn(market,marketAbi,"withdrawBet",from);
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
    } catch(err) {
        return {
            message: err.message,
            error: true
        }
    }
}

const getAdminService = async () => {
    try {
        const data = config();
        const result = await getReadFunctionNoParams(data.factory,marketFactoryAbi,"owner");
        console.log("admin function call ",result)

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

module.exports = { betService, claimService, userBetInfoService, totalBetsInfoService, marketInfoService, resolveMarketService, withdrawBetService, getAdminService }