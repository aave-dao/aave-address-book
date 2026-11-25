# aave-address-book

Rust version of the [Aave Address Book](https://github.com/aave-dao/aave-address-book): every
address the Solidity and TypeScript packages export, plus [alloy](https://github.com/alloy-rs)
bindings for the Aave interfaces.

```rust
use aave_address_book::{abis::IPool, AaveV3Ethereum};

let pool = AaveV3Ethereum::POOL;
let usdc = AaveV3Ethereum::ASSETS::USDC::UNDERLYING;
let call = IPool::getReserveDataCall { asset: usdc };
# let _ = (pool, call);
```

Module and constant names match the Solidity libraries and the TypeScript exports, so
`AaveV3Ethereum.POOL` in Solidity is `AaveV3Ethereum::POOL` here.

Enable the `rpc` feature for `#[sol(rpc)]` contract instances:

```toml
aave-address-book = { version = "4", features = ["rpc"] }
```

## Generated code

Do not edit `src/abis` or `src/addresses` by hand.

- `npm run generate:abis` compiles each interface in `scripts/configs/abis.ts` with Forge and writes
  the same ABI to `src/ts/abis` and `rust/src/abis`.
- `npm run generate:rust` turns the generated TypeScript address book into `rust/src/addresses`.
  `npm run generate:addresses` runs it for you.
