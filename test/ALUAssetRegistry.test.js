const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

describe("ALU Logo Protection System", function () {
  const TOTAL_SUPPLY = ethers.parseEther("1000000");
  let registry;
  let logoToken;
  let owner;
  let recipient;
  let contentHash;
  let fakeHash;

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();

    const logoPath = path.join(__dirname, "..", "alu-logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    const hashHex = crypto.createHash("sha256").update(logoBuffer).digest("hex");
    contentHash = `0x${hashHex}`;
    fakeHash = `0x${"a".repeat(64)}`;

    const ALUAssetRegistry = await ethers.getContractFactory("ALUAssetRegistry");
    registry = await ALUAssetRegistry.deploy();

    const ALULogoToken = await ethers.getContractFactory("ALULogoToken");
    logoToken = await ALULogoToken.deploy(owner.address);
  });

  describe("ALUAssetRegistry", function () {
    it("registers the ALU logo successfully and returns a token ID", async function () {
      const tx = await registry.registerAsset("ALU Official Logo", "png", contentHash);
      await expect(tx).to.emit(registry, "AssetRegistered");

      const tokenId = 0n;
      const asset = await registry.getAsset(tokenId);
      expect(asset.name).to.equal("ALU Official Logo");
      expect(asset.fileType).to.equal("png");
      expect(asset.contentHash).to.equal(contentHash);
      expect(await registry.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("rejects duplicate registration of the same hash", async function () {
      await registry.registerAsset("ALU Official Logo", "png", contentHash);

      await expect(
        registry.registerAsset("ALU Official Logo Copy", "png", contentHash)
      ).to.be.revertedWith("Asset with this content hash already registered");
    });

    it("verifyLogoIntegrity() returns true when the correct hash is supplied", async function () {
      await registry.registerAsset("ALU Official Logo", "png", contentHash);

      const [isAuthentic, message] = await registry.verifyLogoIntegrity(0, contentHash);
      expect(isAuthentic).to.equal(true);
      expect(message).to.equal("Logo is authentic.");
    });

    it("verifyLogoIntegrity() returns false when an incorrect hash is supplied", async function () {
      await registry.registerAsset("ALU Official Logo", "png", contentHash);

      const [isAuthentic, message] = await registry.verifyLogoIntegrity(0, fakeHash);
      expect(isAuthentic).to.equal(false);
      expect(message).to.equal("Warning: logo does not match.");
    });

    it("getAsset() returns the correct asset name and file type for a registered token", async function () {
      await registry.registerAsset("ALU Official Logo", "png", contentHash);

      const asset = await registry.getAsset(0);
      expect(asset.name).to.equal("ALU Official Logo");
      expect(asset.fileType).to.equal("png");
    });
  });

  describe("ALULogoToken", function () {
    it("mints the full supply of 1,000,000 ALUT tokens to the logo owner on deployment", async function () {
      expect(await logoToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
      expect(await logoToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("distributeShares() correctly transfers the specified number of tokens to a recipient", async function () {
      const shareAmount = ethers.parseEther("250000");

      await logoToken.distributeShares(recipient.address, shareAmount);

      expect(await logoToken.balanceOf(recipient.address)).to.equal(shareAmount);
      expect(await logoToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - shareAmount);
    });

    it("ownershipPercentage() returns the correct percentage for a known token balance", async function () {
      const shareAmount = ethers.parseEther("100000");
      await logoToken.distributeShares(recipient.address, shareAmount);

      expect(await logoToken.ownershipPercentage(recipient.address)).to.equal(10);
      expect(await logoToken.ownershipPercentage(owner.address)).to.equal(90);
    });
  });
});
