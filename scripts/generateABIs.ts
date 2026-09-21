import {execFile} from 'node:child_process';
import {mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {promisify} from 'node:util';
import {prefixWithGeneratedWarning} from 'scripts/generator/utils';
import {generateABIImports} from 'scripts/generator/abis';
import {ABI_INTERFACES} from 'scripts/configs/abis';

const awaitableExecFile = promisify(execFile);
const ABI_DIRECTORY = './src/ts/abis';

export async function generateABIs(outputDirectory: string) {
  mkdirSync(outputDirectory, {recursive: true});

  for (const {name, target} of ABI_INTERFACES) {
    const {stdout} = await awaitableExecFile('forge', ['inspect', '--json', target, 'abi']);
    const varName = `${name}_ABI`;
    writeFileSync(
      join(outputDirectory, `${name}.ts`),
      prefixWithGeneratedWarning(
        `export const ${varName} = ${JSON.stringify(JSON.parse(stdout.trim()), null, 2)} as const;`,
      ),
    );
  }

  writeFileSync(join(outputDirectory, 'index.ts'), `${generateABIImports().join('\n')}\n`);
}

async function replaceGeneratedABIs() {
  mkdirSync(dirname(ABI_DIRECTORY), {recursive: true});
  const stagingDirectory = mkdtempSync(join(dirname(ABI_DIRECTORY), '.abis-'));

  try {
    await generateABIs(stagingDirectory);
    rmSync(ABI_DIRECTORY, {recursive: true, force: true});
    renameSync(stagingDirectory, ABI_DIRECTORY);
  } catch (error) {
    rmSync(stagingDirectory, {recursive: true, force: true});
    throw error;
  }
}

if (require.main === module) {
  replaceGeneratedABIs();
}
