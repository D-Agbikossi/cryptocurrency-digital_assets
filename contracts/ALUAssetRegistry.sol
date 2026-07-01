// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ALUAssetRegistry
 * @notice Registers the official ALU logo as an ERC-721 NFT with SHA-256 integrity verification.
 */
contract ALUAssetRegistry is ERC721, Ownable {
    struct AssetMetadata {
        string name;
        string fileType;
        bytes32 contentHash;
        address registeredBy;
        uint256 registeredAt;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => AssetMetadata) private _assets;
    mapping(bytes32 => bool) private _registeredHashes;

    event AssetRegistered(
        uint256 indexed tokenId,
        string name,
        bytes32 contentHash,
        address registeredBy
    );

    constructor() ERC721("ALU Asset Registry", "ALUASSET") Ownable(msg.sender) {}

    /**
     * @notice Mint a new NFT representing a registered digital asset.
     * @param assetName Human-readable name of the asset (e.g. "ALU Official Logo").
     * @param fileType MIME or file extension (e.g. "png").
     * @param contentHash SHA-256 hash of the asset file contents.
     * @return tokenId The newly minted token identifier.
     */
    function registerAsset(
        string calldata assetName,
        string calldata fileType,
        bytes32 contentHash
    ) external returns (uint256 tokenId) {
        require(!_registeredHashes[contentHash], "Asset with this content hash already registered");

        tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(msg.sender, tokenId);

        _assets[tokenId] = AssetMetadata({
            name: assetName,
            fileType: fileType,
            contentHash: contentHash,
            registeredBy: msg.sender,
            registeredAt: block.timestamp
        });

        _registeredHashes[contentHash] = true;

        emit AssetRegistered(tokenId, assetName, contentHash, msg.sender);
    }

    /**
     * @notice Compare a supplied hash against the hash stored for a registered token.
     * @param tokenId The NFT token ID to verify against.
     * @param contentHash The SHA-256 hash of the file being checked.
     * @return isAuthentic True when the supplied hash matches the stored hash.
     * @return message A human-readable authenticity result.
     */
    function verifyLogoIntegrity(
        uint256 tokenId,
        bytes32 contentHash
    ) external view returns (bool isAuthentic, string memory message) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        if (_assets[tokenId].contentHash == contentHash) {
            return (true, "Logo is authentic.");
        }

        return (false, "Warning: logo does not match.");
    }

    /**
     * @notice Return the full registration metadata for a token.
     * @param tokenId The NFT token ID to look up.
     */
    function getAsset(uint256 tokenId) external view returns (AssetMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _assets[tokenId];
    }
}
