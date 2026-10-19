import {describe, it, expect} from 'vitest';
import {getContract} from 'viem';
import {getClient} from 'scripts/clients';
import {AaveSafetyModule, GhoEthereum} from 'src/ts/AaveAddressBook';
import {IStkAaveToken_ABI} from 'src/ts/abis/IStkAaveToken';

describe('stk gho migrator', () => {
  it('should hold the stkGHO claim helper role', async () => {
    const stkGho = getContract({
      abi: IStkAaveToken_ABI,
      address: AaveSafetyModule.STK_GHO,
      client: getClient(GhoEthereum.CHAIN_ID),
    });
    const claimHelperRole = await stkGho.read.CLAIM_HELPER_ROLE();
    expect(await stkGho.read.getAdmin([claimHelperRole])).toEqual(GhoEthereum.STK_GHO_MIGRATOR);
  });
});
