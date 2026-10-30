// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IDataWarehouse} from '../governance-v3/IDataWarehouse.sol';
import {IVotingMachineWithProofs} from '../governance-v3/IVotingMachineWithProofs.sol';
import {IVotingStrategy} from '../governance-v3/IVotingStrategy.sol';

interface IVotingMachineDataHelper {
  struct InitialProposal {
    uint256 id;
    bytes32 snapshotBlockHash;
  }

  struct Proposal {
    IVotingMachineWithProofs.ProposalWithoutVotes proposalData;
    VotedInfo votedInfo;
    IVotingStrategy strategy;
    IDataWarehouse dataWarehouse;
    address[] votingAssets;
    bool hasRequiredRoots;
    IVotingMachineWithProofs.ProposalVoteConfiguration voteConfig;
    IVotingMachineWithProofs.ProposalState state;
  }

  struct VotedInfo {
    bool support;
    uint248 votingPower;
  }

  function getProposalsData(
    IVotingMachineWithProofs votingMachine,
    InitialProposal[] memory initialProposals,
    address user
  ) external view returns (Proposal[] memory);
}
