// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Aave App (Stable Vault) AccessManager: OpenZeppelin AccessManager v5.4 with Multicall. Generated from the
// verified ABI of the deployed contract (identical on prod and pre-prod, Ethereum and Arbitrum).
interface IAccessManager {
  error AccessManagerAlreadyScheduled(bytes32 operationId);
  error AccessManagerBadConfirmation();
  error AccessManagerExpired(bytes32 operationId);
  error AccessManagerInvalidInitialAdmin(address initialAdmin);
  error AccessManagerLockedRole(uint64 roleId);
  error AccessManagerNotReady(bytes32 operationId);
  error AccessManagerNotScheduled(bytes32 operationId);
  error AccessManagerUnauthorizedAccount(address msgsender, uint64 roleId);
  error AccessManagerUnauthorizedCall(address caller, address target, bytes4 selector);
  error AccessManagerUnauthorizedCancel(
    address msgsender,
    address caller,
    address target,
    bytes4 selector
  );
  error AccessManagerUnauthorizedConsume(address target);
  error AddressEmptyCode(address target);
  error FailedCall();
  error InsufficientBalance(uint256 balance, uint256 needed);
  error SafeCastOverflowedUintDowncast(uint8 bits, uint256 value);

  event OperationCanceled(bytes32 indexed operationId, uint32 indexed nonce);
  event OperationExecuted(bytes32 indexed operationId, uint32 indexed nonce);
  event OperationScheduled(
    bytes32 indexed operationId,
    uint32 indexed nonce,
    uint48 schedule,
    address caller,
    address target,
    bytes data
  );
  event RoleAdminChanged(uint64 indexed roleId, uint64 indexed admin);
  event RoleGrantDelayChanged(uint64 indexed roleId, uint32 delay, uint48 since);
  event RoleGranted(
    uint64 indexed roleId,
    address indexed account,
    uint32 delay,
    uint48 since,
    bool newMember
  );
  event RoleGuardianChanged(uint64 indexed roleId, uint64 indexed guardian);
  event RoleLabel(uint64 indexed roleId, string label);
  event RoleRevoked(uint64 indexed roleId, address indexed account);
  event TargetAdminDelayUpdated(address indexed target, uint32 delay, uint48 since);
  event TargetClosed(address indexed target, bool closed);
  event TargetFunctionRoleUpdated(address indexed target, bytes4 selector, uint64 indexed roleId);

  function ADMIN_ROLE() external view returns (uint64);
  function PUBLIC_ROLE() external view returns (uint64);
  function canCall(
    address caller,
    address target,
    bytes4 selector
  ) external view returns (bool immediate, uint32 delay);
  function cancel(address caller, address target, bytes memory data) external returns (uint32);
  function consumeScheduledOp(address caller, bytes memory data) external;
  function execute(address target, bytes memory data) external payable returns (uint32);
  function expiration() external view returns (uint32);
  function getAccess(
    uint64 roleId,
    address account
  ) external view returns (uint48 since, uint32 currentDelay, uint32 pendingDelay, uint48 effect);
  function getNonce(bytes32 id) external view returns (uint32);
  function getRoleAdmin(uint64 roleId) external view returns (uint64);
  function getRoleGrantDelay(uint64 roleId) external view returns (uint32);
  function getRoleGuardian(uint64 roleId) external view returns (uint64);
  function getSchedule(bytes32 id) external view returns (uint48);
  function getTargetAdminDelay(address target) external view returns (uint32);
  function getTargetFunctionRole(address target, bytes4 selector) external view returns (uint64);
  function grantRole(uint64 roleId, address account, uint32 executionDelay) external;
  function hasRole(
    uint64 roleId,
    address account
  ) external view returns (bool isMember, uint32 executionDelay);
  function hashOperation(
    address caller,
    address target,
    bytes memory data
  ) external view returns (bytes32);
  function isTargetClosed(address target) external view returns (bool);
  function labelRole(uint64 roleId, string memory label) external;
  function minSetback() external view returns (uint32);
  function multicall(bytes[] memory data) external returns (bytes[] memory results);
  function renounceRole(uint64 roleId, address callerConfirmation) external;
  function revokeRole(uint64 roleId, address account) external;
  function schedule(
    address target,
    bytes memory data,
    uint48 when
  ) external returns (bytes32 operationId, uint32 nonce);
  function setGrantDelay(uint64 roleId, uint32 newDelay) external;
  function setRoleAdmin(uint64 roleId, uint64 admin) external;
  function setRoleGuardian(uint64 roleId, uint64 guardian) external;
  function setTargetAdminDelay(address target, uint32 newDelay) external;
  function setTargetClosed(address target, bool closed) external;
  function setTargetFunctionRole(address target, bytes4[] memory selectors, uint64 roleId) external;
  function updateAuthority(address target, address newAuthority) external;
}
