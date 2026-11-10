import {describe, expect, it} from 'vitest';
import * as addressBook from 'src/ts/AaveAddressBook';
import {getContract, parseAbi} from 'viem';
import {getClient} from 'scripts/clients';

const ADAPTERS = [
  'COW_COLLATERAL_SWAP_ADAPTER',
  'COW_DEBT_SWAP_ADAPTER',
  'COW_REPAY_WITH_COLLATERAL_ADAPTER',
  'COW_LEVERAGE_ADAPTER',
] as const;

const FACTORY_ABI = parseAbi([
  'function POOL() view returns (address)',
  'function ADDRESSES_PROVIDER() view returns (address)',
  'function isAdapterImplementation(address) view returns (bool)',
]);

const ADAPTER_ABI = parseAbi([
  'function FACTORY() view returns (address)',
  'function AAVE_POOL() view returns (address)',
  'function GIVER_POSITION_MANAGER() view returns (address)',
  'function TAKER_POSITION_MANAGER() view returns (address)',
  'function SIGNATURE_GATEWAY() view returns (address)',
]);

async function check(addresses: Record<string, any>, isV4: boolean) {
  const client = getClient(addresses.CHAIN_ID);
  const factory = getContract({abi: FACTORY_ABI, address: addresses.COW_ADAPTER_FACTORY, client});

  if (!isV4) {
    expect(await factory.read.POOL()).toEqual(addresses.POOL);
    expect(await factory.read.ADDRESSES_PROVIDER()).toEqual(addresses.POOL_ADDRESSES_PROVIDER);
  }

  for (const key of ADAPTERS) {
    const adapter = getContract({abi: ADAPTER_ABI, address: addresses[key], client});
    expect(await factory.read.isAdapterImplementation([addresses[key]])).toBe(true);
    expect(await adapter.read.FACTORY()).toEqual(addresses.COW_ADAPTER_FACTORY);
    if (isV4) {
      const {GIVER_POSITION_MANAGER, TAKER_POSITION_MANAGER, SIGNATURE_GATEWAY} =
        addresses.POSITION_MANAGERS;
      expect(await adapter.read.GIVER_POSITION_MANAGER()).toEqual(GIVER_POSITION_MANAGER);
      expect(await adapter.read.TAKER_POSITION_MANAGER()).toEqual(TAKER_POSITION_MANAGER);
      expect(await adapter.read.SIGNATURE_GATEWAY()).toEqual(SIGNATURE_GATEWAY);
    } else {
      expect(await adapter.read.AAVE_POOL()).toEqual(addresses.POOL);
    }
  }
}

describe('cow adapters', () => {
  Object.keys(addressBook).forEach((library) => {
    const addresses = addressBook[library];
    if (addresses.COW_ADAPTER_FACTORY) {
      it.concurrent(`should reference correct contracts on all getters: ${library}`, async () => {
        return check(addresses, library.startsWith('AaveV4'));
      });
    }
  });
});
