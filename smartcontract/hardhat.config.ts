import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    arbitrumSepolia: {
      accounts: [process.env.PVT_KEY || ""],
      url: `https://arb-sepolia.g.alchemy.com/v2/${process.env.ARBITRUM_SEPOLIA_API_KEY}`
    }
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ETHERSCAN_ARBITRUM_API_KEY!,
    },
  }
};

export default config;
