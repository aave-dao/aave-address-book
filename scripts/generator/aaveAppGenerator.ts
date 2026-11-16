import {Hex} from 'viem';
import * as fs from 'fs';
import {AaveAppAddresses, AaveAppChainKind, Addresses} from 'scripts/configs/types';
import {
  generateJsConstants,
  generateSolidityConstants,
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

export function generateAaveApp(config: AaveAppAddresses) {
  const name = `AaveApp${config.name}`;
  const kind = AaveAppChainKind[config.chainKind];
  const addresses: Addresses = Object.fromEntries(
    Object.entries(config.addresses).map(([key, value]) => [
      key,
      INTERFACES[key] ? {value: value as Hex, type: INTERFACES[key].type} : value,
    ]),
  );
  const interfaceImports = Object.entries(
    Object.keys(config.addresses)
      .filter((k) => INTERFACES[k])
      .reduce<Record<string, Set<string>>>((acc, k) => {
        (acc[INTERFACES[k].file] ??= new Set()).add(INTERFACES[k].type);
        return acc;
      }, {}),
  )
    .map(([file, types]) => `import {${[...types].join(', ')}} from './common/${file}';\n`)
    .join('');

  const solidityLibrary = wrapIntoSolidityLibrary(
    [
      `AaveAppChainKind internal constant CHAIN_KIND = AaveAppChainKind.${kind};\n`,
      ...generateSolidityConstants({chainId: config.chainId, addresses}),
    ],
    name,
  );

  fs.writeFileSync(
    `./src/${name}.sol`,
    prefixWithGeneratedWarning(
      prefixWithPragma(
        `import {AaveAppChainKind} from './common/AaveAppTypes.sol';\n` +
          interfaceImports +
          '\n' +
          solidityLibrary,
      ),
    ),
  );
  fs.writeFileSync(
    `./src/ts/${name}.ts`,
    prefixWithGeneratedWarning(
      `export const CHAIN_KIND = '${kind}' as const;\n\n` +
        generateJsConstants({
          chainId: config.chainId,
          addresses: {...config.addresses, CHAIN_ID: {value: config.chainId, type: 'uint256'}},
        }).join('\n'),
    ),
  );
  // per-asset library, same keys on every chain (see AaveAppAssets)
  const assetsName = `${name}Assets`;
  const assetConstants: Addresses = {};
  for (const [symbol, asset] of Object.entries(config.assets)) {
    assetConstants[`${symbol}_UNDERLYING`] = asset.UNDERLYING;
    assetConstants[`${symbol}_DECIMALS`] = {value: asset.DECIMALS, type: 'uint8'};
    if (asset.ATOKEN_VAULT) assetConstants[`${symbol}_ATOKEN_VAULT`] = asset.ATOKEN_VAULT;
    assetConstants[`${symbol}_PRICE_ORACLE_ADAPTER`] = asset.PRICE_ORACLE_ADAPTER;
  }
  fs.appendFileSync(
    `./src/${name}.sol`,
    '\n' +
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId: config.chainId, addresses: assetConstants}),
        assetsName,
      ),
  );
  fs.appendFileSync(
    `./src/ts/${name}.ts`,
    `\nexport const ASSETS = ${JSON.stringify(config.assets, null, 2)} as const;\n`,
  );

  return {
    js: [`export * as ${name} from './${name}';`],
  };
}
