// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IAaveV3ConfigEngine {
  struct CapsUpdate {
    address asset;
    uint256 supplyCap;
    uint256 borrowCap;
  }

  struct CollateralUpdate {
    address asset;
    uint256 ltv;
    uint256 liqThreshold;
    uint256 liqBonus;
    uint256 debtCeiling;
    uint256 liqProtocolFee;
  }

  struct InterestRateInputData {
    uint256 optimalUsageRatio;
    uint256 baseVariableBorrowRate;
    uint256 variableRateSlope1;
    uint256 variableRateSlope2;
  }

  struct RateStrategyUpdate {
    address asset;
    InterestRateInputData params;
  }
}

library IPriceCapAdapter {
  struct PriceCapUpdateParams {
    uint104 snapshotRatio;
    uint48 snapshotTimestamp;
    uint16 maxYearlyRatioGrowthPercent;
  }
}

interface IRiskSteward {
  struct Config {
    RiskParamConfig ltv;
    RiskParamConfig liquidationThreshold;
    RiskParamConfig liquidationBonus;
    RiskParamConfig supplyCap;
    RiskParamConfig borrowCap;
    RiskParamConfig debtCeiling;
    RiskParamConfig baseVariableBorrowRate;
    RiskParamConfig variableRateSlope1;
    RiskParamConfig variableRateSlope2;
    RiskParamConfig optimalUsageRatio;
    RiskParamConfig priceCapLst;
    RiskParamConfig priceCapStable;
  }

  struct Debounce {
    uint40 supplyCapLastUpdated;
    uint40 borrowCapLastUpdated;
    uint40 ltvLastUpdated;
    uint40 liquidationBonusLastUpdated;
    uint40 liquidationThresholdLastUpdated;
    uint40 debtCeilingLastUpdated;
    uint40 baseVariableRateLastUpdated;
    uint40 variableRateSlope1LastUpdated;
    uint40 variableRateSlope2LastUpdated;
    uint40 optimalUsageRatioLastUpdated;
    uint40 priceCapLastUpdated;
  }

  struct PriceCapLstUpdate {
    address oracle;
    IPriceCapAdapter.PriceCapUpdateParams priceCapUpdateParams;
  }

  struct PriceCapStableUpdate {
    address oracle;
    uint256 priceCap;
  }

  struct RiskParamConfig {
    uint40 minDelay;
    uint256 maxPercentChange;
  }

  error AssetIsRestricted();
  error DebounceNotRespected();
  error InvalidCaller();
  error InvalidPriceCapUpdate();
  error InvalidUpdateToZero();
  error NoZeroUpdates();
  error OracleIsRestricted();
  error ParamChangeNotAllowed();
  error UpdateNotInRange();

  event AddressRestricted(address indexed contractAddress, bool indexed isRestricted);
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event RiskConfigSet(Config indexed riskConfig);

  function CONFIG_ENGINE() external view returns (address);
  function POOL_DATA_PROVIDER() external view returns (address);
  function RISK_COUNCIL() external view returns (address);
  function getRiskConfig() external view returns (Config memory);
  function getTimelock(address asset) external view returns (Debounce memory);
  function isAddressRestricted(address contractAddress) external view returns (bool);
  function owner() external view returns (address);
  function renounceOwnership() external;
  function setAddressRestricted(address contractAddress, bool isRestricted) external;
  function setRiskConfig(Config memory riskConfig) external;
  function transferOwnership(address newOwner) external;
  function updateCaps(IAaveV3ConfigEngine.CapsUpdate[] memory capsUpdate) external;
  function updateCollateralSide(
    IAaveV3ConfigEngine.CollateralUpdate[] memory collateralUpdates
  ) external;
  function updateLstPriceCaps(PriceCapLstUpdate[] memory priceCapUpdates) external;
  function updateRates(IAaveV3ConfigEngine.RateStrategyUpdate[] memory ratesUpdate) external;
  function updateStablePriceCaps(PriceCapStableUpdate[] memory priceCapUpdates) external;
}
