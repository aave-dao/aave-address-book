// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface AggregatorInterface {
  event AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 updatedAt);
  event NewRound(uint256 indexed roundId, address indexed startedBy, uint256 startedAt);

  function decimals() external view returns (uint8);
  function description() external view returns (string memory);
  function getAnswer(uint256 roundId) external view returns (int256);
  function getRoundData(
    uint80 _roundId
  )
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
  function getTimestamp(uint256 roundId) external view returns (uint256);
  function latestAnswer() external view returns (int256);
  function latestRound() external view returns (uint256);
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
  function latestTimestamp() external view returns (uint256);
}
