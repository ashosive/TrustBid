import { ethers } from "hardhat";

async function main(factory: string, noOfOptions: number, hash: string, expireTime: number) {
    const [signer] = await ethers.getSigners();
    
    console.log("Signer ", signer.address);
  
    const tokenAddress = "0xab4f68A873eC164D9d52467D92469fC313Cf64F6";
    const oracleAddress = "0xeA65F246C606fc7C62f7B35724E85c788A04B13f";
  
    const PredictionMarketFactory = await ethers.getContractAt("PredictionMarketFactoryV3",factory);

    const createMarketTxn = await PredictionMarketFactory.createPredictionMarket(noOfOptions,hash,expireTime);

    console.log("txn ", createMarketTxn.hash);
}
const hashOf = "Will BTC/USD hit 85k ?";
const hashOfOptions = ["Yes", "No"];
const hash = "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000001657696c6c204254432f555344206869742038356b203f000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000003596573000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024e6f000000000000000000000000000000000000000000000000000000000000";
const noOfOptions = 2;
const TWO_DAYS = 60 * 60 * 24 * 2;
const expireTime = 1721758974 + TWO_DAYS;
const factory = "0xd228C766906074c0354459298CF52B092DEb751F";

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(factory,noOfOptions,hash,expireTime).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});