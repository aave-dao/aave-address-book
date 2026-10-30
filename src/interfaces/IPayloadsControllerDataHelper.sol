// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IPayloadsControllerCore {
  type PayloadState is uint8;

  struct ExecutionAction {
    address target;
    bool withDelegateCall;
    PayloadsControllerUtils.AccessControl accessLevel;
    uint256 value;
    string signature;
    bytes callData;
  }

  struct ExecutorConfig {
    address executor;
    uint40 delay;
  }

  struct Payload {
    address creator;
    PayloadsControllerUtils.AccessControl maximumAccessLevelRequired;
    PayloadState state;
    uint40 createdAt;
    uint40 queuedAt;
    uint40 executedAt;
    uint40 cancelledAt;
    uint40 expirationTime;
    uint40 delay;
    uint40 gracePeriod;
    ExecutionAction[] actions;
  }
}

library PayloadsControllerUtils {
  type AccessControl is uint8;
}

interface IPayloadsControllerDataHelper {
  struct ExecutorConfig {
    PayloadsControllerUtils.AccessControl accessLevel;
    IPayloadsControllerCore.ExecutorConfig config;
  }

  struct Payload {
    uint256 id;
    IPayloadsControllerCore.Payload data;
  }

  function getExecutorConfigs(
    address payloadsController,
    PayloadsControllerUtils.AccessControl[] memory accessLevels
  ) external view returns (ExecutorConfig[] memory);
  function getPayloadsData(
    address payloadsController,
    uint40[] memory payloadsIds
  ) external view returns (Payload[] memory);
}
