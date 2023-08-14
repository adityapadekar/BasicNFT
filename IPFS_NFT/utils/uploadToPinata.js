const pinataSDk = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
// require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDk(pinataApiKey, pinataApiSecret);

async function storeImage(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs
        .readdirSync(fullImagesPath)
        .filter((file) => file.includes(".png"));
    let responses = [];
    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        );

        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        };

        try {
            const response = await pinata.pinFileToIPFS(
                readableStreamForFile,
                options
            );
            responses.push(response);
        } catch (error) {
            console.log(error);
        }
    }

    console.log(responses);
    return { responses, files };
}

async function storeTokenUriMetadeta(metadeta) {}

module.exports = {
    storeImage,
};
