# ALU Logo Blockchain Protection

This project registers the official African Leadership University (ALU) logo on a local Ethereum blockchain and tokenises fractional ownership of that asset. `ALUAssetRegistry` is an ERC-721 NFT contract that stores the logo's SHA-256 content hash and registration metadata on-chain. `ALULogoToken` is an ERC-20 contract that represents 1,000,000 ownership shares of the logo, which the university can distribute to stakeholders.

## ALU Logo SHA-256 Hash

The hash below was generated from `alu-logo.png` (downloaded from [alueducation.com](https://www.alueducation.com/)):

```
e0137c192f1a92bbca3658ec984701f461ab58a799d593218823908d7252de18
```

With `0x` prefix for Solidity:

```
0xe0137c192f1a92bbca3658ec984701f461ab58a799d593218823908d7252de18
```

Anyone can independently verify this hash with:

```bash
sha256sum alu-logo.png
```

## Requirements

- Node.js v18+ (tested with v22.22.0)
- npm

## Versions Used

| Tool | Version |
|------|---------|
| Hardhat | 2.28.6 |
| Solidity | 0.8.28 |
| OpenZeppelin Contracts | 5.6.1 |
| Ethers.js | 6.x |

## Setup and Usage

### 1. Install dependencies

```bash
npm install
```

### 2. Compile the smart contracts

```bash
npm run compile
```

### 3. Run the automated tests (8 tests)

```bash
npm test
```

Expected output: **8 passing** tests covering registration, integrity verification, duplicate rejection, and tokenisation.

### 4. Start a local blockchain node

```bash
npm run node
```

Hardhat prints 20 test wallet addresses with 10,000 ETH each. Keep this terminal open while deploying.

### 5. Deploy the contracts (new terminal)

```bash
npm run deploy
```

This deploys `ALUAssetRegistry`, registers the ALU logo using the real SHA-256 hash, then deploys `ALULogoToken` and mints the full supply to the deployer.

## Project Structure

```
contracts/
  ALUAssetRegistry.sol   # ERC-721 logo registration
  ALULogoToken.sol       # ERC-20 ownership shares
scripts/
  deploy.js              # Deploy and register logo
test/
  ALUAssetRegistry.test.js
alu-logo.png             # Official ALU logo file
hardhat.config.js
```

## Development Notes

- **OpenZeppelin v5 + Cancun EVM:** OpenZeppelin Contracts v5.6 uses the `mcopy` opcode, which requires `evmVersion: "cancun"` in `hardhat.config.js`. Without this setting, compilation fails.
- **Hardhat 3 vs 2:** Hardhat 3 defaults to TypeScript and non-interactive init is limited. This project uses Hardhat 2.x to match the assignment's JavaScript test and deploy script structure.
- **Logo source:** The logo was downloaded from the official ALU website (`ALU-logo-white-full.png`).

## Author

Denaton Agbikossi
