// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IStaticATokenFactory {
  function createStaticATokens(address[] memory underlyings) external returns (address[] memory);
  function getStaticAToken(address underlying) external view returns (address);
  function getStaticATokens() external view returns (address[] memory);
}
