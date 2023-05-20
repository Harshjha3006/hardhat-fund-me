const {network} = require("hardhat");
const {devChains,DECIMALS,INITIAL_ANSWER} = require("../helper-hardhat-config.js");
module.exports = async ({deployments,getNamedAccounts})=>{
    const {deploy,log} = deployments;
    const {deployer} = await getNamedAccounts();

    if(devChains.includes(network.name)){
        log("Local Network Detected , Deploying Mocks ...");
        await deploy('MockV3Aggregator',{
            from : deployer,
            args : [DECIMALS,INITIAL_ANSWER],
            log : true
        })
        log("Mock Deployed ...");
    }

}
module.exports.tags = ["all","mocks"];