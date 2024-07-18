import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("Signer ", signer.address);

  const Oracle = await ethers.deployContract("OracleV3",);

  await Oracle.waitForDeployment();

  console.log(
    `Oracle deployed to ${Oracle.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});