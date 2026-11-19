<p align="center"><img width="200" src="./addressbook_logo.png" alt="Address book logo"></a></p>

# Aave Address Book

[![npm version](https://img.shields.io/npm/v/@aave-dao/aave-address-book)](https://www.npmjs.com/package/@aave-dao/aave-address-book)

An up-to-date registry of all Aave ecosystem smart contract addresses for use in Solidity and JavaScript/TypeScript projects or usage via JSON API.

🔍 **[Search addresses online](https://aave-dao.github.io/aave-address-book/)**

## Installation

### Foundry

```sh
forge install aave-dao/aave-address-book
```

### Node.js

```sh
npm install @aave-dao/aave-address-book
```

## Usage

### Solidity

```solidity
import { AaveV3Ethereum } from "aave-address-book/AaveV3Ethereum.sol";
import { AaveV2Avalanche } from "aave-address-book/AaveV2Avalanche.sol";
import { AaveGovernanceV2 } from "aave-address-book/AaveGovernanceV2.sol";

contract Example {
  function execute() external {
    address pool = AaveV3Ethereum.POOL;
    // ...
  }
}
```

### JavaScript/TypeScript

```typescript
import { AaveV3Ethereum, AaveV2Avalanche } from "@aave-dao/aave-address-book";

console.log(AaveV3Ethereum.POOL); // "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
console.log(AaveV3Ethereum.CHAIN_ID); // 1
```

### Rust

The [`rust`](./rust) crate exports the same addresses as `alloy_primitives::Address` constants,
plus alloy `sol!` bindings for the interfaces in `scripts/configs/abis.ts`.

```rust
use aave_address_book::{abis::IPool, AaveV3Ethereum};

let pool = AaveV3Ethereum::POOL;
let call = IPool::getReserveDataCall { asset: AaveV3Ethereum::ASSETS::USDC::UNDERLYING };
```

### JSON API

The latest address book is also published as static JSON alongside the search UI:

- [`manifest.json`](https://aave-dao.github.io/aave-address-book/api/v1/manifest.json) describes the deployed package version, source commit, aggregate, and available modules.
- [`address-book.json`](https://aave-dao.github.io/aave-address-book/api/v1/address-book.json) contains every exported address-book module.
- `modules/<name>.json` contains one module, for example [`modules/AaveV3Ethereum.json`](https://aave-dao.github.io/aave-address-book/api/v1/modules/AaveV3Ethereum.json).

Manifest paths are relative to the manifest URL and module names are case-sensitive:

```typescript
const manifestUrl =
  "https://aave-dao.github.io/aave-address-book/api/v1/manifest.json";
const manifest = await fetch(manifestUrl).then((response) => response.json());
const ethereum = manifest.modules.find(
  (module: { name: string }) => module.name === "AaveV3Ethereum",
);
const addresses = await fetch(new URL(ethereum.path, manifestUrl)).then(
  (response) => response.json(),
);
```

The `/api/v1` URLs always represent the latest deployment from `main`. Use the manifest's `commit` and SHA-256 fields to identify and verify the exact content. A future breaking change to the JSON structure or paths will use a new API version.

## Development

### Generate addresses

The library uses a collection of [scripts](./scripts) to fetch addresses from various on-chain registries.

```sh
npm run generate:addresses
```

### Build

```sh
npm run build
forge build
```

### Test

The library includes a suite of tests that can be run using the following commands:

```sh
npm test
forge test
```

The node [test suite](./tests/sanity) is a collection of `sanity` tests, that ensure that view functions return the expected values (e.g. the correct pool is being configured in a given factory).
In addition to that there is a [verification suite](./tests/verification.spec.ts) that ensures that all the addresses listed on address book, are verified on our preferred explorers.

### Adding a new pool

1. Add pool configuration in `scripts/configs/<type>/<network>`
2. Run `npm run generate:addresses`
3. Commit the generated files

## Configuration

Create a `.env` file for reliable RPC connections:

```sh
ETHERSCAN_API_KEY=your_key_here
EXPLORER_PROXY=your_proxy

## RPC configuration
# Per default the package uses the public rpcs available via viem
# You can opt in to use private/different rpcs by setting the following environment variables
RPC_<NETWORK>=your_rpc_url
ALCHEMY_API_KEY=your_key_here
QUICKNODE_ENDPOINT_NAME=your_quicknode_endpoint_name
QUICKNODE_TOKEN=your_quicknode_token
```

## UI

The interactive UI can be found in [ui](./ui) package. The UI is a React application that is compiled as static build, so it can be hosted on github pages.
You can fine an instance of the UI at [search.onaave.com](https://search.onaave.com/)

## Address book API

Each release is published as a static JSON document for programmatic consumption:

```text
https://assets.aave.com/address-book/releases/latest/manifest.json
https://assets.aave.com/address-book/releases/latest/address-book.json
https://assets.aave.com/address-book/releases/latest/modules/AaveV3Ethereum.json
https://assets.aave.com/address-book/releases/v<version>/modules/AaveV3Ethereum.json
```

The API contains an aggregate address book, one file per package module, and a manifest containing
the package version, commit, byte sizes, and SHA-256 hashes. The `latest` files have a short cache
lifetime, while versioned files are immutable. The deployment bucket is configured through the
`STATICS_BUCKET` GitHub Actions secret.

## Resources

- **[Raycast Extension](https://www.raycast.com/smbdy/aave-search)** - Quick address lookup
- **[Web Search](https://search.onaave.com/)** - Browse all addresses

## License

MIT

---

Maintained by [Aave Labs](https://aave.com/)
