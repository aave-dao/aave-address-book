import {writeFileSync} from 'node:fs';
import {basename, join} from 'node:path';
import {RUST_GENERATED_WARNING, toRustModuleName} from 'scripts/generator/rust';

/**
 * @dev Interfaces alloy's `sol!` cannot expand, and why. They stay TypeScript-only.
 */
export const RUST_UNSUPPORTED_ABIS: Record<string, string> = {
  // `AggregatedReserveData` has 54 fields; alloy implements `SolType` for tuples of up to 24.
  IUiPoolDataProvider: 'a struct with more than 24 fields',
};

/**
 * @dev `sol!` must see the Solidity contract name: structs in the ABI are qualified with it
 * (`struct ISpoke.Reserve`), and a different interface name splits them from their own types.
 */
function solidityContractName(target: string) {
  const [path, contractName] = target.split(':');
  return contractName ?? basename(path, '.sol');
}

/**
 * @dev Writes each ABI as JSON next to a `mod.rs` that turns it into alloy bindings with `sol!`.
 * Every interface gets its own module because interfaces share struct and library names.
 */
export function writeRustABIs(
  outputDirectory: string,
  abis: {name: string; target: string; abi: unknown}[],
) {
  const modules: string[] = [];

  for (const {name, target, abi} of abis) {
    if (name in RUST_UNSUPPORTED_ABIS) continue;

    writeFileSync(join(outputDirectory, `${name}.json`), `${JSON.stringify(abi, null, 2)}\n`);
    const moduleName = toRustModuleName(name);
    const contractName = solidityContractName(target);
    const reexport = contractName === name ? name : `${contractName} as ${name}`;
    // `sol!` reads its own attributes before `cfg_attr` is expanded, hence two invocations.
    modules.push(`#[rustfmt::skip]
pub mod ${moduleName} {
    #[cfg(feature = "rpc")]
    alloy_sol_types::sol!(
        #[allow(missing_docs, clippy::all)]
        #[sol(rpc)]
        ${contractName},
        "src/abis/${name}.json"
    );
    #[cfg(not(feature = "rpc"))]
    alloy_sol_types::sol!(
        #[allow(missing_docs, clippy::all)]
        ${contractName},
        "src/abis/${name}.json"
    );
}
pub use ${moduleName}::${reexport};
`);
  }

  writeFileSync(
    join(outputDirectory, 'mod.rs'),
    `${RUST_GENERATED_WARNING}//! Alloy bindings for the interfaces listed in \`scripts/configs/abis.ts\`.
//!
//! The JSON next to this file is the same Forge output the TypeScript ABIs are generated from.
//! Not generated, because \`sol!\` cannot expand them: ${Object.entries(RUST_UNSUPPORTED_ABIS)
      .map(([name, reason]) => `\`${name}\` (${reason})`)
      .join(', ')}.

${modules.join('\n')}`,
  );
}
