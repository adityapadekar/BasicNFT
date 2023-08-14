const { network, ethers } = require("hardhat");
const {
    developmentChains,
    BASE_FEE,
    GAS_PRICE_LINK,
} = require("../helper-hardhat-congif");

const baseFee = ethers.parseEther(BASE_FEE);

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("\n===================================================");
        log("Deploying Mocks\n");

        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            contract: "VRFCoordinatorV2Mock",
            args: [baseFee, GAS_PRICE_LINK],
        });

        log("\nMocks Deployed");
        log("===================================================\n");
    }
};

module.exports.tags = ["all", "mocks"];
