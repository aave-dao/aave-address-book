// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library ConfiguratorInputTypes {
  struct InitReserveInput {
    address aTokenImpl;
    address variableDebtTokenImpl;
    address underlyingAsset;
    string aTokenName;
    string aTokenSymbol;
    string variableDebtTokenName;
    string variableDebtTokenSymbol;
    bytes params;
    bytes interestRateData;
  }

  struct UpdateATokenInput {
    address asset;
    string name;
    string symbol;
    address implementation;
    bytes params;
  }

  struct UpdateDebtTokenInput {
    address asset;
    string name;
    string symbol;
    address implementation;
    bytes params;
  }
}

interface IPoolConfigurator {
  event ATokenUpgraded(
    address indexed asset,
    address indexed proxy,
    address indexed implementation
  );
  event AssetBorrowableInEModeChanged(address indexed asset, uint8 categoryId, bool borrowable);
  event AssetCollateralInEModeChanged(address indexed asset, uint8 categoryId, bool collateral);
  event AssetLtvzeroInEModeChanged(address indexed asset, uint8 categoryId, bool ltvzero);
  event BorrowCapChanged(address indexed asset, uint256 oldBorrowCap, uint256 newBorrowCap);
  event BorrowableInIsolationChanged(address asset, bool borrowable);
  event BridgeProtocolFeeUpdated(uint256 oldBridgeProtocolFee, uint256 newBridgeProtocolFee);
  event CollateralConfigurationChanged(
    address indexed asset,
    uint256 ltv,
    uint256 liquidationThreshold,
    uint256 liquidationBonus
  );
  event DebtCeilingChanged(address indexed asset, uint256 oldDebtCeiling, uint256 newDebtCeiling);
  event EModeCategoryAdded(
    uint8 indexed categoryId,
    uint256 ltv,
    uint256 liquidationThreshold,
    uint256 liquidationBonus,
    address oracle,
    string label
  );
  event FlashloanPremiumToProtocolUpdated(
    uint128 oldFlashloanPremiumToProtocol,
    uint128 newFlashloanPremiumToProtocol
  );
  event FlashloanPremiumTotalUpdated(
    uint128 oldFlashloanPremiumTotal,
    uint128 newFlashloanPremiumTotal
  );
  event LiquidationGracePeriodChanged(address indexed asset, uint40 gracePeriodUntil);
  event LiquidationGracePeriodDisabled(address indexed asset);
  event LiquidationProtocolFeeChanged(address indexed asset, uint256 oldFee, uint256 newFee);
  event PendingLtvChanged(address indexed asset, uint256 ltv);
  event ReserveActive(address indexed asset, bool active);
  event ReserveBorrowing(address indexed asset, bool enabled);
  event ReserveDropped(address indexed asset);
  event ReserveFactorChanged(
    address indexed asset,
    uint256 oldReserveFactor,
    uint256 newReserveFactor
  );
  event ReserveFlashLoaning(address indexed asset, bool enabled);
  event ReserveFrozen(address indexed asset, bool frozen);
  event ReserveInitialized(
    address indexed asset,
    address indexed aToken,
    address stableDebtToken,
    address variableDebtToken,
    address interestRateStrategyAddress
  );
  event ReserveInterestRateDataChanged(address indexed asset, address indexed strategy, bytes data);
  event ReserveInterestRateStrategyChanged(
    address indexed asset,
    address oldStrategy,
    address newStrategy
  );
  event ReservePaused(address indexed asset, bool paused);
  event SiloedBorrowingChanged(address indexed asset, bool oldState, bool newState);
  event SupplyCapChanged(address indexed asset, uint256 oldSupplyCap, uint256 newSupplyCap);
  event VariableDebtTokenUpgraded(
    address indexed asset,
    address indexed proxy,
    address indexed implementation
  );

  function MAX_GRACE_PERIOD() external view returns (uint40);
  function configureReserveAsCollateral(
    address asset,
    uint256 ltv,
    uint256 liquidationThreshold,
    uint256 liquidationBonus
  ) external;
  function disableLiquidationGracePeriod(address asset) external;
  function dropReserve(address asset) external;
  function getConfiguratorLogic() external view returns (address);
  function getPendingLtv(address asset) external view returns (uint256);
  function initReserves(ConfiguratorInputTypes.InitReserveInput[] memory input) external;
  function setAssetBorrowableInEMode(address asset, uint8 categoryId, bool borrowable) external;
  function setAssetCollateralInEMode(address asset, uint8 categoryId, bool collateral) external;
  function setAssetLtvzeroInEMode(address asset, uint8 categoryId, bool ltvzero) external;
  function setBorrowCap(address asset, uint256 newBorrowCap) external;
  function setBorrowableInIsolation(address asset, bool borrowable) external;
  function setDebtCeiling(address asset, uint256 newDebtCeiling) external;
  function setEModeCategory(
    uint8 categoryId,
    uint16 ltv,
    uint16 liquidationThreshold,
    uint16 liquidationBonus,
    string memory label
  ) external;
  function setLiquidationProtocolFee(address asset, uint256 newFee) external;
  function setPoolPause(bool paused, uint40 gracePeriod) external;
  function setPoolPause(bool paused) external;
  function setReserveActive(address asset, bool active) external;
  function setReserveBorrowing(address asset, bool enabled) external;
  function setReserveFactor(address asset, uint256 newReserveFactor) external;
  function setReserveFlashLoaning(address asset, bool enabled) external;
  function setReserveFreeze(address asset, bool freeze) external;
  function setReserveInterestRateData(address asset, bytes memory rateData) external;
  function setReserveLtvzero(address asset, bool ltvzero) external;
  function setReservePause(address asset, bool paused) external;
  function setReservePause(address asset, bool paused, uint40 gracePeriod) external;
  function setSiloedBorrowing(address asset, bool siloed) external;
  function setSupplyCap(address asset, uint256 newSupplyCap) external;
  function updateAToken(ConfiguratorInputTypes.UpdateATokenInput memory input) external;
  function updateFlashloanPremium(uint128 newFlashloanPremium) external;
  function updateVariableDebtToken(
    ConfiguratorInputTypes.UpdateDebtTokenInput memory input
  ) external;
}
