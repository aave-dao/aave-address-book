#![doc = include_str!("../README.md")]
#![allow(non_snake_case, non_upper_case_globals)]

/// Alloy bindings for the Aave interfaces, generated from their Solidity sources.
pub mod abis;
mod addresses;

pub use addresses::*;
pub use alloy_primitives::{address, Address};
