import {appendFileSync, writeFileSync} from 'fs';
import {Hex, zeroAddress} from 'viem';
import {Addresses, V4Config} from 'scripts/configs/types';
import {
  generateJsConstants,
  generateJsObject,
  generateSolidityConstants,
  keyToVar,
  prefixWithGeneratedWarning,
  prefixWithPragma,
  wrapIntoSolidityLibrary,
} from 'scripts/generator/utils';
import {getClient} from 'scripts/clients';
import {fetchHubAssets, FetchedHubAsset} from 'scripts/generator/protocol-v4-generator/fetchHubAssets';
import {fetchTokenizationSpokes} from 'scripts/generator/protocol-v4-generator/fetchTokenizationSpokes';
import {fetchAllSpokes} from 'scripts/generator/protocol-v4-generator/fetchAllSpokes';
import {fetchPriceFeeds, FetchedPriceFeed} from 'scripts/generator/protocol-v4-generator/fetchPriceFeeds';

const V4_INTERFACE_REGISTRY: Record<string, string> = {
  ACCESS_MANAGER: 'IAccessManagerEnumerable',
  HUB_CONFIGURATOR: 'IHubConfigurator',
  SPOKE_CONFIGURATOR: 'ISpokeConfigurator',
  TREASURY_SPOKE: 'ITreasurySpoke',
  CONFIG_ENGINE: 'IAaveV4ConfigEngine',
  GIVER_POSITION_MANAGER: 'IGiverPositionManager',
  TAKER_POSITION_MANAGER: 'ITakerPositionManager',
  CONFIG_POSITION_MANAGER: 'IConfigPositionManager',
  NATIVE_TOKEN_GATEWAY: 'INativeTokenGateway',
  SIGNATURE_GATEWAY: 'ISignatureGateway',
};

interface ResolvedHub {
  hub: Hex;
  assets: (FetchedHubAsset & {tokenizationSpoke?: Hex})[];
}

function buildMainLibraryAddresses(config: V4Config): Addresses {
  const addresses: Addresses = {};
  for (const [key, value] of Object.entries(config.admin)) {
    const interfaceType = V4_INTERFACE_REGISTRY[key];
    addresses[key] = interfaceType ? {value, type: interfaceType} : value;
  }
  return {...addresses, ...config.additionalAddresses};
}

function buildHubsAddresses(
  resolvedHubs: Record<string, ResolvedHub>,
): Addresses {
  const addresses: Addresses = {};
  for (const [hubName, hubData] of Object.entries(resolvedHubs)) {
    addresses[`${hubName}_HUB`] = {value: hubData.hub, type: 'IHub'};
  }
  return addresses;
}

function buildSpokesByBaseKey(config: V4Config): Record<string, Hex> {
  return {
    ...Object.fromEntries(
      Object.entries(config.spokes).map(([name, addr]) => [`${name}_SPOKE`, addr]),
    ),
    ...Object.fromEntries(
      Object.entries(config.eSpokes ?? {}).map(([name, addr]) => [`${name}_ESPOKE`, addr]),
    ),
  };
}

function buildSpokesAddresses(
  spokesByBaseKey: Record<string, Hex>,
  treasurySpoke: Hex | undefined,
  oraclesByBaseKey: Map<string, Hex>,
): Addresses {
  const addresses: Addresses = {};

  if (treasurySpoke) {
    addresses['TREASURY_SPOKE'] = {value: treasurySpoke, type: 'ITreasurySpoke'};
  }

  for (const [baseKey, spokeAddress] of Object.entries(spokesByBaseKey)) {
    addresses[baseKey] = {value: spokeAddress, type: 'ISpoke'};
    const oracle = oraclesByBaseKey.get(baseKey);
    if (oracle) {
      addresses[`${baseKey}_ORACLE`] = {value: oracle, type: 'IAaveOracle'};
    }
  }

  return addresses;
}

function buildSpokePriceFeedsAddresses(
  spokesByBaseKey: Record<string, Hex>,
  priceFeedData: FetchedPriceFeed[],
): Addresses {
  const addresses: Addresses = {};

  for (const baseKey of Object.keys(spokesByBaseKey)) {
    const spokePriceFeeds = priceFeedData.filter((pf) => pf.spokeBaseKey === baseKey);
    const symbolCount = new Map<string, number>();
    for (const pf of spokePriceFeeds) {
      symbolCount.set(pf.symbol, (symbolCount.get(pf.symbol) || 0) + 1);
    }
    for (const pf of spokePriceFeeds) {
      const needsDisambiguation = symbolCount.get(pf.symbol)! > 1;
      const key = needsDisambiguation
        ? `${pf.spokeBaseKey}_${pf.hubName}_${pf.symbol}_PRICE_FEED`
        : `${pf.spokeBaseKey}_${pf.symbol}_PRICE_FEED`;
      addresses[key] = pf.priceFeed;
    }
  }

  return addresses;
}

