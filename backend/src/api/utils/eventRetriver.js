const { ethers } = require("ethers");
const { getContractInstance, getProvider } = require("./txnHelper");
const contractAbi = require("../utils/abi/market.json")

/**
 * @dev Fetches all the events for specific market
 * @param {*} contractAddress Address of the market
 * @param {*} contractAbi Abi of the market
 * @returns Object with msg and error
 */
async function fetchLatestInteractions(contractAddress, contractAbi) {
    try {
            const provider = await getProvider();
            const contract = await getContractInstance(contractAddress, contractAbi, provider);

            // Filters
            const marketFilter = await contract.filters.MarketCreated().getTopicFilter();
            const betPlacedFilter = await contract.filters.BetPlaced().getTopicFilter();
            const marketResolvedFilter = await contract.filters.MarketResolved().getTopicFilter();
            const claimedFilter = await contract.filters.Claimed().getTopicFilter();
            const betUpdatedFilter = await contract.filters.BetUpdated().getTopicFilter();
            const marketCanceledFilter = await contract.filters.MarketCanceled().getTopicFilter();
            const withdrawnFilter = await contract.filters.Withdrawn().getTopicFilter();

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
                        marketResolvedFilter[0],
                        claimedFilter[0],
                        betUpdatedFilter[0],
                        marketCanceledFilter[0],
                        withdrawnFilter[0]
                    ]
                ]
            }]);
    
            // Event parameter names mapping
            const eventParameterNames = {
                MarketCreated: ['marketAddress', 'minBetAmount', 'numberOfOptions', 'eventHash', 'expirationTime'],
                BetPlaced: ['user', 'amount', 'option'],
                MarketResolved: ['winningOption'],
                Claimed: ['user','amount','option'],
                BetUpdated: ['user', 'newAmount', 'newOption'],
                MarketCanceled: [],
                Withdrawn: ['account', 'amount', 'option']
            };
    
            // Decode logs
            const decodedEvents = events.map(async event => {
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

                // Get timestamp asynchronously
                const timestamp = await getEventTimestamp(event.blockNumber, contract);

                if(timestamp.error){
                    throw new Error(timestamp.msg);
                }
    
                return {
                    eventName: logDescription.name,
                    values,
                    blockNumber: BigInt(event.blockNumber).toString(),
                    transactionHash: event.transactionHash,
                    timestamp: timestamp.msg
                };

            });
            // Wait for all promises in decodedEvents to resolve
            const decodedEventsWithTimestamps = await Promise.all(decodedEvents);
            
            return { msg: decodedEventsWithTimestamps, error: false };

    } catch (error) {
        console.error('Error fetching interactions:', error);
        return { msg: error.message, error: true };
    }
}

/**
 * Helper to convert block number to block timestamp
 * @param {*} blockNumber block number to convert
 * @returns Object with msg and error
 */
const getEventTimestamp = async (blockNumber) => {
    try {
        const provider = await getProvider();
        const blockHex = '0x' + BigInt(blockNumber).toString(16);
        const block = await provider.getBlock(blockHex);

        if (block) {
            return {msg: block.timestamp, error: false} // Convert timestamp to human-readable format if needed
        } else {
            throw new Error(`Block not found for block number: ${blockNumber}`);
        }
    } catch (error) {
        console.error("Error fetching block information:", error);
        // Handle error as needed, e.g., show error message, log, etc.
        return {msg: error.message, error: true};
    }
};

const getUserInteractionHistory = async (user,markets) => {
    try {
        // check all the data of user on each markets 
        // also store the marker status
        let totalAmountInvested = 0;

        const userHistory = await Promise.all(
            markets.map(async (market) => {
                const data = await getUserMarketHistoryWithDetails(user, market.marketAddress);
                // console.log("data ", data, data.msg[0], data.msg[0]?.market);
        
                if (data.msg.length > 0) {
                    const amount = data.msg[0].values?.amount ? parseFloat(data.msg[0].values.amount) : 0;
                    try {
                        const provider = await getProvider(); 
                        const blockHex = '0x' + BigInt(data.msg[0]?.blockNumber).toString(16);
                        const block = await provider.getBlock(blockHex);
                
                        if (block) {
                            const timestamp = block.timestamp;
                            console.log("Block details:", block);
                            console.log("Timestamp:", timestamp);
                            totalAmountInvested += amount;
                
                            return {
                                event: data.msg[0].eventName,
                                market: data.msg[0]?.market,
                                isResolved: data.msg[0]?.isResolved,
                                values: data.msg[0]?.values,
                                blockNumber: data.msg[0]?.blockNumber,
                                transactionHash: data.msg[0]?.transactionHash,
                                timestamp: timestamp // Convert timestamp to human-readable format if needed
                            };
                        } else {
                            throw new Error(`Block not found for block number: ${data.msg[0]?.blockNumber}`);
                        }
                    } catch (error) {
                        console.error("Error fetching block information:", error);
                        // Handle error as needed, e.g., show error message, log, etc.
                        throw error;
                    }
                }
            })
        );

        // Filter out undefined values
        const filteredHistory = userHistory.filter(item => item !== undefined);
        const result = {
            totalAmountInvested : totalAmountInvested,
            details : filteredHistory
        }


        return { msg: result, error: false }
        
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