const { assert,expect } = require("chai");
const {deployments, ethers, getNamedAccounts}=require("hardhat");

describe("FundMe",async function (){
    let fundMe;
    let deployer;
    let MockV3Aggregator;
    const sendValue=ethers.utils.parseEther("1"); //1eth

    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe= await ethers.getContract("FundMe",deployer);
        MockV3Aggregator=await ethers.getContract("MockV3Aggregator",deployer);
    })
    
    describe("constructor",async function(){
        it("sets the aggregator addresses correctly",async function(){
            const response = await fundMe.priceFeed();
            assert.equal(response,MockV3Aggregator.address);
        })
    })

    describe("fund", function () {
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(
                deployer
            )
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        })
    })
})