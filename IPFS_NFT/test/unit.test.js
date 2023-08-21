const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../helper-hardhat-congif");
const { assert } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("IPFS NFT Unit test", function () {
          // contracts
          let vrfCoordinatorV2Mock, ipfsNft;

          // variables
          let deployer, mintFee;
          const chainId = network.config.chainId;

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;

              const deployedContracts = await deployments.fixture(["all"]);

              const vrfCoordinatorV2Mock_Address =
                  deployedContracts["VRFCoordinatorV2Mock"]?.address;
              const ipfsNft_address = deployedContracts["IPFS_NFT"]?.address;

              vrfCoordinatorV2Mock = await ethers.getContractAt(
                  "VRFCoordinatorV2Mock",
                  vrfCoordinatorV2Mock_Address
              );

              ipfsNft = await ethers.getContractAt("IPFS_NFT", ipfsNft_address);

              mintFee = ipfsNft.getMintFee();
          });

          it("Constructor Tests", async function () {
              const tokenCounter = await ipfsNft.getTokenCounter();
              assert.equal(tokenCounter.toString(), "0");
          });
      });
