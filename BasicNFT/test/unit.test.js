const { assert } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT unit testing", function () {
          let basicNFT, deployer;

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;

              const deploymentResults = await deployments.fixture(["all"]);
              const basicNFT_address = deploymentResults["BasicNFT"]?.address;
              basicNFT = await ethers.getContractAt(
                  "BasicNFT",
                  basicNFT_address
              );
          });

          describe("Constructor", function () {
              it("Initializes the NFT Correctly.", async () => {
                  const name = await basicNFT.name();
                  const symbol = await basicNFT.symbol();
                  const tokenCounter = await basicNFT.getTokenCounter();
                  assert.equal(name, "Dogie");
                  assert.equal(symbol, "DOG");
                  assert.equal(tokenCounter.toString(), "0");
              });
          });

          describe("Mint and NFT Token", function () {
              beforeEach(async () => {
                  const txResponse = await basicNFT.mintNFT();
                  await txResponse.wait(1);
              });

              it("Allow users to mint an NFT, and update the records accordingly", async () => {
                  const tokenURI = await basicNFT.tokenURI(0);
                  const tokenCount = await basicNFT.getTokenCounter();

                  assert.equal(tokenCount.toString(), "1");
                  assert.equal(tokenURI, await basicNFT.TOKEN_URI());
              });

              it("Show the correct balance and owner of an NFT", async function () {
                  const deployerBalance = await basicNFT.balanceOf(deployer);
                  const owner = await basicNFT.ownerOf("0");

                  assert.equal(deployerBalance.toString(), "1");
                  assert.equal(owner, deployer);
              });
          });
      });
