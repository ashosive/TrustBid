const { ethers } = require("ethers");
const { getContractInstance, getProvider } = require("./txnHelper");
const contractAbi = require("../utils/abi/market.json")

async function fetchLatestInteractions(contractAddress, contractAbi) {
    try {
            const provider = await getProvider();
            const contract = await getContractInstance(contractAddress, contractAbi, provider);

            // Filter
            const marketFilter = await contract.filters.MarketCreated().getTopicFilter();
            const betPlacedFilter = await contract.filters.BetPlaced().getTopicFilter();
            const marketResolvedFilter = await contract.filters.MarketResolved().getTopicFilter();

            const startBlock = '0x' + BigInt(0).toString(16);
            const endBlock = 'latest'
    
            const events = await provider.send('eth_getLogs',[{
                address: [
                    contractAddress
                ],
                fromBlock: startBlock,
                toBlock: endBlock,
                topics: [
                    [
                        marketFilter[0],
                        betPlacedFilter[0],
                        marketResolvedFilter[0]
                    ]
                ]
            }]);
    
            // Event parameter names mapping
            const eventParameterNames = {
                MarketCreated: ['marketAddress', 'numberOfOptions', 'eventHash', 'startTime', 'expirationTime'],
                BetPlaced: ['user', 'amount', 'option'],
                MarketResolved: ['winningOption']
            };
    
            // Decode logs
            const decodedEvents = events.map(event => {
                const eventInterface = contract.interface;
                const logDescription = eventInterface.parseLog(event);
                const parameterNames = eventParameterNames[logDescription.name] || [];
                console.log("dis ",logDescription);

                // Map the parameter names to their values
                const values = logDescription.args.reduce((acc, value, index) => {
                    const paramName = parameterNames[index] || `param${index}`;
                    acc[paramName] = typeof value === 'bigint' ? value.toString() : value;
                    return acc;
                }, {});
    
                return {
                    eventName: logDescription.name,
                    values,
                    blockNumber: BigInt(event.blockNumber).toString(),
                    transactionHash: event.transactionHash
                };
            });

            return { msg: decodedEvents, error: false };

    } catch (error) {
        console.error('Error fetching interactions:', error);
        return { msg: error.message, error: true };
    }
}

const getUserInteractionHistory = async (user,markets) => {
    try {
        // check all the data of user on each markets 
        // also store the marker status

        const userHistory = await Promise.all(
            markets.map(async (market) => {
                const data = await getUserMarketHistoryWithDetails(user, market.marketAddress);
                // console.log("data ", data, data.msg[0], data.msg[0]?.market);
        
                if (data.msg.length > 0) {
                    console.log(data.msg)
                    return {
                        event: data.msg[0].eventName,
                        market: data.msg[0]?.market,
                        isResolved: data.msg[0]?.isResolved,
                        values: data.msg[0]?.values,
                        blockNumber: data.msg[0]?.blockNumber,
                        transactionHash: data.msg[0]?.transactionHash
                    };
                }
            })
        );

        // Filter out undefined values
        const filteredHistory = userHistory.filter(item => item !== undefined);


        return { msg: filteredHistory, error: false }
        
    } catch(err) {
        console.error('Error fetching user interactions:', err);
        return { msg: err.message, error: true };
    }
}

const getUserMarketHistoryWithDetails = async (user,market) => {
    try {
            const provider = await getProvider();
            const contract = await getContractInstance(market, contractAbi, provider);

            // Filter
            const betPlacedFilter = await contract.filters.BetPlaced(user).getTopicFilter();

            const startBlock = '0x' + BigInt(0).toString(16);
            const endBlock = 'latest'
    
            const events = await provider.send('eth_getLogs',[{
                address: [
                    market
                ],
                fromBlock: startBlock,
                toBlock: endBlock,
                topics: betPlacedFilter,
            }]);
    
            // Event parameter names mapping
            const eventParameterNames = {
                BetPlaced: ['user', 'amount', 'option'],
            };

            const isResolved = await contract.marketResolved();
    
            // Decode logs
            const decodedEvents = events.map(event => {
                const eventInterface = contract.interface;
                const logDescription = eventInterface.parseLog(event);
                const parameterNames = eventParameterNames[logDescription.name] || [];

                // Map the parameter names to their values
                const values = logDescription.args.reduce((acc, value, index) => {
                    const paramName = parameterNames[index] || `param${index}`;
                    acc[paramName] = typeof value === 'bigint' ? value.toString() : value;
                    return acc;
                }, {});
    
                return {
                    eventName: logDescription.name,
                    market: market,
                    isResolved: isResolved,
                    values,
                    blockNumber: BigInt(event.blockNumber).toString(),
                    transactionHash: event.transactionHash
                };
            });

            return { msg: decodedEvents, error: false }
    } catch(err) {
        console.error('Error fetching user specific market interactions:', err);
        return { msg: err.message, error: true };
    }
}

module.exports = { fetchLatestInteractions, getUserInteractionHistory }