function buildTokenizationSpokesAddresses(resolvedHubs: Record<string, ResolvedHub>): Addresses {
  const addresses: Addresses = {};
  for (const [hubName, hubData] of Object.entries(resolvedHubs)) {
    for (const asset of hubData.assets) {
      if (!asset.tokenizationSpoke) continue;
      addresses[`${hubName}_${asset.symbol}_TOKENIZATION_SPOKE`] = {
        value: asset.tokenizationSpoke,
        type: 'ITokenizationSpoke',
      };
    }
  }
  return addresses;
}

function buildIRStrategiesAddresses(resolvedHubs: Record<string, ResolvedHub>): Addresses {
  const addresses: Addresses = {};
  for (const [hubName, hubData] of Object.entries(resolvedHubs)) {
    for (const asset of hubData.assets) {
      addresses[`${hubName}_${asset.symbol}_IR_STRATEGY`] = {
        value: asset.irStrategy,
        type: 'IBasicInterestRateStrategy',
      };
    }
  }
  return addresses;
}

function buildPositionManagersAddresses(config: V4Config): Addresses {
  const addresses: Addresses = {};
  for (const [key, value] of Object.entries(config.positionManagers ?? {})) {
    const interfaceType = V4_INTERFACE_REGISTRY[key];
    addresses[key] = interfaceType ? {value, type: interfaceType} : value;
  }
  return addresses;
}

function buildExternalLibrariesAddresses(config: V4Config): Addresses {
  const addresses: Addresses = {};
  for (const [key, value] of Object.entries(config.externalLibraries)) {
    addresses[key] = value;
  }
  return addresses;
}

function buildAssetsAddresses(resolvedHubs: Record<string, ResolvedHub>): {
  solAddresses: Addresses[];
  jsObject: Record<string, Record<string, any>>;
} {
  const seen = new Set<string>();
  const solAddresses: Addresses[] = [];
  const jsObject: Record<string, Record<string, any>> = {};

  for (const hubData of Object.values(resolvedHubs)) {
    for (const asset of hubData.assets) {
      if (seen.has(asset.symbol)) continue;
      seen.add(asset.symbol);

      const addresses: Addresses = {};
      addresses[`${asset.symbol}_UNDERLYING`] = asset.underlying;
      addresses[`${asset.symbol}_DECIMALS`] = {value: asset.decimals, type: 'uint8'};
      solAddresses.push(addresses);

      jsObject[asset.symbol] = {
        UNDERLYING: asset.underlying,
        decimals: asset.decimals,
      };
    }
  }

  return {solAddresses, jsObject};
}

function buildSolidityGetter(
  fnName: string,
  iface: string,
  varName: string,
  sibLibraryName: string,
  keys: string[],
): string {
  const body = [
    `    ${iface}[] memory ${varName} = new ${iface}[](${keys.length});`,
    ...keys.map((key, i) => `    ${varName}[${i}] = ${sibLibraryName}.${keyToVar(key)};`),
    `    return ${varName};`,
  ].join('\n');
  return `  function ${fnName}() internal pure returns (${iface}[] memory) {\n${body}\n  }`;
}

function buildTsGetter(exportName: string, sourceObjectName: string, keys: string[]): string {
  const items = keys.map((key) => `${sourceObjectName}.${keyToVar(key)}`).join(', ');
  return `export const ${exportName} = [${items}] as const;`;
}

function buildSolidityRawGetter(
  fnName: string,
  varName: string,
  entries: {libraryName: string; key: string}[],
  trailing: Hex[] = [],
): string {
  const total = entries.length + trailing.length;
  const body = [
    `    address[] memory ${varName} = new address[](${total});`,
    ...entries.map(
      (e, i) => `    ${varName}[${i}] = address(${e.libraryName}.${keyToVar(e.key)});`,
    ),
    ...trailing.map((addr, i) => `    ${varName}[${entries.length + i}] = ${addr};`),
    `    return ${varName};`,
  ].join('\n');
  return `  function ${fnName}() internal pure returns (address[] memory) {\n${body}\n  }`;
}

