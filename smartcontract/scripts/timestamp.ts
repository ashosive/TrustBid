import { ethers } from "hardhat";

async function main() {
//   const provider = ethers.provider.getBlockNumber()
  const number = await ethers.provider.getBlockNumber()

  console.log(
    `block number ${number}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});