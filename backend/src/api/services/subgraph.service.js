const { queryGraph } = require("../utils/subgraphHelper")

const marketsService = async () => {
    try {
        const result = await queryGraph();
    
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
            message: err.msg,
            error: true
        }
    }
}

module.exports = { marketsService }