function buildTsRawGetter(
  exportName: string,
  entries: {sourceObjectName: string; key: string}[],
  trailing: Hex[] = [],
): string {
  const items = [
    ...entries.map((e) => `${e.sourceObjectName}.${keyToVar(e.key)}`),
    ...trailing.map((addr) => `'${addr}'`),
  ].join(', ');
  return `export const ${exportName} = [${items}] as const;`;
}

const POSITION_MANAGER_STRUCT_FIELDS: {field: string; key: string; iface: string}[] = [
  {field: 'giver', key: 'GIVER_POSITION_MANAGER', iface: 'IGiverPositionManager'},
  {field: 'taker', key: 'TAKER_POSITION_MANAGER', iface: 'ITakerPositionManager'},
  {field: 'config', key: 'CONFIG_POSITION_MANAGER', iface: 'IConfigPositionManager'},
  {field: 'nativeGateway', key: 'NATIVE_TOKEN_GATEWAY', iface: 'INativeTokenGateway'},
  {field: 'signatureGateway', key: 'SIGNATURE_GATEWAY', iface: 'ISignatureGateway'},
];

function buildPositionManagersGetter(libraryName: string, pmAddresses: Addresses): string {
  const fields = POSITION_MANAGER_STRUCT_FIELDS.map(({field, key, iface}) => {
    const entry = pmAddresses[key];
    const value = typeof entry === 'object' ? entry.value : entry;
    const assigned =
      value && value !== zeroAddress ? `${libraryName}.${keyToVar(key)}` : `${iface}(address(0))`;
    return `      ${field}: ${assigned}`;
  }).join(',\n');
  return [
    '  function getPositionManagers() internal pure returns (PositionManagers memory) {',
    '    return PositionManagers({',
    fields,
    '    });',
    '  }',
  ].join('\n');
}

