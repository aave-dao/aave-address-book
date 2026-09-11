// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IRewardsStructs {
  struct AssetDataExternal {
    uint256 targetLiquidity;
    uint256 lastUpdateTimestamp;
  }

  struct EmissionData {
    uint256 targetLiquidity;
    uint256 targetLiquidityExcess;
    uint256 maxEmission;
    uint256 flatEmission;
  }

  struct RewardDataExternal {
    address addr;
    uint256 index;
    uint256 maxEmissionPerSecond;
    uint256 distributionEnd;
  }

  struct RewardSetupConfig {
    address reward;
    address rewardPayer;
    uint256 maxEmissionPerSecond;
    uint256 distributionEnd;
  }

  struct SignatureParams {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  struct UserDataExternal {
    uint256 index;
    uint256 accrued;
  }
}

interface IUmbrellaRewardsController {
  error AccessControlBadConfirmation();
  error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
  error AssetNotInitialized(address asset);
  error ClaimerNotAuthorized(address claimer, address user);
  error ECDSAInvalidSignature();
  error ECDSAInvalidSignatureLength(uint256 length);
  error ECDSAInvalidSignatureS(bytes32 s);
  error EthTransferFailed();
  error ExpiredSignature(uint256 deadline);
  error InvalidAccountNonce(address account, uint256 currentNonce);
  error InvalidDistributionEnd();
  error InvalidInitialization();
  error InvalidMaxEmissionPerSecond();
  error InvalidSigner(address signer, address owner);
  error InvalidTargetLiquidity();
  error LengthsDontMatch();
  error MaxRewardsLengthReached();
  error NotInitializing();
  error OnlyRescueGuardian();
  error RewardNotInitialized(address reward);
  error SafeCastOverflowedUintDowncast(uint8 bits, uint256 value);
  error SafeERC20FailedOperation(address token);
  error ZeroAddress();

  event AssetInitialized(address indexed asset);
  event ClaimerSet(
    address indexed user,
    address indexed claimer,
    address indexed caller,
    bool flag
  );
  event EIP712DomainChanged();
  event ERC20Rescued(
    address indexed caller,
    address indexed token,
    address indexed to,
    uint256 amount
  );
  event Initialized(uint64 version);
  event LastTimestampUpdated(address indexed asset, uint256 newTimestamp);
  event NativeTokensRescued(address indexed caller, address indexed to, uint256 amount);
  event RewardClaimed(
    address indexed asset,
    address indexed reward,
    address indexed user,
    address receiver,
    uint256 amount
  );
  event RewardConfigUpdated(
    address indexed asset,
    address indexed reward,
    uint256 maxEmissionPerSecond,
    uint256 distributionEnd,
    address rewardPayer
  );
  event RewardIndexUpdated(address indexed asset, address indexed reward, uint256 newIndex);
  event RewardInitialized(address indexed asset, address indexed reward);
  event RoleAdminChanged(
    bytes32 indexed role,
    bytes32 indexed previousAdminRole,
    bytes32 indexed newAdminRole
  );
  event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
  event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
  event TargetLiquidityUpdated(address indexed asset, uint256 newTargetLiquidity);
  event UserDataUpdated(
    address indexed asset,
    address indexed reward,
    address indexed user,
    uint256 newIndex,
    uint256 accruedFromLastUpdate
  );

