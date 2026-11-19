use aave_address_book::{abis, address, AaveV3Ethereum, AaveV4Ethereum, GovernanceV3Ethereum};
use alloy_sol_types::{SolCall, SolEvent};

#[test]
fn exposes_addresses() {
    assert_eq!(AaveV3Ethereum::CHAIN_ID, 1);
    assert_eq!(
        AaveV3Ethereum::POOL,
        address!("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2")
    );
    assert_eq!(AaveV3Ethereum::ASSETS::USDC::decimals, 6);
    assert!(!AaveV4Ethereum::ALL_SPOKES.is_empty());
    assert_ne!(
        GovernanceV3Ethereum::GOVERNANCE,
        aave_address_book::Address::ZERO
    );
}

#[test]
fn exposes_interfaces() {
    let call = abis::IPool::getReserveDataCall {
        asset: AaveV3Ethereum::ASSETS::USDC::UNDERLYING,
    };
    assert_eq!(
        abis::IPool::getReserveDataCall::SIGNATURE,
        "getReserveData(address)"
    );
    assert_eq!(
        &call.abi_encode()[..4],
        abis::IPool::getReserveDataCall::SELECTOR
    );
    assert_eq!(
        abis::IERC20::Transfer::SIGNATURE,
        "Transfer(address,address,uint256)"
    );
}

#[test]
fn keeps_v4_struct_types_with_their_interface() {
    let flags = abis::ISpokeV4::ReserveFlags::from(0u8);
    assert_eq!(flags.into_underlying(), 0);
}

#[cfg(feature = "rpc")]
#[allow(dead_code)]
fn builds_contract_instances<P: alloy_contract::private::Provider>(provider: P) {
    let pool = abis::IPool::new(AaveV3Ethereum::POOL, provider);
    let _ = pool.getReserveData(AaveV3Ethereum::ASSETS::USDC::UNDERLYING);
}
