require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
module.exports = {
  defaultNetwork : "hardhat",
  solidity: {
    compilers : [
      {version : "0.8.18"},
      {version : "0.8.6"},
      {version : "0.8.0"},
      {version : "0.8.15"},
      {version : "0.8.16"}
    ]
  },
  etherscan: {
    apiKey : ETHERSCAN_API_KEY
  },
  networks : {
    sepolia : {
      url: SEPOLIA_RPC_URL,
      accounts : [SEPOLIA_PRIVATE_KEY],
      chainId : 11155111,
      blockConfirmations : 5
    },
    localhost : {
      url : "http://127.0.0.1:8545/",
      chainId : 31337
    },
  },
  gasReporter : {
    enabled : true,
    outputFile : "gas-report.txt",
    noColors : true,
    currency : "USD",
    // coinmarketcap : COINMARKETCAP_API_KEY

  },
  namedAccounts : {
    deployer : {
      default : 0
    }
  }
};
