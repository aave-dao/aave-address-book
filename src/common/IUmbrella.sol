// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IUmbrella {
  error AccessControlBadConfirmation();
  error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
  error CannotSlash();
  error ConfigurationHasNotBeenSet();
  error ConfigurationNotExist();
  error EthTransferFailed();
  error InvalidInitialization();
  error InvalidLiquidationFee();
  error InvalidNumberOfDecimals();
  error InvalidOraclePrice();
  error InvalidReserve();
  error InvalidStakeToken();
  error NotImplemented();
  error NotInitializing();
  error OnlyRescueGuardian();
  error ReserveCoverageNotSetup();
  error ReserveIsConfigured();
  error SafeERC20FailedOperation(address token);
  error TooMuchDeficitOffsetReduction();
  error UmbrellaStakeAlreadySetForAnotherReserve();
  error ZeroAddress();
  error ZeroDeficitToCover();

  event DeficitOffsetChanged(address indexed reserve, uint256 newDeficitOffset);
  event DeficitOffsetCovered(address indexed reserve, uint256 amount);
  event ERC20Rescued(
    address indexed caller,
    address indexed token,
    address indexed to,
    uint256 amount
  );
  event Initialized(uint64 version);
  event NativeTokensRescued(address indexed caller, address indexed to, uint256 amount);
  event PendingDeficitChanged(address indexed reserve, uint256 newPendingDeficit);
  event PendingDeficitCovered(address indexed reserve, uint256 amount);
  event ReserveDeficitCovered(address indexed reserve, uint256 amount);
  event RoleAdminChanged(
    bytes32 indexed role,
    bytes32 indexed previousAdminRole,
    bytes32 indexed newAdminRole
  );
  event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
  event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
  event SlashingConfigurationChanged(
    address indexed reserve,
    address indexed umbrellaStake,
    uint256 liquidationFee,
    address umbrellaStakeUnderlyingOracle
  );
  event SlashingConfigurationRemoved(address indexed reserve, address indexed umbrellaStake);
  event StakeTokenSlashed(
    address indexed reserve,
    address indexed umbrellaStake,
    uint256 amount,
    uint256 fee
  );
  event UmbrellaStakeTokenCreated(
    address indexed umbrellaStake,
    address indexed underlying,
    string name,
    string symbol
  );

  function COVERAGE_MANAGER_ROLE() external view returns (bytes32);

  function DEFAULT_ADMIN_ROLE() external view returns (bytes32);

  function PAUSE_GUARDIAN_ROLE() external view returns (bytes32);

  function POOL() external view returns (address);

  function POOL_ADDRESSES_PROVIDER() external view returns (address);

  function RESCUE_GUARDIAN_ROLE() external view returns (bytes32);

  function SLASHED_FUNDS_RECIPIENT() external view returns (address);

  function SUPER_ADMIN() external view returns (address);

  function TRANSPARENT_PROXY_FACTORY() external view returns (address);

  function UMBRELLA_STAKE_TOKEN_IMPL() external view returns (address);

  function coverDeficitOffset(address reserve, uint256 amount) external returns (uint256);

  function coverPendingDeficit(address reserve, uint256 amount) external returns (uint256);

  function coverReserveDeficit(address reserve, uint256 amount) external returns (uint256);

  function createStakeTokens(
    IUmbrellaStkManager.StakeTokenSetup[] memory stakeSetups
  ) external returns (address[] memory);

  function emergencyEtherTransfer(address to, uint256 amount) external;

  function emergencyEtherTransferStk(address umbrellaStake, address to, uint256 amount) external;

  function emergencyTokenTransfer(address erc20Token, address to, uint256 amount) external;

  function emergencyTokenTransferStk(
    address umbrellaStake,
    address erc20Token,
    address to,
    uint256 amount
  ) external;

  function getDeficitOffset(address reserve) external view returns (uint256);

  function getPendingDeficit(address reserve) external view returns (uint256);

  function getReserveSlashingConfig(
    address reserve,
    address umbrellaStake
  ) external view returns (IUmbrellaConfiguration.SlashingConfig memory);

  function getReserveSlashingConfigs(
    address reserve
  ) external view returns (IUmbrellaConfiguration.SlashingConfig[] memory);

  function getRoleAdmin(bytes32 role) external view returns (bytes32);

  function getStakeTokenData(
    address umbrellaStake
  ) external view returns (IUmbrellaConfiguration.StakeTokenData memory);

  function getStkTokens() external view returns (address[] memory);

  function grantRole(bytes32 role, address account) external;

  function hasRole(bytes32 role, address account) external view returns (bool);

  function initialize(
    address pool,
    address governance,
    address slashedFundsRecipient,
    address umbrellaStakeTokenImpl,
    address transparentProxyFactory
  ) external;

  function isReserveSlashable(address reserve) external view returns (bool, uint256);

  function isUmbrellaStkToken(address umbrellaStake) external view returns (bool);

  function latestUnderlyingAnswer(address umbrellaStake) external view returns (int256);

  function maxRescue(address) external pure returns (uint256);

  function pauseStk(address umbrellaStake) external;

  function predictStakeTokensAddresses(
    IUmbrellaStkManager.StakeTokenSetup[] memory stakeSetups
  ) external view returns (address[] memory);

  function removeSlashingConfigs(
    IUmbrellaConfiguration.SlashingConfigRemoval[] memory removalPairs
  ) external;

  function renounceRole(bytes32 role, address callerConfirmation) external;

  function revokeRole(bytes32 role, address account) external;

  function setCooldownStk(IUmbrellaStkManager.CooldownConfig[] memory cooldownConfigs) external;

  function setDeficitOffset(address reserve, uint256 newDeficitOffset) external;

  function setUnstakeWindowStk(
    IUmbrellaStkManager.UnstakeWindowConfig[] memory unstakeWindowConfigs
  ) external;

  function slash(address reserve) external returns (uint256);

  function supportsInterface(bytes4 interfaceId) external view returns (bool);

  function tokenForDeficitCoverage(address reserve) external view returns (address);

  function unpauseStk(address umbrellaStake) external;

  function updateSlashingConfigs(
    IUmbrellaConfiguration.SlashingConfigUpdate[] memory slashingConfigs
  ) external;
}

interface IUmbrellaConfiguration {
  struct SlashingConfig {
    address umbrellaStake;
    address umbrellaStakeUnderlyingOracle;
    uint256 liquidationFee;
  }

  struct SlashingConfigRemoval {
    address reserve;
    address umbrellaStake;
  }

  struct SlashingConfigUpdate {
    address reserve;
    address umbrellaStake;
    uint256 liquidationFee;
    address umbrellaStakeUnderlyingOracle;
  }

  struct StakeTokenData {
    address underlyingOracle;
    address reserve;
  }
}

interface IUmbrellaStkManager {
  struct CooldownConfig {
    address umbrellaStake;
    uint256 newCooldown;
  }

  struct StakeTokenSetup {
    address underlying;
    uint256 cooldown;
    uint256 unstakeWindow;
    string suffix;
  }

  struct UnstakeWindowConfig {
    address umbrellaStake;
    uint256 newUnstakeWindow;
  }
}
