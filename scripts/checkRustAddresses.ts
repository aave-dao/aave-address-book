import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateRustAddresses} from 'scripts/generateRustAddresses';
import {RUST_ADDRESSES_DIRECTORY, diffDirectories} from 'scripts/generator/rust';

const generatedDirectory = mkdtempSync(join(tmpdir(), 'aave-address-book-rust-'));

try {
  generateRustAddresses(generatedDirectory);
  const differences = diffDirectories(RUST_ADDRESSES_DIRECTORY, generatedDirectory);
  if (differences.length) {
    throw new Error(
      `Generated Rust addresses are out of sync, run \`npm run generate:rust\`: ${differences.join(', ')}`,
    );
  }
} finally {
  rmSync(generatedDirectory, {recursive: true, force: true});
}
