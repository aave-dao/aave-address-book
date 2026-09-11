// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IUiPoolDataProviderV3 {
  struct AggregatedReserveData {
    address underlyingAsset;
    string name;
    string symbol;
    uint256 decimals;
    uint256 baseLTVasCollateral;
    uint256 reserveLiquidationThreshold;
    uint256 reserveLiquidationBonus;
    uint256 reserveFactor;
    bool usageAsCollateralEnabled;
    bool borrowingEnabled;
    bool stableBorrowRateEnabled;
    bool isActive;
    bool isFrozen;
    uint128 liquidityIndex;
    uint128 variableBorrowIndex;
    uint128 liquidityRate;
    uint128 variableBorrowRate;
    uint128 stableBorrowRate;
    uint40 lastUpdateTimestamp;
    address aTokenAddress;
    address stableDebtTokenAddress;
    address variableDebtTokenAddress;
    address interestRateStrategyAddress;
    uint256 availableLiquidity;
    uint256 totalPrincipalStableDebt;
    uint256 averageStableRate;
    uint256 stableDebtLastUpdateTimestamp;
    uint256 totalScaledVariableDebt;
    uint256 priceInMarketReferenceCurrency;
    address priceOracle;
    uint256 variableRateSlope1;
    uint256 variableRateSlope2;
    uint256 stableRateSlope1;
    uint256 stableRateSlope2;
    uint256 baseStableBorrowRate;
    uint256 baseVariableBorrowRate;
    uint256 optimalUsageRatio;
    bool isPaused;
    bool isSiloedBorrowing;
    uint128 accruedToTreasury;
    uint128 unbacked;
    uint128 isolationModeTotalDebt;
    bool flashLoanEnabled;
    uint256 debtCeiling;
    uint256 debtCeilingDecimals;
    uint8 eModeCategoryId;
    uint256 borrowCap;
    uint256 supplyCap;
    uint16 eModeLtv;
    uint16 eModeLiquidationThreshold;
    uint16 eModeLiquidationBonus;
    address eModePriceSource;
    string eModeLabel;
    bool borrowableInIsolation;
  }

  struct BaseCurrencyInfo {
    uint256 marketReferenceCurrencyUnit;
    int256 marketReferenceCurrencyPriceInUsd;
    int256 networkBaseTokenPriceInUsd;
    uint8 networkBaseTokenPriceDecimals;
  }

  struct UserReserveData {
    address underlyingAsset;
    uint256 scaledATokenBalance;
    bool usageAsCollateralEnabledOnUser;
    uint256 stableBorrowRate;
    uint256 scaledVariableDebt;
    uint256 principalStableDebt;
    uint256 stableBorrowLastUpdateTimestamp;
  }
}

interface IUiPoolDataProvider {
  function ETH_CURRENCY_UNIT() external view returns (uint256);
  function MKR_ADDRESS() external view returns (address);
  function bytes32ToString(bytes32 _bytes32) external pure returns (string memory);
  function getReservesData(
    address provider
  )
    external
    view
    returns (
      IUiPoolDataProviderV3.AggregatedReserveData[] memory,
      IUiPoolDataProviderV3.BaseCurrencyInfo memory
    );
  function getReservesList(address provider) external view returns (address[] memory);
  function getUserReservesData(
    address provider,
    address user
  ) external view returns (IUiPoolDataProviderV3.UserReserveData[] memory, uint8);
  function marketReferenceCurrencyPriceInUsdProxyAggregator() external view returns (address);
  function networkBaseTokenPriceInUsdProxyAggregator() external view returns (address);
}
