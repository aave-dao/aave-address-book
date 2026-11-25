import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {ChainList} from '@aave-dao/toolbox';
import {getAddress} from 'viem';
import * as AddressBook from 'src/ts/AaveAddressBook';
import {
  RUST_ADDRESSES_DIRECTORY,
  RUST_GENERATED_WARNING,
  replaceDirectory,
  toRustIdent,
  toRustString,
} from 'scripts/generator/rust';

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
const INDENT = '    ';

function isAddress(value: unknown): value is string {
  return typeof value === 'string' && ADDRESS_REGEX.test(value);
}

function explorerLink(chainId: number | undefined, address: string) {
  const url = chainId ? ChainList[chainId]?.blockExplorers?.default.url : undefined;
  return url ? `/// ${url.replace(/\/$/, '')}/address/${address}\n` : '';
}

function rustIdents(path: string, keys: string[]) {
  const idents = keys.map(toRustIdent);
  const seen = new Map<string, string>();
  idents.forEach((ident, i) => {
    if (seen.has(ident)) {
      throw new Error(`${path}: "${seen.get(ident)}" and "${keys[i]}" both map to \`${ident}\``);
    }
    seen.set(ident, keys[i]);
  });
  return idents;
}

function rustItem(
  path: string,
  ident: string,
  value: unknown,
  chainId?: number,
  depth = 0,
): string {
  const indent = INDENT.repeat(depth);

  if (isAddress(value)) {
    const address = getAddress(value);
    const link = explorerLink(chainId, address);
    const doc = link ? `${indent}${link}` : '';
    return `${doc}${indent}pub const ${ident}: Address = address!("${address}");\n`;
  }
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`${path}: ${value} is not an unsigned integer`);
    }
    return `${indent}pub const ${ident}: u64 = ${value};\n`;
  }
  if (typeof value === 'string') {
    return `${indent}pub const ${ident}: &str = ${toRustString(value)};\n`;
  }
  if (Array.isArray(value)) {
    const nonAddress = value.find((element) => !isAddress(element));
    if (nonAddress !== undefined) {
      throw new Error(`${path}: only address arrays are supported, found ${nonAddress}`);
    }
    const elements = value.map(
      (element) => `${indent}${INDENT}address!("${getAddress(element)}"),\n`,
    );
    return `${indent}pub const ${ident}: &[Address] = &[\n${elements.join('')}${indent}];\n`;
  }
  if (value && typeof value === 'object') {
    return `${indent}pub mod ${ident} {\n${rustModuleBody(path, value, chainId, depth + 1)}${indent}}\n`;
  }
  throw new Error(`${path}: unsupported value ${String(value)}`);
}

function rustModuleBody(path: string, values: object, chainId?: number, depth = 0) {
  const entries = Object.entries(values);
  const idents = rustIdents(
    path,
    entries.map(([key]) => key),
  );
  const items = entries.map(([key, value], i) =>
    rustItem(`${path}.${key}`, idents[i], value, chainId, depth),
  );
  const imports = `${INDENT.repeat(depth)}#[allow(unused_imports)]\n${INDENT.repeat(depth)}use alloy_primitives::{address, Address};\n`;
  return [imports, ...items].join('\n');
}

/**
 * @dev Emits one Rust module per address book module, from the generated TypeScript address book.
 * Run this after `generate:addresses`; it needs no RPC access.
 */
export function generateRustAddresses(outputDirectory: string) {
  const moduleNames = Object.keys(AddressBook).sort();
  const idents = rustIdents('AaveAddressBook', moduleNames);

  moduleNames.forEach((name, i) => {
    const values = (AddressBook as Record<string, Record<string, unknown>>)[name];
    const chainId = typeof values.CHAIN_ID === 'number' ? values.CHAIN_ID : undefined;
    writeFileSync(
      join(outputDirectory, `${idents[i]}.rs`),
      `${RUST_GENERATED_WARNING}${rustModuleBody(name, values, chainId)}`,
    );
  });

  writeFileSync(
    join(outputDirectory, 'mod.rs'),
    `${RUST_GENERATED_WARNING}//! Addresses, mirrored from the generated TypeScript address book.

${idents.map((ident) => `#[rustfmt::skip]\npub mod ${ident};\n`).join('')}`,
  );
}

if (require.main === module) {
  replaceDirectory(RUST_ADDRESSES_DIRECTORY, generateRustAddresses);
}
