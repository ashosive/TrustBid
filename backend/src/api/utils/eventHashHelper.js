const ethers = require("ethers");

function getAbiCoderInstance() {
    const defaultAbiCoderInstance = ethers.AbiCoder.defaultAbiCoder();
    return defaultAbiCoderInstance;
}


function encode(title, options) {
    // Create a new prediction market with hashed event data
    const encodedData = getAbiCoderInstance().encode(
        ["string", "string[]"],
        [title, options]
    );

    console.log("ecoded", encodedData)
    const hash = ethers.keccak256(encodedData);
    console.log("hash ", hash);
    return encodedData;
}

function decode(hash) {
    try {
        const decodedData = getAbiCoderInstance().decode(
            ["string", "string[]"],
            hash
        );
    
        console.log("decode ", decodedData);

        return { msg: decodedData, error: false };
    } catch(err){
        return { msg: err.message, error: true };
    }

}

// const title = "when is event?";
// const options = ["A", "B", "C"];

// const decodedData = encode(title, options);
// decode(decodedData)

module.exports = { decode };
