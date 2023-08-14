const { network, ethers } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-congif");
const { verify } = require("../utils/verify");
const { storeImage } = require("../utils/uploadToPinata");

const VRF_FUND_AMOUNT = ethers.parseEther("2");

const imagesLocation = "./images";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
};

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;

    let tokenURI;
    // IPFS hashes for our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenURI = await handleTokenURI();
    }

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Address = (
            await deployments.get("VRFCoordinatorV2Mock")
        ).address;

        vrfCoordinatorV2Mock = await ethers.getContractAt(
            "VRFCoordinatorV2Mock",
            vrfCoordinatorV2Address
        );

        const txResponse = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await txResponse.wait(1);

        // subscriptionId = networkConfig[chainId].subscriptionId;
        // subscriptionId = txReceipt.events[0].args.subId;

        subscriptionId = 1;

        // await vrfCoordinatorV2Mock.fundSubscription(
        //     VRF_FUND_AMOUNT,
        //     subscriptionId
        // );
    } else {
        subscriptionId = networkConfig[chainId].subscriptionId;
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    }

    // experiment

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        // networkConfig[chainId].callbackGasLimit,
        networkConfig[chainId].mintFee,
    ];

    // log("\n=================================================================");
    // log("Deploying Contract........\n");
    // const ipfsNft = await deploy("IPFS_NFT", {
    //     from: deployer,
    //     args: args,
    //     log: true,
    //     waitConfirmations: network.config.blockConfirmations || 1,
    // });
    // log("\nContract Deployed");
    // log("===========================================================\n");

    // if (developmentChains.includes(network.name)) {
    //     await vrfCoordinatorV2Mock.addConsumer(subscriptionId, lottery.address);
    // }

    // if (
    //     !developmentChains.includes(network.name) &&
    //     process.env.ETHERSCAN_API_KEY
    // ) {
    //     log("\n===========================================================");
    //     log("Verifying Contract on Etherscan\n");
    //     await verify(basicNFT.address, args);
    //     log("\nContract Verified on Etherscan");
    //     log("===========================================================\n");
    // }
};

async function handleTokenURI() {
    const tokenURI = [];

    const { responses: imagesUploadResponses, files } = await storeImage(
        imagesLocation
    );

    for (imagesUploadResponseIndex in imagesUploadResponses) {
        let tokenURIMetadata = { ...metadataTemplate };

        tokenURIMetadata.name = files[imagesUploadResponseIndex].replace(
            ".png",
            ""
        );
        tokenURIMetadata.description = `An adorable ${tokenURIMetadata.name}`;
        tokenURIMetadata.image = `ipfs://${imagesUploadResponses[imagesUploadResponseIndex].IpfsHash}`;

        tokenURI.push(tokenURIMetadata);
    }

    return tokenURI;
}

module.exports.tags = ["all", "ipfs"];
