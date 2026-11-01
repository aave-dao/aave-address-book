import {ChainId} from '@aave-dao/toolbox';
import {describe, expect, it} from 'vitest';
import {flattenedAddresses} from 'ui/src/utils/getAddresses';
import {getAddress, getContract, Hex, PublicClient} from 'viem';
import {getCode} from 'viem/actions';
import {getClient} from 'scripts/clients';

// B20 tokenized equities on Base are native precompile tokens: their code is a single 0xef byte,
// so there is no source to verify (handled in verification.spec.ts). Instead we assert each one is
// registered and initialized on the B20 factory precompile, which is the authoritative source.
// https://docs.base.org/specifications/b20/reference/constants
const B20_FACTORY = getAddress('0xb20f000000000000000000000000000000000000');

const IB20Factory_ABI = [
  {
    type: 'function',
    name: 'isB20Initialized',
    stateMutability: 'view',
    inputs: [{name: 'token', type: 'address'}],
    outputs: [{name: '', type: 'bool'}],
  },
] as const;

describe('b20 tokenized equities', {timeout: 120_000}, () => {
  it('should be registered and initialized on the B20 factory', async () => {
    const client = getClient(ChainId.base) as PublicClient;
    const factory = getContract({abi: IB20Factory_ABI, address: B20_FACTORY, client});

    // candidates: unique Base addresses with the 0xb2 vanity prefix
    const candidates = [
      ...new Set(
        flattenedAddresses
          .filter(
            (item) => item.chainId === ChainId.base && item.value.toLowerCase().startsWith('0xb2'),
          )
          .map((item) => item.value),
      ),
    ];

    const notRegistered: string[] = [];
    let b20Count = 0;
    for (const value of candidates) {
      const code = await getCode(client, {address: value as Hex});
      // only addresses with the single 0xef byte are B20 native tokens
      if (code !== '0xef') continue;
      b20Count++;
      if (!(await factory.read.isB20Initialized([value as Hex]))) notRegistered.push(value);
    }

    // guard against the detection silently matching nothing
    expect(b20Count).toBeGreaterThan(0);
    expect(notRegistered).toEqual([]);
  });
});
