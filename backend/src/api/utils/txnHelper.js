const ethers = require("ethers");
// const erc20Abi = require("./abi/erc20.json");
const dotenv = require("dotenv");
const logger = require("../logger/index.js");
dotenv.config();

/**
 * @function getContractInstance
 * @description Asynchronously creates and returns an instance of a smart contract based on its address and ABI.
 * @param {string} contractAddress - The Ethereum address of the smart contract.
 * @param {object} contractAbi - The ABI (Application Binary Interface) of the smart contract.
 * @param {object} provider - An Ethereum provider instance connected to the Polygon network.
 * @returns {object} - An instance of the smart contract.
 */
const getContractInstance = async (contractAddress, contractAbi, provider) => {
    // Create a new instance of the smart contract using ethers.Contract
    const Contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider
    );

    // Return the instance of the smart contract
    return Contract;
}

/**
 * @function getProvider
 * @description Asynchronously creates and returns an Ethereum provider instance connected to the Polygon network.
 * @returns {object} - An Ethereum provider instance connected to the Polygon network.
 */
const getProvider = async () => {
    // Construct the URL for the Polygon network using Infura API key
    const ethereumNodeURL = `https://arb-sepolia.g.alchemy.com/v2/${process.env.ARBITRUM_SEPOLIA_API_KEY}`;
    
    // Create a JsonRpcProvider instance with the constructed URL
    const provider = new ethers.JsonRpcProvider(ethereumNodeURL);
    
    // Return the Ethereum provider instance
    return provider;
}


/**
 * @function getUnsignedTxn
 * @description Asynchronously generates an unsigned Ethereum transaction for a specific function of a smart contract.
 * @param {string} contractAddress - The Ethereum address of the smart contract.
 * @param {object} contractAbi - The ABI (Application Binary Interface) of the smart contract.
 * @param {string} functionName - The name of the function for which the transaction is being generated.
 * @param {array} paramsArray - An array containing the parameters required for the function call.
 * @param {string} from - The Ethereum address initiating the transaction.
 * @returns {object} - An object containing the unsigned transaction data or an error message.
 */
const getUnsignedTxn = async (contractAddress, contractAbi, functionName, paramsArray, from) => {
    try {
        // Get Ethereum provider instance
        const provider = await getProvider();

        // Get contract instance
        const contractInstance = await getContractInstance(contractAddress, contractAbi, provider);

        // Populate unsigned transaction data
        const unsignedTxn = await contractInstance.getFunction(functionName).populateTransaction(...paramsArray);
        logger.debug("unsigned txn "+unsignedTxn);
        console.log("unsigned txn ",unsignedTxn);

        unsignedTxn.from = from;
        unsignedTxn.chainId = '421614'
        
        // Create a VoidSigner instance with sender's Ethereum address
        // const voidSigner = new ethers.VoidSigner(from, provider);

        // // Populate full transaction data
        // const fullTxn = await voidSigner.populateTransaction(unsignedTxn);
        // logger.debug("full unsigned txn "+fullTxn);
        // console.log("full unsigned txn ",fullTxn);

        let txnInfoStringify = JSON.stringify(unsignedTxn, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
        );
        console.log("to string value ",txnInfoStringify)

        // Return unsigned transaction data
        return { msg: txnInfoStringify, error: false };
    } catch(err) {
        // Return error message if transaction generation fails
        return { msg: err.message, error: true };
    }
}

/**
 * @function getUnsignedNoParamsTxn
 * @description Asynchronously generates an unsigned Ethereum transaction for a specific no params function of a smart contract.
 * @param {string} contractAddress - The Ethereum address of the smart contract.
 * @param {object} contractAbi - The ABI (Application Binary Interface) of the smart contract.
 * @param {string} functionName - The name of the function for which the transaction is being generated.
 * @param {string} from - The Ethereum address initiating the transaction.
 * @returns {object} - An object containing the unsigned transaction data or an error message.
 */
const getUnsignedNoParamsTxn = async (contractAddress, contractAbi, functionName, from) => {
    try {
        // Get Ethereum provider instance
        const provider = await getProvider();

        // Get contract instance
        const contractInstance = await getContractInstance(contractAddress, contractAbi, provider);

        // Populate unsigned transaction data
        const unsignedTxn = await contractInstance.getFunction(functionName).populateTransaction();
        logger.debug("unsigned txn "+unsignedTxn);
        console.log("from",from,"unisgned ",unsignedTxn)
        
        // Create a VoidSigner instance with sender's Ethereum address
        const voidSigner = new ethers.VoidSigner(from, provider);

        // Populate full transaction data
        const fullTxn = await voidSigner.populateTransaction(unsignedTxn);
        logger.debug("full unsigned txn "+fullTxn);
        console.log("full unsigned txn ",fullTxn);

        let txnInfoStringify = JSON.stringify(fullTxn, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
        );
        console.log("to string value ",txnInfoStringify)

        // Return unsigned transaction data
        return { msg: txnInfoStringify, error: false };
    } catch(err) {
        // Return error message if transaction generation fails
        return { msg: err.message, error: true };
    }
}

const getReadFunction = async (contractAddress, contractAbi, functionName, paramsArray) => {
    try {
        // Get Ethereum provider instance
        const provider = await getProvider();
        
        // Get contract instance
        const contractInstance = await getContractInstance(contractAddress, contractAbi, provider);
        console.log("funciton name ", functionName, "paramsArray", paramsArray)

        let returnValue = await contractInstance[functionName](...paramsArray);
        logger.debug("return value "+returnValue);

        if(Array.isArray(returnValue)){
            returnValue = returnValue.map(element => typeof element === 'bigint' ? Number(element) : element);
        }

        return { msg: Array.isArray(returnValue) ? returnValue : typeof(returnValue) === 'bigint' ? Number(returnValue) : returnValue, error: false};

    } catch(err){
        return { msg: err.message, error: true};
    }
}

const getReadFunctionNoParams = async (contractAddress, contractAbi, functionName) => {
    try {
        const provider = await getProvider();

        const contractInstance = await getContractInstance(contractAddress, contractAbi, provider);
        console.log("funciton name ", functionName)
        const returnValue = await contractInstance[functionName]();

        logger.debug("return value "+returnValue);

        return { msg: typeof(returnValue) === 'bigint' ? Number(returnValue) : returnValue, error: false};

    } catch(err) {
        return { msg: err.message, error: true};
    }
}

module.exports = { getContractInstance, getUnsignedTxn, getReadFunction, getReadFunctionNoParams, getUnsignedNoParamsTxn };