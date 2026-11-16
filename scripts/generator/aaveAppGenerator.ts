import * as fs from 'fs';
import {AaveAppAddresses, AaveAppChainKind} from 'scripts/configs/types';
import {
  generateJsConstants,
  generateSolidityConstants,
  prefixWithGeneratedWarning,
  prefixWithPragma,
  wrapIntoSolidityLibrary,
} from 'scripts/generator/utils';

export function generateAaveApp(config: AaveAppAddresses) {
  const name = `AaveApp${config.name}`;
  const kind = AaveAppChainKind[config.chainKind];

  const solidityLibrary = wrapIntoSolidityLibrary(
    [
      `AaveAppChainKind internal constant CHAIN_KIND = AaveAppChainKind.${kind};\n`,
      ...generateSolidityConstants({chainId: config.chainId, addresses: config.addresses}),
    ],
    name,
  );

  fs.writeFileSync(
    `./src/${name}.sol`,
    prefixWithGeneratedWarning(
      prefixWithPragma(
        `import {AaveAppChainKind} from './common/AaveAppTypes.sol';\n\n` + solidityLibrary,
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
  return {
    js: [`export * as ${name} from './${name}';`],
  };
}
