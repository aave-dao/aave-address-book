import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateABIs} from 'scripts/generateABIs';

const ABI_DIRECTORY = './src/ts/abis';
const generatedDirectory = mkdtempSync(join(tmpdir(), 'aave-address-book-abis-'));

async function checkGeneratedABIs() {
  try {
    await generateABIs(generatedDirectory);
    execFileSync('npx', [
      'prettier',
      '--config',
      '.prettierrc',
      '--write',
      join(generatedDirectory, '*.ts'),
    ]);

    const currentFiles = readdirSync(ABI_DIRECTORY).sort();
    const generatedFiles = readdirSync(generatedDirectory).sort();
    const changedFiles = generatedFiles.filter(
      (file) =>
        !currentFiles.includes(file) ||
        readFileSync(join(ABI_DIRECTORY, file), 'utf8') !==
          readFileSync(join(generatedDirectory, file), 'utf8'),
    );
    const extraFiles = currentFiles.filter((file) => !generatedFiles.includes(file));
    const differences = [...changedFiles, ...extraFiles];

    if (differences.length) {
      throw new Error(
        `Generated TypeScript ABIs are out of sync: ${differences.sort().join(', ')}`,
      );
    }
  } finally {
    rmSync(generatedDirectory, {recursive: true, force: true});
  }
}

checkGeneratedABIs();
