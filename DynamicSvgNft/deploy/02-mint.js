const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();

    const signer = await ethers.getSigner(deployer);
    const highValue = ethers.parseEther("4000");
    const dynamicSvgNft_address = (await deployments.get("DynamicSvgNft"))
        .address;
    const dynamicSvgNft = await ethers.getContractAt(
        "DynamicSvgNft",
        dynamicSvgNft_address,
        signer
    );
    const dynamicSvgNftTx = await dynamicSvgNft.mintNFT(highValue);
    await dynamicSvgNftTx.wait(1);
    console.log(
        `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
    );
};

module.exports.tags = ["all", "mint"];
