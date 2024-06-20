import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("Signer ", signer.address);

  const mockUSDC = await ethers.deployContract("mockUSDC", [signer.address]);

  await mockUSDC.waitForDeployment();

  console.log(
    `mockUSDC deployed to ${mockUSDC.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});