import 'dotenv/config';
import { appendFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { governanceConfigMainnet } from 'scripts/configs/governance/ethereum';
import { arbitrumProtoV3, arbitrumSepoliaProtoV3 } from 'scripts/configs/pools/arbitrum';
import {
  avalancheProtoV2,
  avalancheProtoV3,
  fujiProtoV2,
  fujiProtoV3,
} from 'scripts/configs/pools/avalanche';
import { baseProtoV3, baseSepoliaProtoV3, baseSepoliaLidoProtoV3 } from 'scripts/configs/pools/base';
import {
  mainnetProtoV3Pool,
  mainnetAmmV2Pool,
  mainnetArcV2Pool,
  mainnetProtoV2Pool,
  sepoliaProtoV3,
  lidoEthereumMainnetProtoV3Pool,
  horizonEthereumMainnetProtoV3Pool,
  etherFiEthereumMainnetProtoV3Pool,
} from 'scripts/configs/pools/ethereum';
import { metisProtoV3 } from 'scripts/configs/pools/metis';
import { gnosisProtoV3 } from 'scripts/configs/pools/gnosis';
import { bnbProtoV3 } from 'scripts/configs/pools/bnb';
import { optimismProtoV3, optimismSepoliaProtoV3 } from 'scripts/configs/pools/optimism';
import { polygonProtoV2, polygonProtoV3 } from 'scripts/configs/pools/polygon';
import { scrollProtoV3 } from 'scripts/configs/pools/scroll';
import { zkSyncProtoV3 } from 'scripts/configs/pools/zksync';
import { lineaProtoV3 } from 'scripts/configs/pools/linea';
import { celoProtoV3 } from 'scripts/configs/pools/celo';
import { mantleProtoV3 } from 'scripts/configs/pools/mantle';
import { sonicProtoV3 } from 'scripts/configs/pools/sonic';
import { soneiumProtoV3 } from 'scripts/configs/pools/soneium';
import { inkProtoV3, inkSepoliaProtoV3 } from 'scripts/configs/pools/ink';
import { plasmaProtoV3 } from 'scripts/configs/pools/plasma';
import { megaEthProtoV3 } from 'scripts/configs/pools/megaeth';
import { xLayerProtoV3 } from 'scripts/configs/pools/xlayer';
import { monadProtoV3 } from 'scripts/configs/pools/monad';
import { mainnetV4Config } from 'scripts/configs/v4/ethereum';
import { avalancheV4Config } from 'scripts/configs/v4/avalanche';
import { arcV4Config } from 'scripts/configs/v4/arc';
import { generateProtocolV4Library } from 'scripts/generator/protocolV4Generator';
import { generateGovernanceLibrary } from 'scripts/generator/governanceV3Generator';
import { generateProtocolV2Library } from 'scripts/generator/protocolV2Generator';
import { generateProtocolV3Library } from 'scripts/generator/protocolV3Generator';
import { generateUmbrellaLibrary } from 'scripts/generator/umbrellaGenerator';
import { generateGovV2 } from 'scripts/generator/governanceV2Generator';
import { prefixWithGeneratedWarning } from 'scripts/generator/utils';
import { generateSafetyModule } from 'scripts/generator/safetyModuleGenerator';
import { governanceConfigArbitrum } from 'scripts/configs/governance/arbitrum';
import { governanceConfigAvalanche, governanceConfigFuji } from 'scripts/configs/governance/avalanche';
import { governanceConfigOptimism } from 'scripts/configs/governance/optimism';
import { governanceConfigPolygon } from 'scripts/configs/governance/polygon';
import { generateABIImports } from 'scripts/generator/abis';
import { governanceConfigMetis } from 'scripts/configs/governance/metis';
import { governanceConfigBase } from 'scripts/configs/governance/base';
import { governanceConfigBNB } from 'scripts/configs/governance/bnb';
import { governanceConfigCelo } from 'scripts/configs/governance/celo';
import { governanceConfigGnosis } from 'scripts/configs/governance/gnosis';
import { baseAddresses, baseSepoliaAddresses } from 'scripts/configs/networks/base';
import { generateNetworkAddresses } from 'scripts/generator/networkGenerator';
import { arbitrumAddresses, arbitrumSepoliaAddresses } from 'scripts/configs/networks/arbitrum';
import { avalancheAddresses, avalancheFujiAddresses } from 'scripts/configs/networks/avalanche';
import { ethereumAddresses, sepoliaAddresses } from 'scripts/configs/networks/ethereum';
import { polygonAddresses } from 'scripts/configs/networks/polygon';
import { fantomAddresses } from 'scripts/configs/networks/fantom';
import { optimismAddresses, optimismSepoliaAddresses } from 'scripts/configs/networks/optimism';
import { metisAddresses } from 'scripts/configs/networks/metis';
import { gnosisAddresses } from 'scripts/configs/networks/gnosis';
import { bnbAddresses } from 'scripts/configs/networks/bnb';
import { celoAddresses } from 'scripts/configs/networks/celo';
import { scrollAddresses } from 'scripts/configs/networks/scroll';
import { inkAddresses, inkWhiteLabelAddresses, inkSepoliaAddresses } from 'scripts/configs/networks/ink';
import { governanceConfigScroll } from 'scripts/configs/governance/scroll';
import { generateTokenList } from 'scripts/generator/generateTokenList';
import { generateAaveV1 } from 'scripts/generator/protocolV1Generator';
import { governanceConfigZkSync } from 'scripts/configs/governance/zksync';
import { zkSyncAddresses } from 'scripts/configs/networks/zksync';
import { lineaAddresses } from 'scripts/configs/networks/linea';
import { ghoArbitrum } from 'scripts/configs/gho/arbitrum';
import { ghoAvalanche } from 'scripts/configs/gho/avalanche';
import { ghoBase } from 'scripts/configs/gho/base';
import { ghoEthereum } from 'scripts/configs/gho/ethereum';
import { ghoGnosis } from 'scripts/configs/gho/gnosis';
import { ghoInk } from 'scripts/configs/gho/ink';
import { ghoPlasma } from 'scripts/configs/gho/plasma';
import { ghoMantle } from 'scripts/configs/gho/mantle';
import { ghoMonad } from 'scripts/configs/gho/monad';
import { ghoXLayer } from 'scripts/configs/gho/xlayer';
import { generateGho } from 'scripts/generator/ghoGenerator';
import { governanceConfigLinea } from 'scripts/configs/governance/linea';
import { mantleAddresses } from 'scripts/configs/networks/mantle';
import { sonicAddresses } from 'scripts/configs/networks/sonic';
import { soneiumAddresses } from 'scripts/configs/networks/soneium';
import { plasmaAddresses } from 'scripts/configs/networks/plasma';
import { governanceConfigMantle } from 'scripts/configs/governance/mantle';
import { governanceConfigSonic } from 'scripts/configs/governance/sonic';
import { umbrellaMainnetConfig } from 'scripts/configs/umbrella/ethereum';
import { umbrellaBaseSepoliaConfig } from 'scripts/configs/umbrella/base';
import { generateChainlink } from 'scripts/generator/chainlink';
import { governanceConfigSoneium } from 'scripts/configs/governance/soneium';
import { governanceConfigBob } from 'scripts/configs/governance/bob';
import { bobAddresses } from 'scripts/configs/networks/bob';
import { governanceConfigInk, governanceConfigInkWhiteLabel } from 'scripts/configs/governance/ink';
import { governanceConfigPlasma } from 'scripts/configs/governance/plasma';
import { governanceConfigMegaEth } from 'scripts/configs/governance/megaeth';
import { megaEthAddresses } from 'scripts/configs/networks/megaeth';
import { governanceConfigXLayer } from 'scripts/configs/governance/xlayer';
import { xLayerAddresses } from 'scripts/configs/networks/xlayer';
import { governanceConfigMonad } from 'scripts/configs/governance/monad';
import { monadAddresses } from 'scripts/configs/networks/monad';
import { arcAddresses } from 'scripts/configs/networks/arc';

async function main() {
  // cleanup ts artifacts
  if (existsSync('./src/ts')) {
    const files = readdirSync('./src/ts');
    for (const file of files) {
      if (file !== 'abis' && file !== 'AaveV3Harmony.ts' && file !== 'utils.ts')
        rmSync(`./src/ts/${file}`);
    }
  } else {
    mkdirSync('./src/ts');
  }

  // generate files
  const governanceNames = await Promise.all(
    [
      // governanceConfigSepolia,
      governanceConfigMainnet,
      governanceConfigArbitrum,
      governanceConfigAvalanche,
      governanceConfigFuji,
      governanceConfigOptimism,
      governanceConfigPolygon,
      governanceConfigMetis,
      governanceConfigBase,
      governanceConfigBNB,
      governanceConfigGnosis,
      governanceConfigScroll,
      governanceConfigZkSync,
      governanceConfigCelo,
      governanceConfigLinea,
      governanceConfigMantle,
      governanceConfigSonic,
      governanceConfigSoneium,
      governanceConfigBob,
      governanceConfigInk,
      governanceConfigInkWhiteLabel,
      governanceConfigPlasma,
      governanceConfigMegaEth,
      governanceConfigXLayer,
      governanceConfigMonad
    ].map((config) => generateGovernanceLibrary(config)),
  );
  const v1Library = generateAaveV1();
  const v2LibraryNames = await Promise.all(
    [
      mainnetAmmV2Pool,
      mainnetArcV2Pool,
      mainnetProtoV2Pool,
      polygonProtoV2,
      fujiProtoV2,
      avalancheProtoV2,
    ].map((config) => generateProtocolV2Library(config)),
  );

  const v3LibraryNames = await Promise.all(
    [
      mainnetProtoV3Pool,
      sepoliaProtoV3,
      polygonProtoV3,
      avalancheProtoV3,
      fujiProtoV3,
      baseProtoV3,
      baseSepoliaProtoV3,
      baseSepoliaLidoProtoV3,
      metisProtoV3,
      gnosisProtoV3,
      bnbProtoV3,
      arbitrumProtoV3,
      arbitrumSepoliaProtoV3,
      optimismProtoV3,
      optimismSepoliaProtoV3,
      scrollProtoV3,
      zkSyncProtoV3,
      // fantomTestnetProtoV3,
      // fantomProtoV3,
      // harmonyProtoV3,
      lidoEthereumMainnetProtoV3Pool,
      etherFiEthereumMainnetProtoV3Pool,
      horizonEthereumMainnetProtoV3Pool,
      lineaProtoV3,
      celoProtoV3,
      mantleProtoV3,
      sonicProtoV3,
      soneiumProtoV3,
      inkProtoV3,
      inkSepoliaProtoV3,
      plasmaProtoV3,
      megaEthProtoV3,
      xLayerProtoV3,
      monadProtoV3,
    ].map((config) => generateProtocolV3Library(config)),
  );
  const v4LibraryNames = await Promise.all(
    [mainnetV4Config, avalancheV4Config, arcV4Config].map((config) =>
      generateProtocolV4Library(config),
    ),
  );

  const ghoAddresses = [ghoEthereum, ghoArbitrum, ghoBase, ghoAvalanche, ghoGnosis, ghoInk, ghoPlasma, ghoMantle, ghoMonad, ghoXLayer].map((config) =>
    generateGho(config),
  );
  const umbrellaAddresses = await Promise.all(
    [umbrellaMainnetConfig, umbrellaBaseSepoliaConfig].map((config) =>
      generateUmbrellaLibrary(config),
    ),
  );
  const tokenListImports = await generateTokenList([
    ...v2LibraryNames,
    ...v3LibraryNames,
    ...umbrellaAddresses,
  ]);
  console.log('✅ Tokens list generation finished');

  const networkAddresses = [
    arbitrumAddresses,
    arbitrumSepoliaAddresses,
    avalancheAddresses,
    avalancheFujiAddresses,
    baseAddresses,
    baseSepoliaAddresses,
    ethereumAddresses,
    fantomAddresses,
    optimismAddresses,
    optimismSepoliaAddresses,
    polygonAddresses,
    metisAddresses,
    gnosisAddresses,
    bnbAddresses,
    celoAddresses,
    scrollAddresses,
    sepoliaAddresses,
    zkSyncAddresses,
    lineaAddresses,
    mantleAddresses,
    sonicAddresses,
    soneiumAddresses,
    bobAddresses,
    inkAddresses,
    inkWhiteLabelAddresses,
    inkSepoliaAddresses,
    plasmaAddresses,
    megaEthAddresses,
    xLayerAddresses,
    monadAddresses,
    arcAddresses,
  ].map((addresses) => generateNetworkAddresses(addresses));

  const govImports = generateGovV2();

  const smImports = generateSafetyModule();

  const abis = generateABIImports();

  const cl = generateChainlink();

  writeFileSync('./src/ts/abis/index.ts', abis.join('\n'));

  const imports = [
    governanceNames,
    v1Library,
    v2LibraryNames,
    v3LibraryNames,
    v4LibraryNames,
    networkAddresses,
    govImports,
    smImports,
    tokenListImports,
    ghoAddresses,
    umbrellaAddresses,
    cl,
  ].flat();

  const jsExports = imports.map((f) => f.js).flat();
  writeFileSync(`./src/ts/AaveAddressBook.ts`, prefixWithGeneratedWarning(''));
  jsExports.map((jsExport) => appendFileSync('./src/ts/AaveAddressBook.ts', `${jsExport}\n`));
  console.log('✅ Generation finished');
}

main();
