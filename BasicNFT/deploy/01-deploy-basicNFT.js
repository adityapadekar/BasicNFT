const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const args = [];

    log("\n===========================================================");
    log("Deploying BasicNFT contract\n");
    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("\nContract Deployed");
    log("===========================================================\n");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("\n===========================================================");
        log("Verifying Contract on Etherscan\n");
        await verify(basicNFT.address, args);
        log("\nContract Verified on Etherscan");
        log("===========================================================\n");
    }
};

module.exports.tags = ["all","basicNFT"]
