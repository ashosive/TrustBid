// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Prediction Market Contract
 * @dev A smart contract for prediction markets where users can bet on outcomes of events.
 */
contract PredictionMarket is Ownable {
    struct Bet {
        uint256 amount; // Amount of tokens bet by the user
        uint8 option;   // Option chosen by the user (0-indexed)
    }

    mapping(address => Bet) public bets;        // Mapping of user address to their bet
    mapping(uint8 => uint256) public totalBets; // Total amount bet on each option
    bool public marketResolved;                 // Flag indicating if the market has been resolved
    uint8 public winningOption;                 // Winning option index (0-indexed)
    uint256 public liquidityPool;               // Total amount of tokens in the liquidity pool
    uint8 public numberOfOptions;               // Number of options available for betting
    bytes public eventHash;                   // Hash of the event description or identifier
    uint256 public startTime;                   // Start time of the betting period (Unix timestamp)
    uint256 public expirationTime;              // Expiration time of the betting period (Unix timestamp)

    IERC20 public token; // Token used for betting

    /**
     * @dev Event emitted when a user places a bet.
     * @param user Address of the user placing the bet.
     * @param amount Amount of tokens bet.
     * @param option Index of the option chosen (0-indexed).
     */
    event BetPlaced(address indexed user, uint256 amount, uint8 option);

    /**
     * @dev Event emitted when the market is resolved.
     * @param winningOption Index of the winning option (0-indexed).
     */
    event MarketResolved(uint8 winningOption);

    /**
     * @dev Event emitted when a new prediction market is created.
     * @param marketAddress Address of the newly created prediction market.
     * @param numberOfOptions Number of options available for betting in the market.
     * @param eventHash Hash of the event description or identifier.
     * @param startTime Start time of the betting period (Unix timestamp).
     * @param expirationTime Expiration time of the betting period (Unix timestamp).
     */
    event MarketCreated(
        address indexed marketAddress,
        uint8 numberOfOptions,
        bytes eventHash,
        uint256 startTime,
        uint256 expirationTime
    );

    /**
     * @dev Constructor to initialize the prediction market.
     * @param _tokenAddress Address of the ERC20 token used for betting.
     * @param _numberOfOptions Number of options available for the market.
     * @param _eventHash Hash of the event description or identifier.
     * @param _startTime Start time of the betting period (Unix timestamp).
     * @param _expirationTime Expiration time of the betting period (Unix timestamp).
     */
    constructor(
        address _tokenAddress,
        uint8 _numberOfOptions,
        bytes memory _eventHash,
        uint256 _startTime,
        uint256 _expirationTime,
        address _initOwner
    ) Ownable(_initOwner) {
        require(_numberOfOptions > 1, "Number of options must be greater than 1");
        token = IERC20(_tokenAddress);
        numberOfOptions = _numberOfOptions;
        eventHash = _eventHash;
        startTime = _startTime;
        expirationTime = _expirationTime;

        emit MarketCreated(address(this), _numberOfOptions, _eventHash, _startTime, _expirationTime);
    }

    /**
     * @notice Function for users to place bets on an option.
     * @param amount Amount of tokens to bet.
     * @param option Index of the option chosen (0-indexed).
     */
    function placeBet(uint256 amount, uint8 option) public {
        require(!marketResolved, "Market already resolved");
        require(option < numberOfOptions, "Invalid option");
        require(bets[msg.sender].amount == 0, "You have already placed a bet");
        require(block.timestamp >= startTime && block.timestamp <= expirationTime, "Betting period is over");

        token.transferFrom(msg.sender, address(this), amount);

        bets[msg.sender] = Bet(amount, option);
        totalBets[option] += amount;
        liquidityPool += amount;

        emit BetPlaced(msg.sender, amount, option);
    }

    /**
     * @notice Function to resolve the market and determine the winning option.
     * @param _winningOption Index of the winning option (0-indexed).
     */
    function resolveMarket(uint8 _winningOption) public onlyOwner {
        require(!marketResolved, "Market already resolved");
        require(_winningOption < numberOfOptions, "Invalid winning option");
        require(block.timestamp > expirationTime, "Market has not expired yet");

        marketResolved = true;
        winningOption = _winningOption;

        emit MarketResolved(winningOption);
    }

    /**
     * @notice Function for a user to claim their winnings after the market is resolved.
     */
    function claimWinnings() public {
        require(marketResolved, "Market not resolved");
        require(bets[msg.sender].amount > 0, "No bet placed");

        Bet memory userBet = bets[msg.sender];
        require(userBet.option == winningOption, "You did not win");

        uint256 reward = calculateReward(userBet.amount, userBet.option);
        token.transfer(msg.sender, reward);

        delete bets[msg.sender];
    }

    /**
     * @dev Internal function to calculate the reward for a winning bet.
     * @param amount Amount bet by the user.
     * @param option Index of the winning option.
     * @return reward Amount to be rewarded to the user.
     */
    function calculateReward(uint256 amount, uint8 option) internal view returns (uint256) {
        uint256 winnerPool = totalBets[option];
        uint256 loserPool = liquidityPool - winnerPool;

        uint256 shareOfLoserPool = (amount * loserPool) / winnerPool;
        uint256 reward = amount + shareOfLoserPool;
        return reward;
    }
}
