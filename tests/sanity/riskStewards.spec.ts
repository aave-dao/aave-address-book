import {describe, it} from 'vitest';
import {ChainId} from '@aave-dao/toolbox';
import * as addressBook from 'src/ts/AaveAddressBook';
import {getContract} from 'viem';
import {getClient} from 'scripts/clients';
import {getGovernance, getMisc, getWhiteLabelGovernance, isPoolWhiteLabel} from 'tests/utils';
import {IRiskSteward_ABI} from 'src/ts/abis/IRiskSteward';
import {IACLManager_ABI} from 'src/ts/abis/IACLManager';

async function check(addresses: Record<string, any>) {
  const client = getClient(addresses.CHAIN_ID);
  if (!client.chain?.testnet) {
    const riskStewardContract = getContract({
      abi: IRiskSteward_ABI,
      address: addresses.RISK_STEWARD,
      client,
    });
    const [CONFIG_ENGINE, OWNER, RISK_COUNCIL] = await Promise.all([
      riskStewardContract.read.CONFIG_ENGINE(),
      riskStewardContract.read.owner(),
      riskStewardContract.read.RISK_COUNCIL(),
    ]);
    if (RISK_COUNCIL !== addresses.RISK_COUNCIL)
      throw new Error(
        `SANITY_RISK_STEWARDS: RISK_COUNCIL MISMATCH ${addresses.POOL}:${RISK_COUNCIL} != ${addresses.RISK_COUNCIL} on ${client.chain?.name}`,
      );
    // if (CONFIG_ENGINE !== addresses.CONFIG_ENGINE)
    //   throw new Error(`SANITY_RISK_STEWARDS: wrong CONFIG_ENGINE on ${client.chain?.name}`);
    // if (POOL_DATA_PROVIDER !== addresses.AAVE_PROTOCOL_DATA_PROVIDER)
    //   throw new Error(`SANITY_RISK_STEWARDS: wrong POOL_DATA_PROVIDER on ${client.chain?.name}`);

    const isWhiteLabel = await isPoolWhiteLabel(addresses.POOL_ADDRESSES_PROVIDER, client);
    const governance = isWhiteLabel
      ? getWhiteLabelGovernance(addresses.CHAIN_ID)
      : getGovernance(addresses.CHAIN_ID);
    if (!governance) {
      console.log(
        `SANITY_RISK_STEWARDS: Skipped due to missing governance on ${client.chain?.name}`,
      );
    } else {
      const executor = isWhiteLabel
        ? (governance as any).PERMISSIONED_PAYLOADS_CONTROLLER_EXECUTOR
        : (governance as any).EXECUTOR_LVL_1;
      // prettier would be to check against executor
      if (OWNER !== executor) {
        throw new Error(
          `SANITY_RISK_STEWARDS: OWNER MISMATCH ${addresses.POOL}.${addresses.RISK_STEWARD}:${OWNER} != ${executor} on ${client.chain?.name}`,
        );
      }
    }

    if (addresses.EDGE_RISK_STEWARD_RATES) {
      const edgeRiskStewardContract = getContract({
        abi: IRiskSteward_ABI,
        address: addresses.EDGE_RISK_STEWARD_RATES,
        client,
      });
      const [CONFIG_ENGINE, OWNER, RISK_COUNCIL] = await Promise.all([
        edgeRiskStewardContract.read.CONFIG_ENGINE(),
        edgeRiskStewardContract.read.owner(),
        edgeRiskStewardContract.read.RISK_COUNCIL(),
      ]);

      // if (CONFIG_ENGINE !== addresses.CONFIG_ENGINE)
      //   throw new Error(`SANITY_EDGE_RISK_STEWARDS: wrong CONFIG_ENGINE on ${client.chain?.name}`);
      // currently they reference an outdated pdp - which should be fine
      // if (POOL_DATA_PROVIDER !== addresses.AAVE_PROTOCOL_DATA_PROVIDER)
      //   throw new Error(`SANITY_EDGE_RISK_STEWARDS: wrong POOL_DATA_PROVIDER on ${client.chain?.name}`);
      if (RISK_COUNCIL !== addresses.EDGE_INJECTOR_RATES)
        throw new Error(
          `SANITY_EDGE_RISK_STEWARDS: wrong EDGE_STEWARD_INJECTOR on ${client.chain?.name}`,
        );

      if (!governance) {
        console.log(
          `SANITY_EDGE_RISK_STEWARDS: Skipped due to missing governance on ${client.chain?.name}`,
        );
      } else {
        const l1Executor = (governance as any).EXECUTOR_LVL_1;
        if (OWNER !== l1Executor) {
          throw new Error(
            `SANITY_EDGE_RISK_STEWARDS: OWNER MISMATCH ${addresses.POOL}.${addresses.RISK_STEWARD}:${OWNER} != ${l1Executor} on ${client.chain?.name}`,
          );
        }
      }
    }
  }
}

