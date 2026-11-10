import {execFile} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {prefixWithGeneratedWarning} from 'scripts/generator/utils';
import {generateABIImports} from 'scripts/generator/abis';
import {RUST_ABI_DIRECTORY, replaceDirectory} from 'scripts/generator/rust';
import {writeRustABIs} from 'scripts/generator/rustAbis';
import {ABI_INTERFACES} from 'scripts/configs/abis';

const awaitableExecFile = promisify(execFile);
export const ABI_DIRECTORY = './src/ts/abis';

/**
 * @dev Compiles every interface once and writes the same ABI to both outputs: TypeScript under
 * `tsOutputDirectory` and alloy bindings under `rustOutputDirectory`.
 */
export async function generateABIs(tsOutputDirectory: string, rustOutputDirectory: string) {
  mkdirSync(tsOutputDirectory, {recursive: true});
  mkdirSync(rustOutputDirectory, {recursive: true});
  const abis: {name: string; target: string; abi: unknown}[] = [];

  for (const {name, target} of ABI_INTERFACES) {
    const {stdout} = await awaitableExecFile('forge', ['inspect', '--json', target, 'abi']);
    const abi = JSON.parse(stdout.trim());
    abis.push({name, target, abi});
    writeFileSync(
      join(tsOutputDirectory, `${name}.ts`),
      prefixWithGeneratedWarning(
        `export const ${name}_ABI = ${JSON.stringify(abi, null, 2)} as const;`,
      ),
    );
  }

  writeFileSync(join(tsOutputDirectory, 'index.ts'), `${generateABIImports().join('\n')}\n`);
  writeRustABIs(rustOutputDirectory, abis);
}

async function replaceGeneratedABIs() {
  await replaceDirectory(ABI_DIRECTORY, (tsStagingDirectory) =>
    replaceDirectory(RUST_ABI_DIRECTORY, (rustStagingDirectory) =>
      generateABIs(tsStagingDirectory, rustStagingDirectory),
    ),
  );
}

if (require.main === module) {
  replaceGeneratedABIs();
}
