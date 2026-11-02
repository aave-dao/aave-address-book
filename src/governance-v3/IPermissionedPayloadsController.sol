// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPayloadsControllerCore} from "./IPayloadsControllerCore.sol";
import {IWithPayloadsManager} from "./IWithPayloadsManager.sol";
import {PayloadsControllerUtils} from "./PayloadsControllerUtils.sol";

/**
 * @title IPermissionedPayloadsController
 * @author BGD Labs
 * @notice interface containing the objects, events and methods definitions of the IPermissionedPayloadsController contract
 */
interface IPermissionedPayloadsController is IPayloadsControllerCore, IWithPayloadsManager {  
  /**
   * @notice method to initialize the contract with starter params. Only callable by proxy
   * @param guardian address of the guardian. With permissions to call certain methods
   * @param initialPayloadsManager address of the initial payload manager
   * @param executors array of executor configurations
   */
  function initialize(
    address guardian,
    address initialPayloadsManager,
    UpdateExecutorInput[] calldata executors
  ) external;

  function setExecutionDelay(uint40 delay) external;
}