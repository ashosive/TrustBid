// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PredictionMarketV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Prediction Market Factory
 * @notice Factory contract to create new prediction markets.
 * @dev This contract allows the owner to create new prediction markets with specified parameters.
 */
contract PredictionMarketFactoryV2 is Ownable {
    address public tokenAddress; // Address of the ERC20 token used in prediction markets
    address public oracleAddress; // Address of the Oracle in prediction markets

    /**
     * @dev Event emitted when a new prediction market is created.
     * @param marketAddress Address of the newly created prediction market.
     * @param numberOfOptions Number of options available for betting in the market.
     * @param eventHash Hash of the event description or identifier for the market.
     * @param expirationTime Expiration time of the betting period for the market.
     * @param owner Address of the owner who created the prediction market.
     */
    event PredictionMarketCreated(
        address indexed marketAddress,
        uint8 numberOfOptions,
        bytes eventHash,
        uint256 expirationTime,
        address indexed owner
    );

    /**
     * @dev Constructor to initialize the PredictionMarketFactory with the ERC20 token address.
     * @param _tokenAddress Address of the ERC20 token used for betting in prediction markets.
     */
    constructor(address _tokenAddress, address _oracleAddress, address _initOwner) Ownable(_initOwner) {
        tokenAddress = _tokenAddress;
        oracleAddress = _oracleAddress;
    }

    /**
     * @notice Function to create a new prediction market.
     * @dev Only callable by the owner of the contract.
     * @param numberOfOptions Number of options available for betting in the new market.
     * @param eventHash Hash of the event description or identifier for the new market.
     * @param expirationTime Expiration time of the betting period for the new market.
     * @return Address of the newly created PredictionMarket contract.
     */
    function createPredictionMarket(
        uint8 numberOfOptions,
        bytes memory eventHash,
        uint256 expirationTime
    ) public onlyOwner returns (address) {
        PredictionMarketV2 newMarket = new PredictionMarketV2(tokenAddress, numberOfOptions, eventHash, expirationTime,msg.sender,oracleAddress);
        emit PredictionMarketCreated(address(newMarket), numberOfOptions, eventHash, expirationTime, msg.sender);
        return address(newMarket);
    }
}
