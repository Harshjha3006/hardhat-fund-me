require("dotenv").config();
const {network} = require("hardhat");
const {networkConfig,devChains} = require("../helper-hardhat-config.js");
const {verify} = require("../utils/verify.js");

module.exports = async function ({getNamedAccounts,deployments}){
            const {deploy,log} = deployments;
            const {deployer} = await getNamedAccounts();
            const chainId = network.config.chainId;
            let ethUsdPriceFeedAddress;
            if(chainId == 31337){
                const ethUsdAggregator = await deployments.get("MockV3Aggregator");
                ethUsdPriceFeedAddress = ethUsdAggregator.address;
            }else{
                ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
            }
            const args = [ethUsdPriceFeedAddress];
            const FundMe = await deploy("FundMe",{
                from : deployer,
                args : args,
                log : true,
                waitConfirmations : network.config.blockConfirmations || 1
            });
            log(`FundMe Deployed at ${FundMe.address}`);

            if(!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
                await verify(FundMe.address,args);
            }
}

module.exports.tags = ["all","fundme"];