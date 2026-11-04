import { Hex } from 'viem';

interface KnownInterfaces<T extends number | Hex = any> {
  value: T;
  type: T extends number ? 'uint256' : 'address' | string;
  chainId?: T extends number ? never : number;
}

export type AddressInfo = Hex | KnownInterfaces;

export type Addresses = Record<Uppercase<string>, AddressInfo>;

export type GovernanceV3Addresses = {
  CROSS_CHAIN_CONTROLLER?: Hex;
  GOVERNANCE?: Hex;
  VOTING_MACHINE?: Hex;
  PAYLOADS_CONTROLLER?: Hex;
  PERMISSIONED_PAYLOADS_CONTROLLER?: Hex;
  VOTING_PORTAL_ETH_ETH?: Hex;
  VOTING_PORTAL_ETH_AVAX?: Hex;
  VOTING_PORTAL_ETH_POL?: Hex;
  CL_EMERGENCY_ORACLE?: Hex;
  VM_DATA_HELPER?: Hex;
  GOV_DATA_HELPER?: Hex;
  PC_DATA_HELPER?: Hex;
  META_DELEGATE_HELPER?: Hex;
  EMERGENCY_REGISTRY?: Hex;
  GOVERNANCE_POWER_STRATEGY?: Hex;
  GRANULAR_GUARDIAN?: Hex;
  GOVERNANCE_GUARDIAN?: Hex;
};

export interface GovernanceConfig {
  name: string;
  CHAIN_ID: number;
  ADDRESSES: GovernanceV3Addresses;
}

export interface PoolConfig {
  name: string;
  chainId: number;
  POOL_ADDRESSES_PROVIDER: Hex;
  // will be inlined in js pool export
  additionalAddresses: {
    FAUCET?: Hex;
    WETH_GATEWAY?: Hex;
    REPAY_WITH_COLLATERAL_ADAPTER?: Hex;
    SWAP_COLLATERAL_ADAPTER?: Hex;
    DEBT_SWAP_ADAPTER?: Hex;
    WITHDRAW_SWAP_ADAPTER?: Hex;
    SAVINGS_DAI_TOKEN_WRAPPER?: Hex;
    POOL_ADDRESSES_PROVIDER_REGISTRY?: Hex;
    CONFIG_ENGINE?: Hex;
    MIGRATION_HELPER?: Hex;
    UI_POOL_DATA_PROVIDER?: Hex;
    UI_INCENTIVE_DATA_PROVIDER?: Hex;
    L2_ENCODER?: Hex;
    PROOF_OF_RESERVE?: Hex;
    PROOF_OF_RESERVE_AGGREGATOR?: Hex;
    DELEGATION_AWARE_A_TOKEN_IMPL_REV_1?: Hex;
    LEGACY_STATIC_A_TOKEN_FACTORY?: Hex; // deprecated
    LEGACY_STATIC_A_TOKEN_ORACLE?: Hex; // deprecated
    STATA_FACTORY?: Hex;
    RISK_STEWARD?: Hex;
    RISK_COUNCIL?: Hex;
    EDGE_RISK_ORACLE?: Hex;
    EDGE_RISK_STEWARD_RATES?: Hex;
    EDGE_RISK_STEWARD_CAPS?: Hex;
    EDGE_RISK_STEWARD_PENDLE_EMODE?: Hex;
    EDGE_RISK_STEWARD_DISCOUNT_RATE?: Hex;
    EDGE_INJECTOR_RATES?: Hex;
    EDGE_INJECTOR_CAPS?: Hex;
    EDGE_INJECTOR_PENDLE_EMODE?: Hex;
    EDGE_INJECTOR_DISCOUNT_RATE?: Hex;
    UI_GHO_DATA_PROVIDER?: Hex;
    RATES_FACTORY?: Hex;
    PERMISSION_MANAGER?: Hex;
    WALLET_BALANCE_PROVIDER?: Hex;
    GHO_DIRECT_MINTER?: Hex;
    RWA_A_TOKEN_MANAGER?: Hex;
    RWA_ORACLE_PARAMS_REGISTRY?: Hex;
    RWA_A_TOKEN_IMPL?: Hex;
    DUST_BIN?: Hex;
    CLINIC_STEWARD?: Hex;
    SVR_STEWARD?: Hex;
    POOL_EXPOSURE_STEWARD?: Hex;
    COLLECTOR_SWAP_STEWARD?: Hex;
  };
  // will be used for pending pools where the impls can't be fetched yet
  initial?: {
    COLLECTOR?: Hex;
    DEFAULT_A_TOKEN_IMPL?: Hex;
    DEFAULT_VARIABLE_DEBT_TOKEN_IMPL?: Hex;
    DEFAULT_STABLE_DEBT_TOKEN_IMPL?: Hex;
  };
}

export type ReserveData = {
  symbol: string;
  UNDERLYING: Hex;
  decimals: number;
  id: number;
  A_TOKEN: Hex;
  V_TOKEN: Hex;
  INTEREST_RATE_STRATEGY: Hex;
  ORACLE: Hex;
  STATIC_A_TOKEN?: Hex;
  STATA_TOKEN?: Hex;
};

export type UmbrellaStakeData = {
  STAKE_TOKEN: Hex;
  UNDERLYING: Hex;
  symbol: string;
  decimals: number;
};

export type EMode = {
  label: string;
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus: number;
  collateralBitmap: bigint;
  borrowableBitmap: bigint;
};

/**
 * @dev config for addresses that belong more to a network then to a specific pool
 */
export interface NetworkAddresses<T extends Record<string, AddressInfo> = {}> {
  name: string;
  chainId: number;
  addresses: {
    TRANSPARENT_PROXY_FACTORY?: Hex;
    PROXY_ADMIN?: Hex;
    CREATE_3_FACTORY?: Hex;
    PROTOCOL_GUARDIAN?: Hex;
    AAVE_MERKLE_DISTRIBUTOR?: Hex;
    AAVE_CL_ROBOT_OPERATOR?: Hex;
    ROBOT_GUARDIAN?: Hex;
    AFC_SAFE?: Hex;
    AGENT_HUB?: Hex;
    AGENT_HUB_AUTOMATION?: Hex;
    RANGE_VALIDATION_MODULE?: Hex;
    FAUCET?: Hex;
  } & T;
}

export interface GhoAddresses<T extends Record<string, AddressInfo> = {}> {
  name: string;
  chainId: number;
  addresses: T;
}

export interface V4Config {
  name: string;
  chainId: number;
  admin: Record<string, Hex>;
  hubs: Record<string, Hex>;
  spokes: Record<string, Hex>;
  eSpokes?: Record<string, Hex>;
  positionManagers?: Record<string, Hex>;
  externalLibraries: Record<string, Hex>;
  additionalAddresses?: Record<string, Hex>;
}

export interface UmbrellaConfig {
  name: string;
  chainId: number;
  UMBRELLA: Hex;
  additionalAddresses?: {
    UMBRELLA_BATCH_HELPER?: Hex;
    UMBRELLA_CONFIG_ENGINE?: Hex;
    DATA_AGGREGATION_HELPER?: Hex;
    PERMISSIONED_PAYLOADS_CONTROLLER?: Hex;
    DEFICIT_OFFSET_CLINIC_STEWARD?: Hex;
  };
}
