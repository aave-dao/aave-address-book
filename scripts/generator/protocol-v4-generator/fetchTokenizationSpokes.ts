import {Client, Hex, getAddress} from 'viem';
import {multicall} from 'viem/actions';
import {ITokenizationSpokeV4_ABI} from 'src/ts/abis/ITokenizationSpokeV4';
import {FetchedHubAsset} from 'scripts/generator/protocol-v4-generator/fetchHubAssets';

function toTitleCase(str: string): string {
  return str
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function normalizeForMatch(str: string): string {
  return str.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export async function fetchTokenizationSpokes(
  client: Client,
  hubAddress: Hex,
  hubName: string,
  assets: FetchedHubAsset[],
  spokesByAssetId: Map<number, Hex[]>,
  knownNonTokenizationSpokes: Set<string>,
): Promise<Map<number, Hex>> {
  const hub = getAddress(hubAddress);
  const results = new Map<number, Hex>();
  const hubLabel = toTitleCase(hubName);

  type CandidateTask = {asset: FetchedHubAsset; candidate: Hex};
  const pendingCandidates: CandidateTask[] = [];

  for (const asset of assets) {
    const spokeAddresses = spokesByAssetId.get(asset.assetId)!;
    const candidates = spokeAddresses.filter(
      (addr) =>
        !knownNonTokenizationSpokes.has(addr.toLowerCase()) &&
        addr.toLowerCase() !== asset.feeReceiver.toLowerCase(),
    );

    for (const candidate of candidates) {
      pendingCandidates.push({asset, candidate});
    }
  }

  if (pendingCandidates.length > 0) {
    const validationContracts = pendingCandidates.flatMap(({candidate}) => [
      {address: candidate, abi: ITokenizationSpokeV4_ABI, functionName: 'hub'} as const,
      {address: candidate, abi: ITokenizationSpokeV4_ABI, functionName: 'assetId'} as const,
      {address: candidate, abi: ITokenizationSpokeV4_ABI, functionName: 'name'} as const,
    ]);

    const validationResults = await multicall(client, {
      allowFailure: true,
      contracts: validationContracts,
    });

    // Using TokenizationSpoke name against Hub label and asset symbol for verification, can be replaced by
    // a more robust method in the future.
    for (let i = 0; i < pendingCandidates.length; i++) {
      const {asset, candidate} = pendingCandidates[i];
      if (results.has(asset.assetId)) continue;
      const hubRes = validationResults[i * 3];
      const assetIdRes = validationResults[i * 3 + 1];
      const nameRes = validationResults[i * 3 + 2];
      if (
        hubRes.status !== 'success' ||
        assetIdRes.status !== 'success' ||
        nameRes.status !== 'success'
      ) {
        continue;
      }
      const hubAddr = hubRes.result as Hex;
      const assetIdVal = assetIdRes.result as bigint;
      const normalizedName = normalizeForMatch(nameRes.result as string);
      if (
        hubAddr.toLowerCase() === hub.toLowerCase() &&
        Number(assetIdVal) === asset.assetId &&
        normalizedName.includes(normalizeForMatch(asset.symbol)) &&
        normalizedName.includes(normalizeForMatch(hubLabel))
      ) {
        results.set(asset.assetId, getAddress(candidate));
      }
    }
  }

  // A lone candidate failing validation is an unregistered regular spoke; it stays in ALL_SPOKES_RAW.
  const candidateCounts = new Map<number, number>();
  for (const {asset} of pendingCandidates) {
    candidateCounts.set(asset.assetId, (candidateCounts.get(asset.assetId) ?? 0) + 1);
  }
  for (const {asset} of pendingCandidates) {
    if (!results.has(asset.assetId) && candidateCounts.get(asset.assetId)! > 1) {
      throw new Error(
        `Could not identify tokenization spoke for asset ${asset.symbol} (id=${asset.assetId}) on hub ${hubAddress}`,
      );
    }
  }

  return results;
}
