import {describe, it, expect} from 'vitest';
import * as addressBook from 'src/ts/AaveAddressBook';
import {getContract, keccak256, toBytes} from 'viem';
import {getClient} from 'scripts/clients';
import {bytes32toAddress, getImplementationStorageSlot} from 'scripts/generator/utils';

// roles as defined in RwaAToken and RwaATokenManager of aave-v3-horizon
const ATOKEN_ADMIN_ROLE = keccak256(toBytes('ATOKEN_ADMIN'));
const AUTHORIZED_TRANSFER_ROLE = keccak256(toBytes('AUTHORIZED_TRANSFER'));

// every reserve must be classified, so a new listing fails until it is added to one list
const RWA_ASSETS = ['USTB', 'USCC', 'USYC', 'JTRSY', 'JAAA', 'VBILL', 'ACRED', 'mGLOBAL'];
const NON_RWA_ASSETS = ['GHO', 'USDC', 'RLUSD'];

const aclManagerAbi = [
  {
    type: 'function',
    name: 'hasRole',
    inputs: [{type: 'bytes32'}, {type: 'address'}],
    outputs: [{type: 'bool'}],
    stateMutability: 'view',
  },
] as const;

const rwaATokenManagerAbi = [
  {
    type: 'function',
    name: 'AUTHORIZED_TRANSFER_ROLE',
    inputs: [],
    outputs: [{type: 'bytes32'}],
    stateMutability: 'view',
  },
] as const;

async function check(addresses: Record<string, any>) {
  const client = getClient(addresses.CHAIN_ID);
  const aclManager = getContract({
    abi: aclManagerAbi,
    address: addresses.ACL_MANAGER,
    client,
  });
  const manager = getContract({
    abi: rwaATokenManagerAbi,
    address: addresses.RWA_A_TOKEN_MANAGER,
    client,
  });

  // the manager needs the ATokenAdmin role on the pool to execute authorized transfers
  const hasATokenAdminRole = await aclManager.read.hasRole([
    ATOKEN_ADMIN_ROLE,
    addresses.RWA_A_TOKEN_MANAGER,
  ]);
  expect(hasATokenAdminRole).toBe(true);

  // identity check that the address is actually an RwaATokenManager
  const authorizedTransferRole = await manager.read.AUTHORIZED_TRANSFER_ROLE();
  expect(authorizedTransferRole).toBe(AUTHORIZED_TRANSFER_ROLE);
}

async function checkImpl(addresses: Record<string, any>) {
  expect(Object.keys(addresses.ASSETS).sort()).toEqual([...RWA_ASSETS, ...NON_RWA_ASSETS].sort());

  const client = getClient(addresses.CHAIN_ID);
  for (const asset of Object.keys(addresses.ASSETS)) {
    const impl = bytes32toAddress(
      await getImplementationStorageSlot(client, addresses.ASSETS[asset].A_TOKEN),
    );
    const expectedImpl = RWA_ASSETS.includes(asset)
      ? addresses.RWA_A_TOKEN_IMPL
      : addresses.DEFAULT_A_TOKEN_IMPL;
    expect(impl, asset).toBe(expectedImpl);
  }
}

describe('rwa aToken manager', () => {
  Object.keys(addressBook).forEach((library) => {
    const addresses = addressBook[library];
    if (addresses.RWA_A_TOKEN_MANAGER) {
      const client = getClient(addresses.CHAIN_ID);
      it.concurrent(`should hold the ATokenAdmin role: ${client.chain!.name}`, async () => {
        return check(addresses);
      });
    }
  });
});

describe('horizon aToken impls', () => {
  Object.keys(addressBook).forEach((library) => {
    const addresses = addressBook[library];
    if (addresses.RWA_A_TOKEN_IMPL) {
      const client = getClient(addresses.CHAIN_ID);
      it.concurrent(`should match the impl of every aToken: ${client.chain!.name}`, async () => {
        return checkImpl(addresses);
      });
    }
  });
});