describe('risk stewards', () => {
  Object.keys(addressBook).forEach((library) => {
    const addresses = addressBook[library];
    if (addresses.RISK_STEWARD && addresses.POOL_ADDRESSES_PROVIDER) {
      const client = getClient(addresses.CHAIN_ID);
      it.concurrent(
        `should reference correct contracts on all getters: ${client.chain!.name}`,
        async () => {
          return check(addresses);
        },
      );
    }
  });
});

async function checkAclRiskAdmin(addresses: Record<string, any>) {
  const client = getClient(addresses.CHAIN_ID);
  const isWhiteLabel = await isPoolWhiteLabel(addresses.POOL_ADDRESSES_PROVIDER, client);
  if (!client.chain?.testnet && !isWhiteLabel) {
    const aclManager = getContract({
      abi: IACLManager_ABI,
      address: addresses.ACL_MANAGER,
      client,
    });
    const isRiskAdmin = await aclManager.read.isRiskAdmin([addresses.RISK_STEWARD]);
    if (!isRiskAdmin) {
      throw new Error(
        `SANITY_ACL_RISK_ADMIN: RISK_STEWARD ${addresses.RISK_STEWARD} is NOT RISK_ADMIN on ACL_MANAGER ${addresses.ACL_MANAGER} for ${addresses.POOL} on ${client.chain?.name}`,
      );
    }
  }
}

describe('acl manager roles', () => {
  Object.keys(addressBook).forEach((library) => {
    const addresses = addressBook[library];
    if (addresses.RISK_STEWARD && addresses.POOL_ADDRESSES_PROVIDER) {
      const client = getClient(addresses.CHAIN_ID);
      it.concurrent(
        `RISK_STEWARD should hold RISK_ADMIN_ROLE on ACL_MANAGER: ${client.chain!.name}`,
        async () => {
          return checkAclRiskAdmin(addresses);
        },
      );
    }
  });
});

// The v4 steward takes no config engine and no pool data provider, and v4 permissioning lives on
// the AccessManager instead of an ACL manager, so only the council and owner checks carry over.
async function checkV4(addresses: Record<string, any>) {
  const client = getClient(addresses.CHAIN_ID);
  const riskStewardContract = getContract({
    abi: IRiskSteward_ABI,
    address: addresses.RISK_STEWARD,
    client,
  });
  const [OWNER, RISK_COUNCIL] = await Promise.all([
    riskStewardContract.read.owner(),
    riskStewardContract.read.RISK_COUNCIL(),
  ]);
  if (RISK_COUNCIL !== addresses.RISK_COUNCIL)
    throw new Error(
      `SANITY_RISK_STEWARDS_V4: RISK_COUNCIL MISMATCH ${addresses.RISK_STEWARD}:${RISK_COUNCIL} != ${addresses.RISK_COUNCIL} on ${client.chain?.name}`,
    );

  // Arc has no governance deployment, so the v4 security council executor owns the steward there.
  const executor =
    addresses.CHAIN_ID === ChainId.arc
      ? (getMisc(addresses.CHAIN_ID) as any)?.V4_SECURITY_COUNCIL_EXECUTOR
      : (getGovernance(addresses.CHAIN_ID) as any)?.EXECUTOR_LVL_1;
  // TODO: remove once EXECUTOR_LVL_1 accepts ownership of the new Base v4 risk steward
  const pendingOwnershipTransfer =
    addresses.RISK_STEWARD === '0x577dD4c67d4c7278CdF3bC03aE9a391C4C72DB4f';
  if (OWNER !== executor && !pendingOwnershipTransfer)
    throw new Error(
      `SANITY_RISK_STEWARDS_V4: OWNER MISMATCH ${addresses.RISK_STEWARD}:${OWNER} != ${executor} on ${client.chain?.name}`,
    );
}

describe('v4 risk stewards', () => {
  Object.keys(addressBook).forEach((library) => {
    const addresses = addressBook[library];
    if (addresses.RISK_STEWARD && addresses.ACCESS_MANAGER) {
      const client = getClient(addresses.CHAIN_ID);
      it.concurrent(
        `should reference correct contracts on all getters: ${client.chain!.name}`,
        async () => {
          return checkV4(addresses);
        },
      );
    }
  });
});
