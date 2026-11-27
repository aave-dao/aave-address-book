// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

/// @notice Role of a chain in an Aave App (Stable Vault) deployment.
/// Accounting: the single chain hosting the StableVault and the cross-chain accounting.
/// Earning: a remote chain whose allocated funds are reported back to the accounting chain.
enum AaveAppChainKind {
  Accounting,
  Earning
}
