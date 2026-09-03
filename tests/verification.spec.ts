import {ChainId, ChainList, getExplorer, getSourceCode} from '@aave-dao/toolbox';
import {describe, expect, it} from 'vitest';
import {flattenedAddresses, ListItem} from 'ui/src/utils/getAddresses';
import verified from 'tests/cache/verified.json';
import {writeFileSync} from 'fs';
import {Address, Hex, PublicClient, zeroAddress} from 'viem';
import {getCode} from 'viem/actions';
import {getClient} from 'scripts/clients';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY as string;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkProxyVerification(item: ListItem, guid: string) {
  const params = {
    chainId: String(item.chainId),
    apikey: ETHERSCAN_API_KEY,
    module: 'contract',
    action: 'checkproxyverification',
    guid,
  };
  const formattedParams = new URLSearchParams(params).toString();
  const url = `${getApiUrl(item.chainId)}?${formattedParams}`;
  try {
    const request = await fetch(url);
    const {status} = await request.json();
    if (status === '1')
      console.log(
        'successfully verified proxy. Please rerun the script in a few minutes as you need to wait till etherscan prunes its cache.',
      );
  } catch (e) {}
}

async function verifyProxy(item: ListItem) {
  const params = {
    chainId: String(item.chainId),
    apikey: ETHERSCAN_API_KEY,
    module: 'contract',
    action: 'verifyproxycontract',
  };
  const formattedParams = new URLSearchParams(params).toString();
  const url = `${getApiUrl(item.chainId)}?${formattedParams}`;
  try {
    const request = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams({
        address: item.value,
      }),
    });

    const {status, result} = await request.json();
    await sleep(200);
    if (status === '1') checkProxyVerification(item, result);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function checkVerified(item: ListItem) {
  try {
    await sleep(1000);
    const source = await getSourceCode({
      chainId: item.chainId,
      apiKey: process.env.ETHERSCAN_API_KEY,
      address: item.value as Address,
      apiUrl: getApiUrl(item.chainId),
    });
    if (!source.ContractName) {
      // etherscan returns proxy contracts as non verified if the proxy is not manually assigned
      // therefore we try to manually assign it
      if (['S_TOKEN', 'V_TOKEN', 'A_TOKEN'].includes(item.path[item.path.length - 1])) {
        await verifyProxy(item);
      }
    }
    return {status: '1', result: source};
  } catch (e) {
    // Etherscan V2 rejects chains not covered by the caller's API-key tier with
    // "Missing or unsupported chainid parameter". That is an env/credential
    // limitation, not a verification failure, so skip rather than flagging the
    // address as unverified.
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('unsupported chainid')) {
      console.warn(`skipping ${item.value} on chain ${item.chainId}: ${msg}`);
      return {status: 'skip', result: e};
    }
    console.error(e);
    return {status: '0', result: e};
  }
}

function getApiUrl(chainId: number) {
  if (chainId === ChainId.soneium) return `https://soneium.blockscout.com/api`;
  if (chainId === ChainId.bob) return `https://explorer.gobob.xyz/api`;
  if (chainId === ChainId.ink) return `https://explorer.inkonchain.com/api/`;
  if (chainId === ChainId.scroll) return `https://scroll.blockscout.com/api`;
  if (chainId === ChainId.xLayer) return `https://www.oklink.com/api`;
  return getExplorer(chainId).api;
}

