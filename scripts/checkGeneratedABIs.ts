import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {ABI_DIRECTORY, generateABIs} from 'scripts/generateABIs';
import {RUST_ABI_DIRECTORY, diffDirectories} from 'scripts/generator/rust';

const generatedDirectory = mkdtempSync(join(tmpdir(), 'aave-address-book-abis-'));
const tsDirectory = join(generatedDirectory, 'ts');
const rustDirectory = join(generatedDirectory, 'rust');

async function checkGeneratedABIs() {
  try {
    await generateABIs(tsDirectory, rustDirectory);
    execFileSync('npx', [
      'prettier',
      '--config',
      '.prettierrc',
      '--write',
      join(tsDirectory, '*.ts'),
    ]);

    const differences = [
      ...diffDirectories(ABI_DIRECTORY, tsDirectory).map((file) => join(ABI_DIRECTORY, file)),
      ...diffDirectories(RUST_ABI_DIRECTORY, rustDirectory).map((file) =>
        join(RUST_ABI_DIRECTORY, file),
      ),
    ];

    if (differences.length) {
      throw new Error(`Generated ABIs are out of sync: ${differences.join(', ')}`);
    }
  } finally {
    rmSync(generatedDirectory, {recursive: true, force: true});
  }
}

checkGeneratedABIs();
