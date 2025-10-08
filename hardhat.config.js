
import "@nomicfoundation/hardhat-toolbox";

export default{
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};