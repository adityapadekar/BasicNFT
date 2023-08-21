const { network } = require("hardhat");
const { developmentChains, networkConfig } = require("../hepler-hardhat-config");
const fs = require("fs");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        ethUsdPriceFeedAddress = (await deployments.get("MockV3Aggregator"))
            .address;
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSVG = fs.readFileSync("./images/frown.svg", {
        encoding: "utf8",
    });
    const highSVG = fs.readFileSync("./images/happy.svg", {
        encoding: "utf8",
    });

    const args = [lowSVG, highSVG, ethUsdPriceFeedAddress];

    log("\n=================================================================");
    log("Deploying Contract........\n");
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
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
        await verify(dynamicSvgNft.address, args);
        log("\nContract Verified on Etherscan");
        log("===========================================================\n");
    }
};

module.exports.tags = ["all", "dynamicsvg"];
