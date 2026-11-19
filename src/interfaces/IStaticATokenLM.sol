// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IStaticATokenLM {
  struct PermitParams {
    address owner;
    address spender;
    uint256 value;
    uint256 deadline;
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  struct SignatureParams {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  event Initialized(address indexed aToken, string staticATokenName, string staticATokenSymbol);
  event RewardTokenRegistered(address indexed reward, uint256 startIndex);

  function aToken() external view returns (address);
  function claimRewards(address receiver, address[] memory rewards) external;
  function claimRewardsOnBehalf(
    address onBehalfOf,
    address receiver,
    address[] memory rewards
  ) external;
  function claimRewardsToSelf(address[] memory rewards) external;
  function collectAndUpdateRewards(address reward) external returns (uint256);
  function deposit(
    uint256 assets,
    address receiver,
    uint16 referralCode,
    bool depositToAave
  ) external returns (uint256);
  function getClaimableRewards(address user, address reward) external view returns (uint256);
  function getCurrentRewardsIndex(address reward) external view returns (uint256);
  function getTotalClaimableRewards(address reward) external view returns (uint256);
  function getUnclaimedRewards(address user, address reward) external view returns (uint256);
  function initialize(
    address aToken,
    string memory staticATokenName,
    string memory staticATokenSymbol
  ) external;
  function isRegisteredRewardToken(address reward) external view returns (bool);
  function metaDeposit(
    address depositor,
    address receiver,
    uint256 assets,
    uint16 referralCode,
    bool depositToAave,
    uint256 deadline,
    PermitParams memory permit,
    SignatureParams memory sigParams
  ) external returns (uint256);
  function metaWithdraw(
    address owner,
    address receiver,
    uint256 shares,
    uint256 assets,
    bool withdrawFromAave,
    uint256 deadline,
    SignatureParams memory sigParams
  ) external returns (uint256, uint256);
  function rate() external view returns (uint256);
  function redeem(
    uint256 shares,
    address receiver,
    address owner,
    bool withdrawFromAave
  ) external returns (uint256, uint256);
  function refreshRewardTokens() external;
  function rewardTokens() external view returns (address[] memory);
}
