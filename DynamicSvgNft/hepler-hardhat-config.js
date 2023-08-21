const { ethers } = require("hardhat");

const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
};

const developmentChains = ["hardhat", "localhost"];

const DECIMAL = 18;
const INITIAL_ANSWER = ethers.parseUnits("2000", "ether");

module.exports = {
    developmentChains,
    networkConfig,
    DECIMAL,
    INITIAL_ANSWER,
};