const knownErrors = {
  1: {
    '0xD01ab9a6577E1D84F142e44D49380e23A340387d': true, // very old contracts we know will never be verified
    '0x9f336eB940730596548C342A8BF1fC530B10cc96': true, // PT_srUSDe_25JUN2026 oracle verified but not detecting
  },
  1101: {
    '0xF1c11BE0b4466728DDb7991A0Ac5265646ec9672': true, // very old contracts we know will never be verified
  },
  137: {
    '0x645654D59A5226CBab969b1f5431aA47CBf64ab8': true, // very old contracts we know will never be verified
  },
  43114: {
    '0x11979886A6dBAE27D7a72c49fCF3F23240D647bF': true, // very old contracts we know will never be verified
  },
  5000: {
    '0x14816fC7f443A9C834d30eeA64daD20C4f56fBCD': true, // gnosis safe, not sure why its not verified on etherscan (it is on routescan)
  },
  4326: {
    '0x8e7aadB7bBAb02Ad899A13FF9A75571A4866Bf04': true, // TODO: verification issue on blockscout megaETH for logic libs, fix before merging
    '0x1Fb8f7C906cddD28B42ae6Eb76abC04A91188635': true,
    '0x8dc095F287dBEBD9e15f75BB3DfBF18389BB8104': true,
    '0x25Ed699a052B820d772765E26Ed4dD9f0A26F3E5': true,
    '0x33654b16A4De97bCE05d7dD06803Bf1066f3123C': true,
    '0x72E831E28Ba5A6d55Eb752981D0426b411E4dbbF': true, // STATA_TOKEN WETH, not yet verified on explorer
    '0x3FBe2d59F93AD0e54077861E810B2868c544C333': true, // STATA_TOKEN BTCb, not yet verified on explorer
    '0x31552822e76a991CEB44dE047A26441E530D6510': true, // STATA_TOKEN USDT0, not yet verified on explorer
    '0x0a21f20c528B54Ab54573A21f948B242d19E3ef1': true, // STATA_TOKEN USDm, not yet verified on explorer
    '0x03A53f1FABC40D548198ECd79997600982B0a36E': true, // STATA_TOKEN wstETH, not yet verified on explorer
    '0xB955033Afc19816e83655C28461574D77b3097bb': true, // STATA_TOKEN USDe, not yet verified on explorer
  },
  9745: {
    '0x30559E3d35e33AB69399a3fe9F383d32bd3c016E': true, // PT_sUSDE_18JUN2026 verified but not detecting
    '0x23B17d3944742ACe3d0C71586FcB320d1e4a1Ed2': true, // PT_USDe_18JUN2026 verified but not detecting
  },
  196: {
    '0x64768bE1b925Eb04a2Caa2E1F9ffEC2f959cAC9c': true, // PT_USDG_29OCT2026 A_TOKEN, not yet verified on explorer
    '0x11f847ED85657cd066bfC3e9a5b29737aFb85c1E': true, // PT_USDG_29OCT2026 V_TOKEN, not yet verified on explorer
    '0x6052839E52ab454F164ee5668e5B523cF5A389Fc': true, // PT_USDG_29OCT2026 ORACLE, not yet verified on explorer
  },
};

describe('verification', {timeout: 500_000}, () => {
  it('should have all contracts verified except for the known set of errors', async () => {
    const addressesToCheck = flattenedAddresses.filter(
      (item) =>
        // arc has no public explorer api, its explorer sits behind cloudflare access
        ![ChainId.harmony, ChainId.fantom, ChainId.zksync, ChainId.arc].includes(
          item.chainId as any,
        ) &&
        !ChainList[item.chainId].testnet &&
        !knownErrors[item.chainId]?.[item.value] &&
        (!verified[item.chainId]?.[item.value] ||
          verified[item.chainId]?.[item.value] === zeroAddress),
    );
    const errors: {item: ListItem}[] = [];
    // unique set of addresses checked on this iteration
    // used to prevent double checking the same address
    const checked = new Set<string>();
    for (const item of addressesToCheck) {
      const hasBeenCheckedBefore = verified[item.chainId]?.[item.value];
      if (!hasBeenCheckedBefore && item.value !== zeroAddress) {
        const key = `${item.chainId}-${item.value}`;
        if (checked.has(key)) continue;
        checked.add(key);
        const client = getClient(item.chainId) as PublicClient;
        const hasCode = await getCode(client, {address: item.value as Hex});
        if (hasCode) {
          const {status, result} = (await checkVerified(item)) as {
            status: string;
            result: {ContractName: string};
          };
          if (status === 'skip') {
            continue;
          }
          if (status !== '1' || !result.ContractName) {
            errors.push({item});
            console.log(item.value, result);
          } else {
            if (!verified[item.chainId]) verified[item.chainId] = {};
            verified[item.chainId][item.value] = {
              name: result.ContractName,
            };
            writeFileSync('./tests/cache/verified.json', JSON.stringify(verified, null, 2), {
              encoding: 'utf-8',
            });
          }
        }
      }
    }
    expect(errors).toMatchSnapshot();
  });
});
