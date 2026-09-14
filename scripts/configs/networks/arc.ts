import {ChainId} from '@aave-dao/toolbox';
import {NetworkAddresses} from 'scripts/configs/types';

export const arcAddresses: NetworkAddresses = {
  name: 'Arc',
  chainId: ChainId.arc,
  addresses: {
    TRANSPARENT_PROXY_FACTORY: '0xEB0682d148e874553008730f0686ea89db7DA412',
    // There is no V3 market on Arc; the provider and ACL manager exist only so the
    // CAPO price adapters have an `IACLManager` to check their admin roles against.
    POOL_ADDRESSES_PROVIDER: '0xf74284E5aeDC3AD57CD2Fa2461bf2E1762422a12',
    ACL_MANAGER: '0x4d4B307857eFff79E786923F2A277ea298E88aEA',
    V4_SECURITY_COUNCIL: '0x187AAE17d4931310B3fc75743e7F16Bdc9eD77e9',
    V4_SECURITY_COUNCIL_EXECUTOR: '0x8e79b0541122d3822eC93082cEB1ab03EDBc1Fd5',
  },
};
