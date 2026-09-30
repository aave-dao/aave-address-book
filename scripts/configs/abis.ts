/**
 * @dev A Solidity interface compiled by Forge into a TypeScript ABI.
 */
export type AbiInterface = {name: string; target: string};

/**
 * @dev Solidity is authoritative for every entry in this list. `generate:abis` compiles each target
 * and writes its TypeScript ABI to `src/ts/abis`.
 */
export const ABI_INTERFACES: AbiInterface[] = [
  {name: 'ICollector', target: 'lib/aave-v3-origin/src/contracts/treasury/ICollector.sol'},
  {
    name: 'IAaveV3ConfigEngine',
    target: 'lib/aave-v3-origin/src/contracts/extensions/v3-config-engine/IAaveV3ConfigEngine.sol',
  },
  {
    name: 'IVotingMachineWithProofs',
    target: 'src/governance-v3/IVotingMachineWithProofs.sol:IVotingMachineWithProofs',
  },
  {name: 'IVotingStrategy', target: 'src/governance-v3/IVotingStrategy.sol:IVotingStrategy'},
  {name: 'IVotingPortal', target: 'src/governance-v3/IVotingPortal.sol:IVotingPortal'},
  {
    name: 'IGovernancePowerStrategy',
    target: 'src/governance-v3/IGovernancePowerStrategy.sol:IGovernancePowerStrategy',
  },
  {name: 'IDataWarehouse', target: 'src/governance-v3/IDataWarehouse.sol:IDataWarehouse'},
  {
    name: 'IExecutorWithTimelock',
    target: 'src/common/IExecutorWithTimelock.sol:IExecutorWithTimelock',
  },
  {name: 'IAToken', target: 'lib/aave-v3-origin/src/contracts/interfaces/IAToken.sol'},
  {name: 'IExecutor', target: 'src/governance-v3/IExecutor.sol:IExecutor'},
  {
    name: 'ICrossChainController',
    target: 'src/common/ICrossChainController.sol:ICrossChainController',
  },
  {
    name: 'IWithGuardian',
    target:
      'lib/aave-v3-origin/lib/solidity-utils/src/contracts/access-control/interfaces/IWithGuardian.sol',
  },
  {
    name: 'IRescuable',
    target: 'lib/aave-v3-origin/lib/solidity-utils/src/contracts/utils/interfaces/IRescuable.sol',
  },
  {name: 'IACLManager', target: 'lib/aave-v3-origin/src/contracts/interfaces/IACLManager.sol'},
  {name: 'ILendingPool', target: 'src/AaveV2.sol:ILendingPool'},
  {
    name: 'ILendingPoolAddressesProvider',
    target: 'src/AaveV2.sol:ILendingPoolAddressesProvider',
  },
  {
    name: 'ILendingPoolConfigurator',
    target: 'src/AaveV2.sol:ILendingPoolConfigurator',
  },
  {name: 'IStakeToken', target: 'src/common/IStakeToken.sol:IStakeToken'},
  {name: 'IHubV4', target: 'lib/aave-v4/src/hub/interfaces/IHub.sol'},
  {name: 'ISpokeV4', target: 'lib/aave-v4/src/spoke/interfaces/ISpoke.sol'},
  {
    name: 'ITokenizationSpokeV4',
    target: 'lib/aave-v4/src/spoke/interfaces/ITokenizationSpoke.sol',
  },
  {
    name: 'IAaveOracleV4',
    target: 'lib/aave-v4/src/spoke/interfaces/IAaveOracle.sol',
  },
  {
    name: 'IHubConfigurator',
    target: 'lib/aave-v4/src/hub/interfaces/IHubConfigurator.sol',
  },
  {
    name: 'ISpokeConfigurator',
    target: 'lib/aave-v4/src/spoke/interfaces/ISpokeConfigurator.sol',
  },
  {
    name: 'IAaveV4ConfigEngine',
    target: 'lib/aave-v4/src/config-engine/interfaces/IAaveV4ConfigEngine.sol',
  },
  {
    name: 'IGiverPositionManager',
    target: 'lib/aave-v4/src/position-manager/interfaces/IGiverPositionManager.sol',
  },
  {
    name: 'ITakerPositionManager',
    target: 'lib/aave-v4/src/position-manager/interfaces/ITakerPositionManager.sol',
  },
  {
    name: 'IConfigPositionManager',
    target: 'lib/aave-v4/src/position-manager/interfaces/IConfigPositionManager.sol',
  },
  {
    name: 'INativeTokenGateway',
    target: 'lib/aave-v4/src/position-manager/interfaces/INativeTokenGateway.sol',
  },
  {
    name: 'ISignatureGateway',
    target: 'lib/aave-v4/src/position-manager/interfaces/ISignatureGateway.sol',
  },
  {
    name: 'IAccessManagerEnumerable',
    target: 'lib/aave-v4/src/access/interfaces/IAccessManagerEnumerable.sol',
  },
  {
    name: 'AggregatorInterface',
    target: 'src/interfaces/AggregatorInterface.sol:AggregatorInterface',
  },
  {
    name: 'IATokenWithDelegation',
    target: 'src/interfaces/IATokenWithDelegation.sol:IATokenWithDelegation',
  },
  {
    name: 'IAaveOracle',
    target: 'lib/aave-v3-origin/src/contracts/interfaces/IAaveOracle.sol',
  },
  {name: 'IAaveToken', target: 'src/interfaces/IAaveToken.sol:IAaveToken'},
  {
    name: 'IDefaultInterestRateStrategy',
    target: 'src/AaveV2.sol:IDefaultInterestRateStrategy',
  },
  {
    name: 'IERC20',
    target: 'src/interfaces/IERC20.sol:IERC20',
  },
  {
    name: 'IERC20Detailed',
    target: 'src/interfaces/IERC20Detailed.sol:IERC20Detailed',
  },
  {
    name: 'IGovernanceCore',
    target: 'src/governance-v3/IGovernanceCore.sol:IGovernanceCore',
  },
  {
    name: 'IGovernanceDataHelper',
    target: 'src/interfaces/IGovernanceDataHelper.sol:IGovernanceDataHelper',
  },
  {
    name: 'IMetaDelegateHelper',
    target: 'src/interfaces/IMetaDelegateHelper.sol:IMetaDelegateHelper',
  },
  {name: 'IOwnable', target: 'src/common/IOwnable.sol:IOwnable'},
  {
    name: 'IPayloadsControllerCore',
    target: 'src/governance-v3/IPayloadsControllerCore.sol:IPayloadsControllerCore',
  },
  {
    name: 'IPayloadsControllerDataHelper',
    target: 'src/interfaces/IPayloadsControllerDataHelper.sol:IPayloadsControllerDataHelper',
  },
  {name: 'IPool', target: 'src/interfaces/IPool.sol:IPool'},
  {
    name: 'IPoolAddressesProvider',
    target: 'lib/aave-v3-origin/src/contracts/interfaces/IPoolAddressesProvider.sol',
  },
  {
    name: 'IPoolConfigurator',
    target: 'src/interfaces/IPoolConfigurator.sol:IPoolConfigurator',
  },
  {
    name: 'IRewardsController',
    target: 'lib/aave-v3-origin/src/contracts/rewards/interfaces/IRewardsController.sol',
  },
  {name: 'IRiskSteward', target: 'src/interfaces/IRiskSteward.sol:IRiskSteward'},
  {
    name: 'IStataTokenFactory',
    target:
      'lib/aave-v3-origin/src/contracts/extensions/stata-token/interfaces/IStataTokenFactory.sol',
  },
  {
    name: 'IStataTokenV2',
    target: 'lib/aave-v3-origin/src/contracts/extensions/stata-token/interfaces/IStataTokenV2.sol',
  },
  {
    name: 'IStaticATokenFactory',
    target: 'src/interfaces/IStaticATokenFactory.sol:IStaticATokenFactory',
  },
  {
    name: 'IStaticATokenLM',
    target: 'src/interfaces/IStaticATokenLM.sol:IStaticATokenLM',
  },
  {name: 'IStkAaveToken', target: 'src/interfaces/IStkAaveToken.sol:IStkAaveToken'},
  {
    name: 'IUiPoolDataProvider',
    target: 'src/interfaces/IUiPoolDataProvider.sol:IUiPoolDataProvider',
  },
  {name: 'IUmbrella', target: 'src/common/IUmbrella.sol:IUmbrella'},
  {
    name: 'IUmbrellaRewardsController',
    target: 'src/interfaces/IUmbrellaRewardsController.sol:IUmbrellaRewardsController',
  },
  {
    name: 'IUmbrellaStakeToken',
    target: 'src/interfaces/IUmbrellaStakeToken.sol:IUmbrellaStakeToken',
  },
  {
    name: 'IVotingMachineDataHelper',
    target: 'src/interfaces/IVotingMachineDataHelper.sol:IVotingMachineDataHelper',
  },
  {
    name: 'IWrappedTokenGatewayV3',
    target: 'lib/aave-v3-origin/src/contracts/helpers/interfaces/IWrappedTokenGatewayV3.sol',
  },
];
