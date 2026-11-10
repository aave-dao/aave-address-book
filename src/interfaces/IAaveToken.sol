// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IGovernancePowerDelegationToken {
  type GovernancePowerType is uint8;
}

interface IAaveToken {
  error InvalidShortString();
  error StringTooLong(string str);

  event Approval(address indexed owner, address indexed spender, uint256 value);
  event DelegateChanged(
    address indexed delegator,
    address indexed delegatee,
    IGovernancePowerDelegationToken.GovernancePowerType delegationType
  );
  event EIP712DomainChanged();
  event Transfer(address indexed from, address indexed to, uint256 value);

  function DELEGATE_BY_TYPE_TYPEHASH() external view returns (bytes32);
  function DELEGATE_TYPEHASH() external view returns (bytes32);
  function DOMAIN_SEPARATOR() external view returns (bytes32);
  function PERMIT_TYPEHASH() external view returns (bytes32);
  function POWER_SCALE_FACTOR() external view returns (uint256);
  function REVISION() external view returns (uint256);
  function _nonces(address) external view returns (uint256);
  function allowance(address owner, address spender) external view returns (uint256);
  function approve(address spender, uint256 amount) external returns (bool);
  function balanceOf(address account) external view returns (uint256);
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
  function getPowerCurrent(
    address user,
    IGovernancePowerDelegationToken.GovernancePowerType delegationType
  ) external view returns (uint256);
  function getPowersCurrent(address user) external view returns (uint256, uint256);
  function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
  function initialize() external;
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
  function name() external view returns (string memory);
  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
  function symbol() external view returns (string memory);
  function totalSupply() external view returns (uint256);
  function transfer(address to, uint256 amount) external returns (bool);
  function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
