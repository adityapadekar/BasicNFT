const { network } = require("hardhat");
const {
    developmentChains,
    DECIMAL,
    INITIAL_ANSWER,
} = require("../hepler-hardhat-config");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    if (developmentChains.includes(network.name)) {
        log("\n===================================================");
        log("Deploying Mocks\n");

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMAL, INITIAL_ANSWER],
        });

        log("\nMocks Deployed");
        log("===================================================\n");
    }
};

module.exports.tags = ["all", "mocks"];
