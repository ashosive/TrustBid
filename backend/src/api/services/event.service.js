const { decode, encode } = require("../utils/eventHashHelper");
const { fetchLatestInteractions, getUserInteractionHistory } = require("../utils/eventRetriver");
const marketAbi = require("../utils/abi/market.json");
const { queryGraph } = require("../utils/subgraphHelper");
const { convertDateToUnix } = require("../utils/dateToUnix");

const eventHashService = async (eventHash) => {
    try {
        const result = decode(eventHash);

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

const eventHashEncodeService = async(title, options, teamDetails) => {
    try {
        const result = encode(title,options,teamDetails);

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

const eventAllInteractionsService = async (market) => {
    try {
       
        const result = await fetchLatestInteractions(market, marketAbi);
        console.log("result ",result);

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

const eventAllUserInteractionsService = async (user) => {
    try {
        // gets all the markets 
        const markets = await queryGraph();

        if(markets.error){
            throw new Error(markets.msg);
        }

        const result = await getUserInteractionHistory(user, markets.msg);

        if(result.error){
            throw new Error(result.msg);
        }

        return {
            message: result.msg,
            error: false
        }
        // get all the details of users and there status
    } catch(err) {
        return {
            message: err.message,
            error: true
        }
    }
}

const eventConvertDateToUnixService = async (date) => {
    try {
        const result = convertDateToUnix(date);

        if(result.error) {
            throw new Error(result.msg);
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

module.exports = { eventHashService, eventAllInteractionsService, eventAllUserInteractionsService, eventHashEncodeService, eventConvertDateToUnixService };