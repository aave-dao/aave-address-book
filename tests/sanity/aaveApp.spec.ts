import {describe, it, expect} from 'vitest';
import {Hex, parseAbi} from 'viem';
import {readContract} from 'viem/actions';
import * as addressBook from 'src/ts/AaveAddressBook';
import {getClient} from 'scripts/clients';

const ABI = parseAbi([
  'function authority() view returns (address)',
  'function getGateway() view returns (address)',
]);

// Roots of the Aave App configs that are AccessManaged. The other roots (TRANSFER_HELPER, SWAPPER, the multicalls,
// EARNING_CHAIN_STATE_PROVIDER) aren't.
const ACCESS_MANAGED = [
  'POLICY_REGISTRY',
  'ASSET_REGISTRY',
  'PRICE_ORACLE',
  'ALLOCATOR',
  'CCIP_ADAPTER',
  'ADI_ADAPTER',
  'STABLE_VAULT',
  'ACCOUNTING_CHAIN_GATEWAY',
  'CHAIN_BALANCE_ORACLE',
  'EARNING_CHAIN_GATEWAY',
];

const LIBRARIES = {
  AaveAppArbitrum: addressBook.AaveAppArbitrum,
  AaveAppEthereum: addressBook.AaveAppEthereum,
  AaveAppPreProdArbitrum: addressBook.AaveAppPreProdArbitrum,
  AaveAppPreProdEthereum: addressBook.AaveAppPreProdEthereum,
};

// Identity checks only: every root belongs to its deployment. Role holders and permissions are covered by the
// Stable Vault permissions book.
describe('aave app', () => {
  for (const [name, lib] of Object.entries(LIBRARIES)) {
    const addresses = lib as unknown as Record<string, Hex> & {CHAIN_ID: number};
    const client = getClient(addresses.CHAIN_ID);
    const read = (address: Hex, functionName: 'authority' | 'getGateway') =>
      readContract(client, {address, abi: ABI, functionName});

    it(`${name}: roots are managed by ACCESS_MANAGER`, async () => {
      for (const key of ACCESS_MANAGED.filter((k) => addresses[k])) {
        expect(await read(addresses[key], 'authority'), key).toEqual(addresses.ACCESS_MANAGER);
      }
    });

    it(`${name}: bridge adapters point to the gateway`, async () => {
      const gateway = addresses.ACCOUNTING_CHAIN_GATEWAY ?? addresses.EARNING_CHAIN_GATEWAY;
      expect(await read(addresses.CCIP_ADAPTER, 'getGateway')).toEqual(gateway);
      expect(await read(addresses.ADI_ADAPTER, 'getGateway')).toEqual(gateway);
    });
  }
});
