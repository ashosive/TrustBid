const ethers = require("ethers");

function getAbiCoderInstance() {
    const defaultAbiCoderInstance = ethers.AbiCoder.defaultAbiCoder();
    return defaultAbiCoderInstance;
}


function encode(title, options,otherTeamInfos) {
    try {
        // Create a new prediction market with hashed event data
        const encodedData = getAbiCoderInstance().encode(
            ["string", "string[]","tuple(string id, string symbol, string title, string logo)[]"],
            [title, options,otherTeamInfos]
        );

        console.log("encoded", encodedData)

        return { msg: encodedData, error: false };
    } catch(err) {
        return { msg: err.message, error: true };
    }
    
}

function decode(hash) {
    try {
        const decodedData = getAbiCoderInstance().decode(
            ["string", "string[]","tuple(string id, string symbol, string title, string logo)[]"],
            hash
        );
    
        console.log("decode ", decodedData);

        return { msg: decodedData, error: false };
    } catch(err){
        return { msg: err.message, error: true };
    }

}

const title = "Will BTC/USD hit 85k ?";
const options = ["Yes", "No"];

// const decodedData = encode(title, options);
// decode(decodedData)

module.exports = { decode, encode };
