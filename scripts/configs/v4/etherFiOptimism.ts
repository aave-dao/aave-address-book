import {ChainId} from '@aave-dao/toolbox';
import {V4Config} from 'scripts/configs/types';

export const etherFiOptimismWhitelabelV4Config: V4Config = {
  name: 'EtherFiOptimismWhitelabel',
  chainId: ChainId.optimism,
  admin: {
    ACCESS_MANAGER: '0x188d7173772499FB6375F23FdFd130CE6107286b',
    HUB_CONFIGURATOR: '0xA39bEf2fD611fb9c5a69D63277b4Af97a30F0dbC',
    SPOKE_CONFIGURATOR: '0xFEe9E8cCE1c40D3bd9F025437D3A11cA0DAe9f8b',
    TREASURY_SPOKE: '0x7EB4d25F137868662350603A2863F682287b0768',
    CONFIG_ENGINE: '0x84210b3087E952Be0f3610fD75f0f045995eAF22',
  },
  hubs: {
    CASH: '0x66753c4e3fC84f1eD0e3C267C927284E9d90C572',
  },
  spokes: {
    CASH: '0xdffcC3536D932eb51Df51a7F5FA407c4270d5308',
  },
  positionManagers: {
    LEND_GATEWAY: '0x01F8cDFb1694eA8fE4ED6c38a0fD78d1188E03F4',
  },
  externalLibraries: {
    LIQUIDATION_LOGIC: '0x88dF535473C5adf1f57789734A05E555F7Deb8DB',
  },
};