  function DEFAULT_ADMIN_ROLE() external view returns (bytes32);
  function MAX_REWARDS_LENGTH() external view returns (uint256);
  function REWARDS_ADMIN_ROLE() external view returns (bytes32);
  function calculateCurrentEmission(address asset, address reward) external view returns (uint256);
  function calculateCurrentEmissionScaled(
    address asset,
    address reward
  ) external view returns (uint256);
  function calculateCurrentUserReward(
    address asset,
    address reward,
    address user
  ) external view returns (uint256);
  function calculateCurrentUserRewards(
    address asset,
    address user
  ) external view returns (address[] memory, uint256[] memory);
  function calculateRewardIndex(address asset, address reward) external view returns (uint256);
  function calculateRewardIndexes(
    address asset
  ) external view returns (address[] memory, uint256[] memory);
  function claimAllRewards(
    address asset,
    address receiver
  ) external returns (address[] memory, uint256[] memory);
  function claimAllRewards(
    address[] memory assets,
    address receiver
  ) external returns (address[][] memory, uint256[][] memory);
  function claimAllRewardsOnBehalf(
    address[] memory assets,
    address user,
    address receiver
  ) external returns (address[][] memory, uint256[][] memory);
  function claimAllRewardsOnBehalf(
    address asset,
    address user,
    address receiver
  ) external returns (address[] memory, uint256[] memory);
  function claimAllRewardsPermit(
    address asset,
    address user,
    address receiver,
    uint256 deadline,
    IRewardsStructs.SignatureParams memory sig
  ) external returns (address[] memory, uint256[] memory);
  function claimSelectedRewards(
    address[] memory assets,
    address[][] memory rewards,
    address receiver
  ) external returns (uint256[][] memory);
  function claimSelectedRewards(
    address asset,
    address[] memory rewards,
    address receiver
  ) external returns (uint256[] memory);
  function claimSelectedRewardsOnBehalf(
    address asset,
    address[] memory rewards,
    address user,
    address receiver
  ) external returns (uint256[] memory);
  function claimSelectedRewardsOnBehalf(
    address[] memory assets,
    address[][] memory rewards,
    address user,
    address receiver
  ) external returns (uint256[][] memory);
  function claimSelectedRewardsPermit(
    address asset,
    address[] memory rewards,
    address user,
    address receiver,
    uint256 deadline,
    IRewardsStructs.SignatureParams memory sig
  ) external returns (uint256[] memory);
  function configureAssetWithRewards(
    address asset,
    uint256 targetLiquidity,
    IRewardsStructs.RewardSetupConfig[] memory newRewardConfigs
  ) external;
  function configureRewards(
    address asset,
    IRewardsStructs.RewardSetupConfig[] memory newRewardConfigs
  ) external;
  function eip712Domain()
    external
    view
    returns (
      bytes1 fields,
      string memory name,
      string memory version,
      uint256 chainId,
      address verifyingContract,
      bytes32 salt,
      uint256[] memory extensions
    );
  function emergencyEtherTransfer(address to, uint256 amount) external;
  function emergencyTokenTransfer(address erc20Token, address to, uint256 amount) external;
  function getAllAssets() external view returns (address[] memory);
  function getAllRewards(address asset) external view returns (address[] memory);
  function getAssetAndRewardsData(
    address asset
  )
    external
    view
    returns (IRewardsStructs.AssetDataExternal memory, IRewardsStructs.RewardDataExternal[] memory);
  function getAssetData(
    address asset
  ) external view returns (IRewardsStructs.AssetDataExternal memory);
  function getEmissionData(
    address asset,
    address reward
  ) external view returns (IRewardsStructs.EmissionData memory);
  function getRewardData(
    address asset,
    address reward
  ) external view returns (IRewardsStructs.RewardDataExternal memory);
  function getRoleAdmin(bytes32 role) external view returns (bytes32);
  function getUserDataByAsset(
    address asset,
    address user
  ) external view returns (address[] memory, IRewardsStructs.UserDataExternal[] memory);
  function getUserDataByReward(
    address asset,
    address reward,
    address user
  ) external view returns (IRewardsStructs.UserDataExternal memory);
  function grantRole(bytes32 role, address account) external;
  function handleAction(
    uint256 totalSupply,
    uint256 totalAssets,
    address user,
    uint256 userBalance
  ) external;
  function hasRole(bytes32 role, address account) external view returns (bool);
  function initialize(address governance) external;
  function isClaimerAuthorized(address user, address claimer) external view returns (bool);
  function maxRescue(address) external pure returns (uint256);
  function nonces(address owner) external view returns (uint256);
  function renounceRole(bytes32 role, address callerConfirmation) external;
  function revokeRole(bytes32 role, address account) external;
  function setClaimer(address claimer, bool flag) external;
  function setClaimer(address user, address claimer, bool flag) external;
  function supportsInterface(bytes4 interfaceId) external view returns (bool);
  function updateAsset(address asset) external;
}
