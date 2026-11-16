// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Aave App (Stable Vault) policy interfaces, generated from the verified ABIs of the deployed contracts
// (identical on prod and pre-prod, Ethereum and Arbitrum).

/// @dev Rate-limit bucket returned by the policies' limit getters.
struct RateLimitBucket {
  uint128 capacity;
  uint128 refillRate;
  uint128 consumed;
  uint128 lastUpdate;
}

interface IDepositPolicy {
  struct DepositIntent {
    address caller;
    address user;
    address asset;
    uint256 amount;
    bytes policyData;
  }

  error AccessManagedInvalidAuthority(address authority);
  error AccessManagedRequiredDelay(address caller, uint32 delay);
  error AccessManagedUnauthorized(address caller);
  error CannotGetAssetDecimals(address asset);
  error InvalidParameter();
  error NotAuthorized();
  error RateLimited(uint256 amountToConsume, uint256 available);
  error ZeroAddress();

  event AuthorityUpdated(address authority);
  event DepositCapacityLowered(address indexed asset, uint128 oldCapacity, uint128 newCapacity);
  event DepositCapacityRaised(address indexed asset, uint128 oldCapacity, uint128 newCapacity);
  event DepositPolicyApplied(
    address indexed caller,
    address indexed user,
    address indexed asset,
    uint256 amount
  );
  event DepositRefillRateLowered(
    address indexed asset,
    uint128 oldRefillRate,
    uint128 newRefillRate
  );
  event DepositRefillRateRaised(
    address indexed asset,
    uint128 oldRefillRate,
    uint128 newRefillRate
  );
  event GlobalDepositCapacityLowered(uint128 oldCapacity, uint128 newCapacity);
  event GlobalDepositCapacityRaised(uint128 oldCapacity, uint128 newCapacity);
  event GlobalDepositRefillRateLowered(uint128 oldRefillRate, uint128 newRefillRate);
  event GlobalDepositRefillRateRaised(uint128 oldRefillRate, uint128 newRefillRate);

  function applyDepositPolicy(DepositIntent memory deposit) external;
  function authority() external view returns (address);
  function getDepositLimit(address asset) external view returns (RateLimitBucket memory);
  function getGlobalDepositLimit() external view returns (RateLimitBucket memory);
  function isConsumingScheduledOp() external view returns (bytes4);
  function lowerDepositCapacity(address asset, uint128 newCapacity) external;
  function lowerDepositRefillRate(address asset, uint128 newRefillRate) external;
  function lowerGlobalDepositCapacity(uint128 newCapacity) external;
  function lowerGlobalDepositRefillRate(uint128 newRefillRate) external;
  function multicall(bytes[] memory data) external returns (bytes[] memory);
  function previewDepositPolicy(DepositIntent memory deposit) external view returns (bool);
  function raiseDepositCapacity(address asset, uint128 newCapacity) external;
  function raiseDepositRefillRate(address asset, uint128 newRefillRate) external;
  function raiseGlobalDepositCapacity(uint128 newCapacity) external;
  function raiseGlobalDepositRefillRate(uint128 newRefillRate) external;
  function setAuthority(address newAuthority) external;
}

interface IFundsBridgingPolicy {
  struct FundsBridgingIntent {
    address caller;
    address bridgeAdapter;
    uint256 destChainId;
    address asset;
    uint256 amount;
    bytes policyData;
  }

  error AccessManagedInvalidAuthority(address authority);
  error AccessManagedRequiredDelay(address caller, uint32 delay);
  error AccessManagedUnauthorized(address caller);
  error CannotGetAssetDecimals(address asset);
  error InvalidParameter();
  error NotAuthorized();
  error RateLimited(uint256 amountToConsume, uint256 available);
  error ZeroAddress();

  event AuthorityUpdated(address authority);
  event BridgingCapacityLowered(
    address indexed asset,
    uint256 indexed destChainId,
    address indexed bridgeAdapter,
    uint128 oldCapacity,
    uint128 newCapacity
  );
  event BridgingCapacityRaised(
    address indexed asset,
    uint256 indexed destChainId,
    address indexed bridgeAdapter,
    uint128 oldCapacity,
    uint128 newCapacity
  );
  event BridgingRefillRateLowered(
    address indexed asset,
    uint256 indexed destChainId,
    address indexed bridgeAdapter,
    uint128 oldRefillRate,
    uint128 newRefillRate
  );
  event BridgingRefillRateRaised(
    address indexed asset,
    uint256 indexed destChainId,
    address indexed bridgeAdapter,
    uint128 oldRefillRate,
    uint128 newRefillRate
  );
  event FundsBridgingPolicyApplied(
    address indexed caller,
    address bridgeAdapter,
    uint256 indexed destChainId,
    address indexed asset,
    uint256 amount
  );
  event GlobalBridgingCapacityLowered(uint128 oldCapacity, uint128 newCapacity);
  event GlobalBridgingCapacityRaised(uint128 oldCapacity, uint128 newCapacity);
  event GlobalBridgingRefillRateLowered(uint128 oldRefillRate, uint128 newRefillRate);
  event GlobalBridgingRefillRateRaised(uint128 oldRefillRate, uint128 newRefillRate);

