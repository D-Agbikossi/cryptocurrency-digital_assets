// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ALULogoToken
 * @notice ERC-20 token representing fractional ownership shares of the ALU logo.
 */
contract ALULogoToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10 ** 18;

    constructor(address logoOwner) ERC20("ALU Logo Token", "ALUT") Ownable(logoOwner) {
        _mint(logoOwner, TOTAL_SUPPLY);
    }

    /**
     * @notice Transfer ownership shares from the contract owner to a recipient.
     * @param recipient Wallet that will receive ALUT tokens.
     * @param amount Number of tokens to transfer (18-decimal precision).
     */
    function distributeShares(address recipient, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        _transfer(owner(), recipient, amount);
    }

    /**
     * @notice Calculate a wallet's ownership percentage of the total ALUT supply.
     * @param account Wallet address to inspect.
     * @return percentage Whole-number percentage (e.g. 50 for half the supply).
     */
    function ownershipPercentage(address account) external view returns (uint256 percentage) {
        return (balanceOf(account) * 100) / TOTAL_SUPPLY;
    }
}
