// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IGovernanceCore {
  type State is uint8;

  struct Proposal {
    State state;
    PayloadsControllerUtils.AccessControl accessLevel;
    uint40 creationTime;
    uint24 votingDuration;
    uint40 votingActivationTime;
    uint40 queuingTime;
    uint40 cancelTimestamp;
    address creator;
    address votingPortal;
    bytes32 snapshotBlockHash;
    bytes32 ipfsHash;
    uint128 forVotes;
    uint128 againstVotes;
    uint256 cancellationFee;
    PayloadsControllerUtils.Payload[] payloads;
  }

  struct VotingConfig {
    uint24 coolDownBeforeVotingStart;
    uint24 votingDuration;
    uint56 yesThreshold;
    uint56 yesNoDifferential;
    uint56 minPropositionPower;
  }
}

library PayloadsControllerUtils {
  type AccessControl is uint8;

  struct Payload {
    uint256 chain;
    AccessControl accessLevel;
    address payloadsController;
    uint40 payloadId;
  }
}

interface IGovernanceDataHelper {
  struct Constants {
    VotingConfig[] votingConfigs;
    uint256 precisionDivider;
    uint256 cooldownPeriod;
    uint256 expirationTime;
    uint256 cancellationFee;
  }

  struct Proposal {
    uint256 id;
    uint256 votingChainId;
    IGovernanceCore.Proposal proposalData;
  }

  struct Representatives {
    uint256 chainId;
    address representative;
  }

  struct Represented {
    uint256 chainId;
    address[] votersRepresented;
  }

  struct VotingConfig {
    PayloadsControllerUtils.AccessControl accessLevel;
    IGovernanceCore.VotingConfig config;
  }

  function getConstants(
    address govCore,
    PayloadsControllerUtils.AccessControl[] memory accessLevels
  ) external view returns (Constants memory);
  function getProposalsData(
    address govCore,
    uint256 from,
    uint256 to,
    uint256 pageSize
  ) external view returns (Proposal[] memory);
  function getRepresentationData(
    address govCore,
    address wallet,
    uint256[] memory chainIds
  ) external view returns (Representatives[] memory, Represented[] memory);
}