  function applyFundsBridgingPolicy(FundsBridgingIntent memory fundsBridging) external;
  function authority() external view returns (address);
  function getBridgingLimit(
    address asset,
    uint256 destChainId,
    address bridgeAdapter
  ) external view returns (RateLimitBucket memory);
  function getGlobalBridgingLimit() external view returns (RateLimitBucket memory);
  function isConsumingScheduledOp() external view returns (bytes4);
  function lowerBridgingCapacity(
    address asset,
    uint256 destChainId,
    address bridgeAdapter,
    uint128 newCapacity
  ) external;
  function lowerBridgingRefillRate(
    address asset,
    uint256 destChainId,
    address bridgeAdapter,
    uint128 newRefillRate
  ) external;
  function lowerGlobalBridgingCapacity(uint128 newCapacity) external;
  function lowerGlobalBridgingRefillRate(uint128 newRefillRate) external;
  function multicall(bytes[] memory data) external returns (bytes[] memory);
  function previewFundsBridgingPolicy(
    FundsBridgingIntent memory fundsBridging
  ) external view returns (bool);
  function raiseBridgingCapacity(
    address asset,
    uint256 destChainId,
    address bridgeAdapter,
    uint128 newCapacity
  ) external;
  function raiseBridgingRefillRate(
    address asset,
    uint256 destChainId,
    address bridgeAdapter,
    uint128 newRefillRate
  ) external;
  function raiseGlobalBridgingCapacity(uint128 newCapacity) external;
  function raiseGlobalBridgingRefillRate(uint128 newRefillRate) external;
  function setAuthority(address newAuthority) external;
}

interface IWithdrawalExecutionPolicy {
  struct WithdrawalExecutionIntent {
    address user;
    address assetOut;
    uint256 iouAmountRay;
    bytes policyData;
  }

  struct AssetFeeConfig {
    uint16 feeBps;
    bool isSet;
  }

  error AccessManagedInvalidAuthority(address authority);
  error AccessManagedRequiredDelay(address caller, uint32 delay);
  error AccessManagedUnauthorized(address caller);
  error BelowMinRedemptionCapacity();
  error BelowMinRedemptionRefillRate();
  error DeadlineExpired();
  error ECDSAInvalidSignature();
  error ECDSAInvalidSignatureLength(uint256 length);
  error ECDSAInvalidSignatureS(bytes32 s);
  error InvalidParameter();
  error InvalidShortString();
  error InvalidSignature();
  error NonceAlreadyUsed();
  error NotAuthorized();
  error RateLimited(uint256 amountToConsume, uint256 available);
  error StringTooLong(string str);
  error ZeroAddress();

  event AssetFeeBpsSet(address indexed asset, uint16 assetFeeBps, bool isSet);
  event AuthorityUpdated(address authority);
  event DefaultFeeBpsSet(uint16 defaultFeeBps);
  event EIP712DomainChanged();
  event NonceUsed(address indexed signer, uint256 indexed nonce);
  event RedemptionCapacityLowered(uint128 oldCapacity, uint128 newCapacity);
  event RedemptionCapacityRaised(uint128 oldCapacity, uint128 newCapacity);
  event RedemptionRefillRateLowered(uint128 oldRefillRate, uint128 newRefillRate);
  event RedemptionRefillRateRaised(uint128 oldRefillRate, uint128 newRefillRate);
  event SignerSet(address indexed signer, bool indexed whitelistAsSigner);
  event WithdrawalExecutionPolicyApplied(
    address indexed user,
    address assetOut,
    uint256 iouAmountRay,
    uint256 amountOutRay
  );

  function SIGNED_FEE_TYPEHASH() external view returns (bytes32);
  function addSigner(address signer) external;
  function applyWithdrawalExecutionPolicy(
    WithdrawalExecutionIntent memory withdrawalExecution
  ) external returns (uint256);
  function authority() external view returns (address);
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
  function getAssetFeeConfig(address asset) external view returns (AssetFeeConfig memory);
  function getDefaultFeeBps() external view returns (uint16);
  function getMinRedemptionCapacity() external view returns (uint128);
  function getMinRedemptionRefillRate() external view returns (uint128);
  function getRedemptionBucket() external view returns (RateLimitBucket memory);
  function invalidateNonce(address signer, uint256 nonce) external;
  function isConsumingScheduledOp() external view returns (bytes4);
  function isSigner(address account) external view returns (bool);
  function lowerRedemptionCapacity(uint128 newCapacity) external;
  function lowerRedemptionRefillRate(uint128 newRefillRate) external;
  function previewWithdrawalExecutionPolicy(
    WithdrawalExecutionIntent memory withdrawalExecution
  ) external view returns (uint256);
  function raiseRedemptionCapacity(uint128 newCapacity) external;
  function raiseRedemptionRefillRate(uint128 newRefillRate) external;
  function removeSigner(address signer) external;
  function setAssetFeeBps(address asset, uint16 newAssetFeeBps, bool isSet) external;
  function setAuthority(address newAuthority) external;
  function setDefaultFeeBps(uint16 newDefaultFeeBps) external;
  function wasNonceUsed(address signer, uint256 nonce) external view returns (bool);
}
