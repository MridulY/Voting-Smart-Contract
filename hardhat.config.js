require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const { SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || ""
  }
};
