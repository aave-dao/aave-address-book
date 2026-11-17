import {Client, Hex, getAddress, parseAbi, zeroAddress} from 'viem';
import {readContract} from 'viem/actions';
import * as fs from 'fs';
import {AaveAppAddresses, AaveAppChainKind, Addresses} from 'scripts/configs/types';
import {getClient} from 'scripts/clients';
import {fixSymbol} from 'scripts/generator/assetsLibraryGenerator';
import {
  bytes32toAddress,
  generateJsConstants,
  generateSolidityConstants,
  getImplementationStorageSlot,
  prefixWithGeneratedWarning,
  prefixWithPragma,
  wrapIntoSolidityLibrary,
} from 'scripts/generator/utils';

// Constants typed with interfaces from src/common
const INTERFACES: Record<string, {type: string; file: string}> = {
  ACCESS_MANAGER: {type: 'IAccessManager', file: 'IAccessManager.sol'},
  DEPOSIT_POLICY: {type: 'IDepositPolicy', file: 'IAaveAppPolicies.sol'},
  FUNDS_BRIDGING_POLICY: {type: 'IFundsBridgingPolicy', file: 'IAaveAppPolicies.sol'},
  WITHDRAWAL_EXECUTION_POLICY: {type: 'IWithdrawalExecutionPolicy', file: 'IAaveAppPolicies.sol'},
};

// PolicyRegistry ids, as constants in the Stable Vault contracts that look the policies up.
// Unregistered ids return the zero address and are left out.
const POLICY_IDS: Record<AaveAppChainKind, Record<string, Hex>> = {
  [AaveAppChainKind.Accounting]: {
    // StableVault.DEPOSIT_POLICY_ID
    DEPOSIT_POLICY: '0x780c69a8d1890ef009c0e82622a8ad8b5fcebdb4655a550589c95587ab9f8737',
    // StableVault.WITHDRAWAL_REQUEST_POLICY_ID
    WITHDRAWAL_REQUEST_POLICY: '0x9c238a3c8b0489eb6352e8961b4f7a11406d8d4dea0b75e9f2b5cab473d164d8',
    // StableVault.WITHDRAWAL_EXECUTION_POLICY_ID
    WITHDRAWAL_EXECUTION_POLICY:
      '0x0b31c7380981f7a065b16980994765a46c7c2446175bc97b41109919817f1ca2',
    // FundsHandler.BRIDGE_POLICY_ID
    FUNDS_BRIDGING_POLICY: '0xe8134dfa9ba78c8f4bc7215c2603da92d80f826e18cf8cf1673b973cae3e6165',
    // Allocator.REBALANCE_POLICY_ID
    REBALANCE_POLICY: '0xc8677baa58e60e0903b82d16b92a11a49685a8844fe0f67b4f06e7d3ecef34cb',
  },
  [AaveAppChainKind.Earning]: {
    // EarningChainGateway.WITHDRAWAL_EXECUTION_POLICY_ID
    WITHDRAWAL_EXECUTION_POLICY:
      '0xf213893b1e253163c05de458d1c9283d3155b096d439aab98ea90b491dce4bfb',
    // EarningChainGateway.BRIDGE_POLICY_ID
    FUNDS_BRIDGING_POLICY: '0x537fb58e71f5b54dc09d8afff5cbf9bf5e630233f65f0531590f8cfa4a81bc6c',
    // Allocator.REBALANCE_POLICY_ID
    REBALANCE_POLICY: '0xc8677baa58e60e0903b82d16b92a11a49685a8844fe0f67b4f06e7d3ecef34cb',
  },
};

