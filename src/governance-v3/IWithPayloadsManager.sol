// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IWithPayloadsManager
 * @author BGD Labs
 * @notice interface containing the objects, events and methods definitions of the IWithPayloadsManager contract
 */
interface IWithPayloadsManager {
  /**
   * @notice Emitted when the payload manager gets updated.
   * @param newPayloadsManager The address of the new payload manager.
   */
  event PayloadsManagerUpdated(address newPayloadsManager);

  /**
   * @notice method to get payload manager address;
   */
  function payloadsManager() external view returns(address);

  /**
   * @notice method to update payload manager.
   * @param newPayloadsManager The new payload manager address.
   */
  function updatePayloadsManager(address newPayloadsManager) external;
}