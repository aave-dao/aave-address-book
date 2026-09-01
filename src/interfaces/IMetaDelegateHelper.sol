// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IMetaDelegateHelper {
  type DelegationType is uint8;

  struct MetaDelegateParams {
    address underlyingAsset;
    DelegationType delegationType;
    address delegator;
    address delegatee;
    uint256 deadline;
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  function batchMetaDelegate(MetaDelegateParams[] memory delegateParams) external;
}
