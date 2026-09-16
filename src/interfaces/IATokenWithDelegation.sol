// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IGovernancePowerDelegationToken {
  type GovernancePowerType is uint8;
}

interface IATokenWithDelegation {
  error ECDSAInvalidSignature();
  error ECDSAInvalidSignatureLength(uint256 length);
  error ECDSAInvalidSignatureS(bytes32 s);
  error InvalidShortString();
  error StringTooLong(string str);

  event Approval(address indexed owner, address indexed spender, uint256 value);
  event BalanceTransfer(address indexed from, address indexed to, uint256 value, uint256 index);
  event Burn(
    address indexed from,
    address indexed target,
    uint256 value,
    uint256 balanceIncrease,
    uint256 index
  );
  event DelegateChanged(
    address indexed delegator,
    address indexed delegatee,
    IGovernancePowerDelegationToken.GovernancePowerType delegationType
  );
  event EIP712DomainChanged();
  event Initialized(
    address indexed underlyingAsset,
    address indexed pool,
    address treasury,
    address incentivesController,
    uint8 aTokenDecimals,
    string aTokenName,
    string aTokenSymbol,
    bytes params
  );
  event Mint(
    address indexed caller,
    address indexed onBehalfOf,
    uint256 value,
    uint256 balanceIncrease,
    uint256 index
  );
  event Transfer(address indexed from, address indexed to, uint256 value);

  function ATOKEN_REVISION() external view returns (uint256);
  function DELEGATE_BY_TYPE_TYPEHASH() external view returns (bytes32);
  function DELEGATE_TYPEHASH() external view returns (bytes32);
  function DOMAIN_SEPARATOR() external view returns (bytes32);
  function EIP712_REVISION() external returns (bytes memory);
  function PERMIT_TYPEHASH() external view returns (bytes32);
  function POOL() external view returns (address);
  function POWER_SCALE_FACTOR() external view returns (uint256);
  function RESERVE_TREASURY_ADDRESS() external view returns (address);
  function UNDERLYING_ASSET_ADDRESS() external view returns (address);
  function allowance(address owner, address spender) external view returns (uint256);
  function approve(address spender, uint256 amount) external returns (bool);
  function balanceOf(address user) external view returns (uint256);
  function burn(address from, address receiverOfUnderlying, uint256 amount, uint256 index) external;
  function decimals() external view returns (uint8);
  function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
  function delegate(address delegatee) external;
  function delegateByType(
    address delegatee,
    IGovernancePowerDelegationToken.GovernancePowerType delegationType
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
  function getDelegateeByType(
    address delegator,
    IGovernancePowerDelegationToken.GovernancePowerType delegationType
  ) external view returns (address);
  function getDelegates(address delegator) external view returns (address, address);
  function getIncentivesController() external view returns (address);
  function getPowerCurrent(
    address user,
    IGovernancePowerDelegationToken.GovernancePowerType delegationType
  ) external view returns (uint256);
  function getPowersCurrent(address user) external view returns (uint256, uint256);
  function getPreviousIndex(address user) external view returns (uint256);
  function getScaledUserBalanceAndSupply(address user) external view returns (uint256, uint256);
  function handleRepayment(address user, address onBehalfOf, uint256 amount) external;
  function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
  function initialize(
    address,
    address,
    address,
    address,
    uint8,
    string memory,
    string memory,
    bytes memory
  ) external;
  function metaDelegate(
    address delegator,
    address delegatee,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
  function metaDelegateByType(
    address delegator,
    address delegatee,
    IGovernancePowerDelegationToken.GovernancePowerType delegationType,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
  function mint(
    address caller,
    address onBehalfOf,
    uint256 amount,
    uint256 index
  ) external returns (bool);
  function mintToTreasury(uint256 amount, uint256 index) external;
  function name() external view returns (string memory);
  function nonces(address owner) external view returns (uint256);
  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
  function rescueTokens(address token, address to, uint256 amount) external;
  function scaledBalanceOf(address user) external view returns (uint256);
  function scaledTotalSupply() external view returns (uint256);
  function setIncentivesController(address controller) external;
  function symbol() external view returns (string memory);
  function totalSupply() external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  function transferOnLiquidation(address from, address to, uint256 value) external;
  function transferUnderlyingTo(address target, uint256 amount) external;
}
