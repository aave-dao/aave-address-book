import {HttpTransportConfig} from 'viem';
import {getClient as rpcEnvGetClient} from '@aave-dao/toolbox';

// backoff absorbs provider CU/s throttling when sanity tests fire concurrently
const commonConfig: HttpTransportConfig = {
  timeout: 30_000,
  batch: true,
  retryCount: 5,
  retryDelay: 500,
};
const batchConfig = {batch: {multicall: true}};

export function getClient(chainId: number) {
  return rpcEnvGetClient(chainId, {
    clientConfig: batchConfig,
    httpConfig: commonConfig,
    providerConfig: {
      alchemyKey: process.env.ALCHEMY_API_KEY,
      quicknodeEndpointName: process.env.QUICKNODE_ENDPOINT_NAME,
      quicknodeToken: process.env.QUICKNODE_TOKEN,
    },
  });
}
