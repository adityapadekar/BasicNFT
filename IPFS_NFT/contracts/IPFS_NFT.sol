// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Errors
error IPFS_NFT__rangeOutOfBound();
error IPFS_NFT__notEnoughMintFee();
// error IPFS_NFT__notOwner();
error IPFS_NFT__transferFailed();

contract IPFS_NFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // type declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subsciptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callBackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 1;

    // Mappings
    mapping(uint256 => address) private s_requestIdToSenders;

    // NFT variables
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenURI;
    uint256 internal immutable i_mintFee;

    // Contract Variables
    // address private immutable i_owner;

    // Modifier
    // modifier onlyOwner() {
    //     if (msg.sender != i_owner) revert IPFS_NFT__notOwner();
    //     _;
    // }

    // events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    constructor(
        address _vrfCoordinatorV2,
        uint64 _subsciptionId,
        bytes32 _gasLane,
        uint32 _callBackGasLimit,
        string[3] memory _dogTokenURI,
        uint256 _mintFee
    ) VRFConsumerBaseV2(_vrfCoordinatorV2) ERC721("IPFS_NFT", "IN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinatorV2);
        i_gasLane = _gasLane;
        i_subsciptionId = _subsciptionId;
        i_callBackGasLimit = _callBackGasLimit;
        s_tokenCounter = 0;
        s_dogTokenURI = _dogTokenURI;
        i_mintFee = _mintFee;
        // i_owner = msg.sender;
    }

    function requestNft() public payable returns (uint256) {
        if (i_mintFee > msg.value) revert IPFS_NFT__notEnoughMintFee();

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subsciptionId,
            REQUEST_CONFIRMATIONS,
            i_callBackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSenders[requestId] = msg.sender;

        emit NftRequested(requestId, msg.sender);

        return requestId;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address dogOwner = s_requestIdToSenders[requestId];
        uint256 newTokenId = s_tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Breed dogBreed = getBreedFromModdedRng(moddedRng);

        s_tokenCounter += 1;

        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenURI[uint256(dogBreed)]);

        emit NftMinted(dogBreed, dogOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");

        if (!success) revert IPFS_NFT__transferFailed();
    }

    function getBreedFromModdedRng(
        uint256 _moddedRng
    ) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                _moddedRng >= cumulativeSum &&
                _moddedRng < cumulativeSum + chanceArray[i]
            ) return Breed(i);
            cumulativeSum += chanceArray[i];
        }

        revert IPFS_NFT__rangeOutOfBound();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenURI(uint256 _index) public view returns (string memory) {
        return s_dogTokenURI[_index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
