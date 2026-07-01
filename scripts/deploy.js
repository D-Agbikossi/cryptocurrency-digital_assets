const hre = require("hardhat");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const logoPath = path.join(__dirname, "..", "alu-logo.png");
  const logoBuffer = fs.readFileSync(logoPath);
  const contentHashHex = crypto.createHash("sha256").update(logoBuffer).digest("hex");
  const contentHash = `0x${contentHashHex}`;

  console.log("ALU logo SHA-256 hash:", contentHash);

  const ALUAssetRegistry = await hre.ethers.getContractFactory("ALUAssetRegistry");
  const registry = await ALUAssetRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ALUAssetRegistry deployed to:", registryAddress);

  const registerTx = await registry.registerAsset(
    "ALU Official Logo",
    "png",
    contentHash
  );
  await registerTx.wait();
  console.log("ALU logo registered on-chain with hash:", contentHash);

  const ALULogoToken = await hre.ethers.getContractFactory("ALULogoToken");
  const logoToken = await ALULogoToken.deploy(deployer.address);
  await logoToken.waitForDeployment();
  const logoTokenAddress = await logoToken.getAddress();
  console.log("ALULogoToken deployed to:", logoTokenAddress);
  console.log("Full ALUT supply minted to logo owner:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
