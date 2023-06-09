const {assert} = require("chai");
const {devChains} = require("../../helper-hardhat-config");
const { getNamedAccounts,ethers,network } = require("hardhat");

devChains.includes(network.name)?
describe.skip:
describe("FundMe staging tests",async function(){
    let deployer
    let fundMe
    const sendValue = ethers.utils.parseEther("0.1");
    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe",deployer);
    })
    it("fund and withdraw work correctly",async function(){
        const fundTxResponse = await fundMe.fund({ value: sendValue })
        await fundTxResponse.wait(1)
        const withdrawTxResponse = await fundMe.withdraw()
        await withdrawTxResponse.wait(1)
        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
        console.log(
            endingFundMeBalance.toString() +
                " should equal 0, running assert equal..."
        );
        assert.equal(endingFundMeBalance.toString(),"0");
    })
})