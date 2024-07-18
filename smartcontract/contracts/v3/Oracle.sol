// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPredictionMarket {
    function numberOfOptions() external view returns (uint8);
}

/**
 * @title Oracle Contract
 * @dev A smart contract for managing prediction market results.
 * Allows authorized updaters to set results for prediction markets.
 */

contract OracleV3 {

    address public owner; // Owner of the contract
    mapping(address => bool) public authorizedUpdaters; // Mapping to track authorized updaters

    struct ResultInfo {
        uint8 result; // Result of the prediction market
        bool isRevealed; // Flag indicating if the result has been revealed
    }
    mapping(address => ResultInfo) public results; // Mapping of prediction market address to its result

    // Events
    event ResultUpdated(address indexed predictionMarket, uint8 result); // Event emitted when a result is updated
    event AuthorizedUpdater(address indexed updater); // Event emitted when an updater is authorized
    event RevokedUpdater(address indexed updater); // Event emitted when an updater is revoked

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not an authorized updater");
        _;
    }

    /**
     * @dev Constructor to set the owner of the contract.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Function to authorize an updater.
     * @param updater Address of the updater to be authorized.
     */
    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdater(updater);
    }

    /**
     * @notice Function to revoke an updater's authorization.
     * @param updater Address of the updater to be revoked.
     */
    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit RevokedUpdater(updater);
    }

    /**
     * @notice Function to add a result for a prediction market.
     * @param predictionMarket Address of the prediction market.
     * @param winningOption Index of the winning option (0-indexed).
     */
    function addResult(address predictionMarket, uint8 winningOption) external onlyAuthorizedUpdater {
        // Ensure the prediction market address is valid
        require(predictionMarket != address(0), "Invalid prediction market address");
        require(!results[predictionMarket].isRevealed, "Already declared results");

        // Ensure the winning option is valid
        uint8 options = IPredictionMarket(predictionMarket).numberOfOptions();
        require(winningOption < options, "Invalid winning option");

        // Update the result for the prediction market
        results[predictionMarket].result = winningOption;
        results[predictionMarket].isRevealed = true;
        emit ResultUpdated(predictionMarket, winningOption);
    }

    /**
     * @notice Function to get the result of a prediction market.
     * @param predictionMarket Address of the prediction market.
     * @return result The result of the prediction market.
     * @return isRevealed Flag indicating if the result has been revealed.
     */
    function getResult(address predictionMarket) external view returns (uint8, bool) {
        require(results[predictionMarket].isRevealed, "Result not available");
        return (results[predictionMarket].result, results[predictionMarket].isRevealed);
    }
}