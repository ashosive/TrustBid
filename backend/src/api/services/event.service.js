const { decode } = require("../utils/eventHashHelper")

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

module.exports = { eventHashService };