const ABI = parseAbi([
  'function getPolicy(bytes32 policyId) view returns (address)',
  'function getIouTokenManager() view returns (address)',
  'function getFundsHandler() view returns (address)',
  'function getAsset() view returns (address)',
  'function getSlippageVault() view returns (address)',
  'function getCrossChainController() view returns (address)',
  'function getChainBalanceOracleAdapter(uint256 chainId) view returns (address)',
  'function getTrustedAssets() view returns (address[])',
  'function getStrategiesForAsset(address asset) view returns (address[])',
  'function getOracleAdapterForAsset(address asset) view returns (address)',
  'function ATOKEN() view returns (address)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

type AaveAppAsset = {
  decimals: number;
  UNDERLYING: Hex;
  ATOKEN_VAULT?: Hex;
  PRICE_ORACLE_ADAPTER: Hex;
};

const read = <T>(client: Client, address: Hex, functionName: string, args: unknown[] = []) =>
  readContract(client, {address, abi: ABI, functionName, args} as any) as Promise<T>;

/** Contracts reachable from the roots: policies, gateway wiring, IOU token, oracles, a.DI controller. */
async function fetchWiring(client: Client, config: AaveAppAddresses): Promise<Record<string, Hex>> {
  const a = config.addresses;
  const gateway =
    config.chainKind === AaveAppChainKind.Accounting
      ? config.addresses.ACCOUNTING_CHAIN_GATEWAY
      : config.addresses.EARNING_CHAIN_GATEWAY;

  const wiring: Record<string, Hex> = {};
  for (const [key, id] of Object.entries(POLICY_IDS[config.chainKind])) {
    wiring[key] = await read<Hex>(client, a.POLICY_REGISTRY, 'getPolicy', [id]);
  }
  wiring.IOU_TOKEN_MANAGER = await read<Hex>(client, gateway, 'getIouTokenManager');
  wiring.IOU_TOKEN = await read<Hex>(client, wiring.IOU_TOKEN_MANAGER, 'getAsset');
  wiring.SLIPPAGE_COVERAGE_VAULT = await read<Hex>(client, a.SWAPPER, 'getSlippageVault');
  wiring.ADI_CROSS_CHAIN_CONTROLLER = await read<Hex>(
    client,
    a.ADI_ADAPTER,
    'getCrossChainController',
  );
  if (config.chainKind === AaveAppChainKind.Accounting) {
    wiring.FUNDS_HANDLER = await read<Hex>(client, gateway, 'getFundsHandler');
    for (const [name, chainId] of Object.entries(config.earningChains)) {
      wiring[`CHAIN_BALANCE_ORACLE_ADAPTER_${name}`] = await read<Hex>(
        client,
        config.addresses.CHAIN_BALANCE_ORACLE,
        'getChainBalanceOracleAdapter',
        [BigInt(chainId)],
      );
    }
  }
  return wiring;
}

/**
 * The trusted assets of the AssetRegistry, keyed by symbol (`fixSymbol`, so USD₮0 is USDT). The aToken vault is the
 * Allocator strategy for the asset that exposes `ATOKEN()`; other strategies (e.g. sGHO) are skipped.
 */
async function fetchAssets(
  client: Client,
  config: AaveAppAddresses,
): Promise<Record<string, AaveAppAsset>> {
  const a = config.addresses;
  const underlyings = await read<Hex[]>(client, a.ASSET_REGISTRY, 'getTrustedAssets');
  const assets: Record<string, AaveAppAsset> = {};
  for (const underlying of underlyings) {
    const [symbol, decimals, oracleAdapter, strategies] = await Promise.all([
      read<string>(client, underlying, 'symbol'),
      read<number>(client, underlying, 'decimals'),
      read<Hex>(client, a.PRICE_ORACLE, 'getOracleAdapterForAsset', [underlying]),
      read<Hex[]>(client, a.ALLOCATOR, 'getStrategiesForAsset', [underlying]),
    ]);
    const vaults: Hex[] = [];
    for (const strategy of strategies) {
      try {
        await read<Hex>(client, strategy, 'ATOKEN');
        vaults.push(strategy);
      } catch {}
    }
    if (vaults.length > 1)
      throw new Error(`${config.name}: several aToken vaults for ${symbol}: ${vaults}`);

    assets[fixSymbol(symbol, underlying)] = {
      decimals: Number(decimals),
      UNDERLYING: getAddress(underlying),
      ...(vaults[0] ? {ATOKEN_VAULT: getAddress(vaults[0])} : {}),
      PRICE_ORACLE_ADAPTER: getAddress(oracleAdapter),
    };
  }
  return assets;
}

/** `<KEY>_IMPL` for every contract behind an EIP-1967 proxy, placed right after it. */
async function withImplementations(client: Client, addresses: Record<string, Hex>) {
  const out: Record<string, Hex> = {};
  for (const [key, value] of Object.entries(addresses)) {
    out[key] = value;
    if (key === 'MAIN_ADMIN' || key === 'SECONDARY_ADMIN' || value === zeroAddress) continue;
    const impl = bytes32toAddress(await getImplementationStorageSlot(client, value));
    if (impl !== zeroAddress) out[`${key}_IMPL`] = impl;
  }
  return out;
}

export async function generateAaveApp(config: AaveAppAddresses) {
  const client = getClient(config.chainId);
  if (!client) throw new Error(`client for chain not found for chainId: ${config.chainId}`);

  const name = `AaveApp${config.name}`;
  const kind = AaveAppChainKind[config.chainKind];
  const {MAIN_ADMIN, SECONDARY_ADMIN, ...roots} = config.addresses;
  const all = await withImplementations(client, {
    ...roots,
    ...(await fetchWiring(client, config)),
    MAIN_ADMIN,
    SECONDARY_ADMIN,
  });
  const assets = await fetchAssets(client, config);

  const addresses: Addresses = Object.fromEntries(
    Object.entries(all).map(([key, value]) => [
      key,
      INTERFACES[key] ? {value, type: INTERFACES[key].type} : value,
    ]),
  );
  const interfaceImports = Object.entries(
    Object.keys(all)
      .filter((k) => INTERFACES[k] && all[k] !== zeroAddress)
      .reduce<Record<string, Set<string>>>((acc, k) => {
        (acc[INTERFACES[k].file] ??= new Set()).add(INTERFACES[k].type);
        return acc;
      }, {}),
  )
    .map(([file, types]) => `import {${[...types].join(', ')}} from './common/${file}';\n`)
    .join('');

  const assetConstants: Record<string, Addresses[keyof Addresses]> = {};
  for (const [symbol, asset] of Object.entries(assets)) {
    assetConstants[`${symbol}_UNDERLYING`] = asset.UNDERLYING;
    assetConstants[`${symbol}_DECIMALS`] = {value: asset.decimals, type: 'uint8'};
    if (asset.ATOKEN_VAULT) assetConstants[`${symbol}_ATOKEN_VAULT`] = asset.ATOKEN_VAULT;
    assetConstants[`${symbol}_PRICE_ORACLE_ADAPTER`] = asset.PRICE_ORACLE_ADAPTER;
  }

  fs.writeFileSync(
    `./src/${name}.sol`,
    prefixWithGeneratedWarning(
      prefixWithPragma(
        `import {AaveAppChainKind} from './common/AaveAppTypes.sol';\n` +
          interfaceImports +
          '\n' +
          wrapIntoSolidityLibrary(
            [
              `AaveAppChainKind internal constant CHAIN_KIND = AaveAppChainKind.${kind};\n`,
              ...generateSolidityConstants({chainId: config.chainId, addresses}),
            ],
            name,
          ) +
          '\n' +
          wrapIntoSolidityLibrary(
            generateSolidityConstants({
              chainId: config.chainId,
              addresses: assetConstants as Addresses,
            }),
            `${name}Assets`,
          ),
      ),
    ),
  );
  fs.writeFileSync(
    `./src/ts/${name}.ts`,
    prefixWithGeneratedWarning(
      `export const CHAIN_KIND = '${kind}' as const;\n\n` +
        generateJsConstants({
          chainId: config.chainId,
          addresses: {...all, CHAIN_ID: {value: config.chainId, type: 'uint256'}},
        }).join('\n') +
        `\nexport const ASSETS = ${JSON.stringify(assets, null, 2)} as const;\n`,
    ),
  );

  return {
    js: [`export * as ${name} from './${name}';`],
  };
}
