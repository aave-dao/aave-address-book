import {ChainId} from '@aave-dao/toolbox';
import {describe, expect, it} from 'vitest';
import {flattenedAddresses} from 'ui/src/utils/getAddresses';
import {getAddress, getContract, Hex, PublicClient} from 'viem';
import {getCode} from 'viem/actions';
import {getClient} from 'scripts/clients';

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
      // real bytecode means an ordinary contract; empty code must still fail the factory check
      if (code && code !== '0xef') continue;
      b20Count++;
      if (!(await factory.read.isB20Initialized([value as Hex]))) notRegistered.push(value);
    }

    // fails if detection silently matches nothing
    expect(b20Count).toBeGreaterThan(0);
    expect(notRegistered).toEqual([]);
  });
});
