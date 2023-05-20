const {assert,expect} = require("chai")
const {deployments,getNamedAccounts,ethers,network} = require("hardhat");
const {devChains} = require("../../helper-hardhat-config");

!devChains.includes(network.name)?
describe.skip:
describe("FundMe",async function(){
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1");
    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe",deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer);
    })
    describe("constructor",async function(){
        it("sets up the price feed address correctly",async function(){
            const response = await fundMe.getPriceFeed();
            assert.equal(response,mockV3Aggregator.address);
        })
    })
    describe("fund",async function(){
        it("should fail if not enough eth is sent",async function(){
          await expect(fundMe.fund()).to.be.revertedWithCustomError(fundMe,"FundMe__InsufficientFunds");
        })
        it("should update the amountTogetFunder mapping correctly",async function(){
            await fundMe.fund({value : sendValue});
            const response = await fundMe.getAddressToFundedAmount(deployer);
            assert.equal(response.toString(),sendValue.toString());
        })
        it("should add funder to getFunder array",async function(){
            await fundMe.fund({value : sendValue});
            const response = await fundMe.getFunder(0);
            assert.equal(response,deployer);
        })
    })
    describe("withdraw",async function(){
        beforeEach(async function(){
            await fundMe.fund({value : sendValue});
        })
        it("deployer should withdraw money",async function(){
            //Arrange 
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.address);
            const startingDeployerBalance = await ethers.provider.getBalance(deployer);
            //Act
            const txResponse = await fundMe.withdraw();
            const txReceipt = await txResponse.wait(1);
            const endingFundMeBalance = await ethers.provider.getBalance(fundMe.address);
            const endingDeployerBalance = await ethers.provider.getBalance(deployer);
            const {gasUsed,effectiveGasPrice} = txReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            //Assert
           
            assert.equal(endingFundMeBalance,0);
            assert.equal(startingDeployerBalance.add(startingFundMeBalance).toString(),
               endingDeployerBalance.add(gasCost).toString());
        })
        it("withdraw money from multiple getFunder",async function(){
            //Arrange
            const accounts = await ethers.getSigners();
            for(let i = 0;i < 5;i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value : sendValue});
            }
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.address);
            const startingDeployerBalance = await ethers.provider.getBalance(deployer);
            //Act
            const txResponse = await fundMe.withdraw();
            const txReceipt = await txResponse.wait(1);
            const endingFundMeBalance = await ethers.provider.getBalance(fundMe.address);
            const endingDeployerBalance = await ethers.provider.getBalance(deployer);
            const {gasUsed,effectiveGasPrice} = txReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            // Assert
            assert.equal(endingFundMeBalance,0);
            assert.equal(startingDeployerBalance.add(startingFundMeBalance).toString(),
               endingDeployerBalance.add(gasCost).toString());
            // Check if getFunder array is reset and getAddressToFundedAmount is set to 0
            await expect(fundMe.getFunder(0)).to.be.reverted;
            for(let i = 0;i < 5;i++){
                assert.equal(await fundMe.getAddressToFundedAmount(accounts[i].address),0);
            }
        })
        it("Allow only owner to withdraw",async function(){
            const accounts = await ethers.getSigners();
            const attacker = accounts[5];
            const attackerConnectedAccount = await fundMe.connect(attacker);
            await expect(attackerConnectedAccount.withdraw()).to.be.revertedWithCustomError(fundMe,"FundMe__Unauthorized"); 
        })
    })
})