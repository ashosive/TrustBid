const axios = require("axios");
const uniswapURL = "https://api.studio.thegraph.com/query/43306/gld-token-wallet-app/v0.0.1" ; // https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
const predictionMarketURL = "https://api.studio.thegraph.com/query/60995/predictionmarket3/version/latest"
let minBlockV = 0
const query = `
query GetProtocol($minBlock: Int!) {
    tokenTransfers(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
        id
        from
        to
        value
        transactionHash
        blockNumber
        blockTimestamp
      }
    _meta {
        block {
            number
        }
    }
}`

const query2 = `
{
   tokenTransfers(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
    id
    from
    to
    value
    transactionHash
    blockNumber
    blockTimestamp
  }
} 
`
/**
 * @dev To query all the markets, no filter
 */
const querySchemaAllMarkets = `
query queryAllMarkets {
  predictionMarketCreateds {
    id
    marketAddress
    numberOfOptions
    eventHash
    expirationTime
    owner
    transactionHash
    blockTimestamp
    blockNumber
  }
}
`
/**
 * @dev To query available markets based on timestamp
 * @filter startTime
 */
const querySchemaAllMarketsWithStartTimeFilter = `
query queryAllMarketsWithStartTimeFilter($startTimestamp: BigInt!) {
  predictionMarketCreateds(where: {startTime_gte: $startTimestamp}) {
    id
    marketAddress
    numberOfOptions
    eventHash
    blockTimestamp
    expirationTime
    owner
  }
}
`


const queryGraph = async () =>{
    try {
        const result = await axios.post(
            predictionMarketURL,
            {
                query:querySchemaAllMarkets,
                // variables: {minBlock: minBlockV}
            }
            );           
            if(result.data.errors){
              return {
                msg: result.data.errors[0].message,
                error: true
              }
            }
            console.log ("Query result: \n", result.data.data);
            return {
                msg: result.data.data.predictionMarketCreateds ,
                error: false
            }
    } catch (err){
        console.log(err);
        return {
            msg: err.msg,
            error: true
        }
    }

}
// main(queryAllMarkets)

module.exports = { queryGraph }