export async function generateProtocolV4Library(config: V4Config) {
  const client = getClient(config.chainId);
  if (!client) {
    throw new Error(`client for chain not found for chainId: ${config.chainId}`);
  }

  const spokesByBaseKey = buildSpokesByBaseKey(config);

  const knownNonTokenizationSpokes = new Set<string>(
    Object.values(spokesByBaseKey).map((s) => s.toLowerCase()),
  );
  const treasurySpoke = config.admin.TREASURY_SPOKE;
  if (treasurySpoke) {
    knownNonTokenizationSpokes.add(treasurySpoke.toLowerCase());
  }

  // Fetch assets + tokenization spokes + all on-chain spokes for each hub
  const resolvedHubs: Record<string, ResolvedHub> = {};
  const allOnChainSpokes: Hex[] = [];
  for (const [hubName, hubAddress] of Object.entries(config.hubs)) {
    const assets = await fetchHubAssets(client, hubAddress);
    const hubSpokes = await fetchAllSpokes(client, hubAddress, assets);
    const tokSpokes = await fetchTokenizationSpokes(
      client,
      hubAddress,
      hubName,
      assets,
      hubSpokes.spokesByAssetId,
      knownNonTokenizationSpokes,
    );
    allOnChainSpokes.push(...hubSpokes.allSpokes);
    resolvedHubs[hubName] = {
      hub: hubAddress,
      assets: assets.map((a) => ({...a, tokenizationSpoke: tokSpokes.get(a.assetId)})),
    };
  }

  // Build lookup maps for price feed resolution
  const hubNameByAddress = new Map(
    Object.entries(config.hubs).map(([name, hubAddr]) => [hubAddr.toLowerCase(), name]),
  );
  const symbolByHubAsset = new Map<string, string>();
  for (const [, hubData] of Object.entries(resolvedHubs)) {
    for (const asset of hubData.assets) {
      symbolByHubAsset.set(`${hubData.hub.toLowerCase()}-${asset.assetId}`, asset.symbol);
    }
  }

  const {priceFeeds: priceFeedData, oraclesByBaseKey} = await fetchPriceFeeds(
    client,
    spokesByBaseKey,
    hubNameByAddress,
    symbolByHubAsset,
  );

  const name = `AaveV4${config.name}`;
  const chainId = config.chainId;

  const imports = `import {IHub, IHubConfigurator, ISpoke, ISpokeConfigurator, ITokenizationSpoke, ITreasurySpoke, IAaveOracle, IConfigPositionManager, IGiverPositionManager, ITakerPositionManager, INativeTokenGateway, ISignatureGateway, IAaveV4ConfigEngine, IAccessManagerEnumerable, IBasicInterestRateStrategy, PositionManagers} from './AaveV4.sol';\n`;

  // Main library (core addresses)
  const mainAddresses = buildMainLibraryAddresses(config);
  writeFileSync(
    `./src/${name}.sol`,
    prefixWithGeneratedWarning(
      prefixWithPragma(
        imports +
          wrapIntoSolidityLibrary(
            generateSolidityConstants({chainId, addresses: mainAddresses}),
            name,
          ),
      ),
    ),
  );
  writeFileSync(
    `./src/ts/${name}.ts`,
    prefixWithGeneratedWarning(
      generateJsConstants({
        chainId,
        addresses: {
          ...mainAddresses,
          CHAIN_ID: {value: chainId, type: 'uint256'},
        },
      }).join('\n'),
    ),
  );

  // Hubs library (hub addresses)
  const hubsAddresses = buildHubsAddresses(resolvedHubs);
  if (Object.keys(hubsAddresses).length > 0) {
    const hubsLibraryName = `${name}Hubs`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId, addresses: hubsAddresses}),
        hubsLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const HUBS = ${generateJsObject(hubsAddresses)} as const;\n`,
    );
  }

  // Spokes library (treasury spoke + lending spokes + oracles)
  const spokesAddresses = buildSpokesAddresses(spokesByBaseKey, treasurySpoke, oraclesByBaseKey);
  if (Object.keys(spokesAddresses).length > 0) {
    const spokesLibraryName = `${name}Spokes`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId, addresses: spokesAddresses}),
        spokesLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const SPOKES = ${generateJsObject(spokesAddresses)} as const;\n`,
    );
  }

  // Spoke Price Feeds library
  const spokePriceFeedsAddresses = buildSpokePriceFeedsAddresses(spokesByBaseKey, priceFeedData);
  if (Object.keys(spokePriceFeedsAddresses).length > 0) {
    const spokePriceFeedsLibraryName = `${name}SpokePriceFeeds`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId, addresses: spokePriceFeedsAddresses}),
        spokePriceFeedsLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const SPOKE_PRICE_FEEDS = ${generateJsObject(spokePriceFeedsAddresses)} as const;\n`,
    );
  }

  // Tokenization Spokes library
  const tokenSpokesAddresses = buildTokenizationSpokesAddresses(resolvedHubs);
  if (Object.keys(tokenSpokesAddresses).length > 0) {
    const tokenSpokesLibraryName = `${name}TokenizationSpokes`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId, addresses: tokenSpokesAddresses}),
        tokenSpokesLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const TOKENIZATION_SPOKES = ${generateJsObject(tokenSpokesAddresses)} as const;\n`,
    );
  }

  // IR Strategies library (per-hub, per-asset interest rate strategies)
  const irStrategiesAddresses = buildIRStrategiesAddresses(resolvedHubs);
  if (Object.keys(irStrategiesAddresses).length > 0) {
    const irStrategiesLibraryName = `${name}IRStrategies`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId, addresses: irStrategiesAddresses}),
        irStrategiesLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const IR_STRATEGIES = ${generateJsObject(irStrategiesAddresses)} as const;\n`,
    );
  }

  // Position Managers library
  const pmAddresses = buildPositionManagersAddresses(config);
  if (Object.keys(pmAddresses).length > 0) {
    const pmLibraryName = `${name}PositionManagers`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId, addresses: pmAddresses}),
        pmLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const POSITION_MANAGERS = ${generateJsObject(pmAddresses)} as const;\n`,
    );
  }

  // External Libraries library
  const extLibAddresses = buildExternalLibrariesAddresses(config);
  if (Object.keys(extLibAddresses).length > 0) {
    const extLibraryName = `${name}ExternalLibraries`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        generateSolidityConstants({chainId, addresses: extLibAddresses}),
        extLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const EXTERNAL_LIBRARIES = ${generateJsObject(extLibAddresses)} as const;\n`,
    );
  }

  // Consolidated assets library (deduplicated across all hubs)
  const {solAddresses: assetsSolAddresses, jsObject: assetsJsObject} =
    buildAssetsAddresses(resolvedHubs);
  if (assetsSolAddresses.length > 0) {
    const assetsLibraryName = `${name}Assets`;
    appendFileSync(
      `./src/${name}.sol`,
      wrapIntoSolidityLibrary(
        assetsSolAddresses
          .map((addresses) => generateSolidityConstants({chainId, addresses}))
          .flat(),
        assetsLibraryName,
      ),
    );
    appendFileSync(
      `./src/ts/${name}.ts`,
      `\nexport const ASSETS = ${JSON.stringify(assetsJsObject, null, 2)} as const;\n`,
    );
  }

  // Getters library: aggregated lookups that reuse the constants defined above
  const hubGetterKeys = Object.keys(hubsAddresses).filter(
    (key) => (hubsAddresses[key] as {value: Hex}).value !== zeroAddress,
  );
  const spokeGetterKeys = Object.keys(spokesByBaseKey).filter(
    (key) => spokesByBaseKey[key] !== zeroAddress,
  );
  const tokSpokeGetterKeys = Object.keys(tokenSpokesAddresses).filter(
    (key) => (tokenSpokesAddresses[key] as {value: Hex}).value !== zeroAddress,
  );

  const solGetterFns: string[] = [];
  const tsGetterLines: string[] = [];

  if (hubGetterKeys.length > 0) {
    solGetterFns.push(
      buildSolidityGetter('getAllHubs', 'IHub', 'hubs', `${name}Hubs`, hubGetterKeys),
    );
    tsGetterLines.push(buildTsGetter('ALL_HUBS', 'HUBS', hubGetterKeys));
  }
  if (spokeGetterKeys.length > 0) {
    solGetterFns.push(
      buildSolidityGetter('getAllSpokes', 'ISpoke', 'spokes', `${name}Spokes`, spokeGetterKeys),
    );
    tsGetterLines.push(buildTsGetter('ALL_SPOKES', 'SPOKES', spokeGetterKeys));
  }
  if (tokSpokeGetterKeys.length > 0) {
    solGetterFns.push(
      buildSolidityGetter(
        'getAllTokenizationSpokes',
        'ITokenizationSpoke',
        'tokenizedSpokes',
        `${name}TokenizationSpokes`,
        tokSpokeGetterKeys,
      ),
    );
    tsGetterLines.push(
      buildTsGetter('ALL_TOKENIZED_SPOKES', 'TOKENIZATION_SPOKES', tokSpokeGetterKeys),
    );
  }

  const rawSpokeEntries: {libraryName: string; key: string}[] = [];
  const rawSpokeTsEntries: {sourceObjectName: string; key: string}[] = [];

  if (treasurySpoke && treasurySpoke !== zeroAddress) {
    rawSpokeEntries.push({libraryName: `${name}Spokes`, key: 'TREASURY_SPOKE'});
    rawSpokeTsEntries.push({sourceObjectName: 'SPOKES', key: 'TREASURY_SPOKE'});
  }
  for (const key of spokeGetterKeys) {
    rawSpokeEntries.push({libraryName: `${name}Spokes`, key});
    rawSpokeTsEntries.push({sourceObjectName: 'SPOKES', key});
  }
  for (const key of tokSpokeGetterKeys) {
    rawSpokeEntries.push({libraryName: `${name}TokenizationSpokes`, key});
    rawSpokeTsEntries.push({sourceObjectName: 'TOKENIZATION_SPOKES', key});
  }

  const knownSpokes = new Set<string>(knownNonTokenizationSpokes);
  for (const hubData of Object.values(resolvedHubs)) {
    for (const asset of hubData.assets) {
      if (asset.tokenizationSpoke) knownSpokes.add(asset.tokenizationSpoke.toLowerCase());
    }
  }

  const unknownSpokes: Hex[] = [];
  const seenUnknown = new Set<string>();
  for (const addr of allOnChainSpokes) {
    const lower = addr.toLowerCase();
    if (knownSpokes.has(lower) || seenUnknown.has(lower)) continue;
    seenUnknown.add(lower);
    unknownSpokes.push(addr);
  }

  if (rawSpokeEntries.length > 0 || unknownSpokes.length > 0) {
    solGetterFns.push(
      buildSolidityRawGetter('getAllSpokesRaw', 'spokes', rawSpokeEntries, unknownSpokes),
    );
    tsGetterLines.push(buildTsRawGetter('ALL_SPOKES_RAW', rawSpokeTsEntries, unknownSpokes));
  }

  if (Object.keys(pmAddresses).length > 0) {
    solGetterFns.push(buildPositionManagersGetter(`${name}PositionManagers`, pmAddresses));
  }

  if (solGetterFns.length > 0) {
    appendFileSync(
      `./src/${name}.sol`,
      `\nlibrary ${name}Getters {\n${solGetterFns.join('\n\n')}\n}\n`,
    );
    appendFileSync(`./src/ts/${name}.ts`, `\n${tsGetterLines.join('\n')}\n`);
  }

  return {
    name,
    chainId,
    js: [`export * as ${name} from './${name}';`],
  };
}
