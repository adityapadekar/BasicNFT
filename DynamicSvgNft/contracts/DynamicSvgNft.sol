// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

//errors
error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721, Ownable {
    // NFT variables
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    string private constant BASE64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    // priceFeed variables
    AggregatorV3Interface private immutable i_priceFeed;

    // mapping NFT to HighValuePrive
    mapping(uint256 => int256) private s_tokenIdToHighValues;

    // events
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        string memory _lowSvg,
        string memory _highSvg,
        address _priceFeed
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_lowImageURI = svgToImageURI(_lowSvg);
        s_highImageURI = svgToImageURI(_highSvg);
        i_priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function mintNFT(int256 _highValue) public {
        s_tokenIdToHighValues[s_tokenCounter] = _highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
        emit CreatedNFT(s_tokenCounter, _highValue);
    }

    function svgToImageURI(
        string memory _svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(_svg)))
        );
        return
            string(
                abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded)
            );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenId))
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageURI;
        if (price >= s_tokenIdToHighValues[tokenId]) {
            imageURI = s_highImageURI;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
