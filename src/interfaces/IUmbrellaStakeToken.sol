// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library IERC4626StakeToken {
  struct CooldownSnapshot {
    uint192 amount;
    uint32 endOfCooldown;
    uint32 withdrawalWindow;
  }

  struct SignatureParams {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }
}

interface IUmbrellaStakeToken {
  error ECDSAInvalidSignature();
  error ECDSAInvalidSignatureLength(uint256 length);
  error ECDSAInvalidSignatureS(bytes32 s);
  error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);
  error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
  error ERC20InvalidApprover(address approver);
  error ERC20InvalidReceiver(address receiver);
  error ERC20InvalidSender(address sender);
  error ERC20InvalidSpender(address spender);
  error ERC2612ExpiredSignature(uint256 deadline);
  error ERC2612InvalidSigner(address signer, address owner);
  error ERC4626ExceededMaxDeposit(address receiver, uint256 assets, uint256 max);
  error ERC4626ExceededMaxMint(address receiver, uint256 shares, uint256 max);
  error ERC4626ExceededMaxRedeem(address owner, uint256 shares, uint256 max);
  error ERC4626ExceededMaxWithdraw(address owner, uint256 assets, uint256 max);
  error EnforcedPause();
  error EthTransferFailed();
  error ExpectedPause();
  error InvalidAccountNonce(address account, uint256 currentNonce);
  error InvalidInitialization();
  error NotApprovedForCooldown(address owner, address spender);
  error NotInitializing();
  error OnlyRescueGuardian();
  error OwnableInvalidOwner(address owner);
  error OwnableUnauthorizedAccount(address account);
  error SafeCastOverflowedUintDowncast(uint8 bits, uint256 value);
  error SafeERC20FailedOperation(address token);
  error ZeroAddress();
  error ZeroAmountSlashing();
  error ZeroBalanceInStaking();
  error ZeroFundsAvailable();

  event Approval(address indexed owner, address indexed spender, uint256 value);
  event CooldownChanged(uint256 oldCooldown, uint256 newCooldown);
  event CooldownOperatorSet(address indexed user, address indexed operator, bool flag);
  event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
  event EIP712DomainChanged();
  event ERC20Rescued(
    address indexed caller,
    address indexed token,
    address indexed to,
    uint256 amount
  );
  event Initialized(uint64 version);
  event NativeTokensRescued(address indexed caller, address indexed to, uint256 amount);
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event Paused(address account);
  event Slashed(address indexed destination, uint256 amount);
  event StakerCooldownUpdated(
    address indexed user,
    uint256 amount,
    uint256 endOfCooldown,
    uint256 unstakeWindow
  );
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Unpaused(address account);
  event UnstakeWindowChanged(uint256 oldUnstakeWindow, uint256 newUnstakeWindow);
  event Withdraw(
    address indexed sender,
    address indexed receiver,
    address indexed owner,
    uint256 assets,
    uint256 shares
  );

  function DOMAIN_SEPARATOR() external view returns (bytes32);
  function MIN_ASSETS_REMAINING() external view returns (uint256);
  function REWARDS_CONTROLLER() external view returns (address);
  function allowance(address owner, address spender) external view returns (uint256);
  function approve(address spender, uint256 value) external returns (bool);
  function asset() external view returns (address);
  function balanceOf(address account) external view returns (uint256);
  function convertToAssets(uint256 shares) external view returns (uint256);
  function convertToShares(uint256 assets) external view returns (uint256);
  function cooldown() external;
  function cooldownNonces(address owner) external view returns (uint256);
  function cooldownOnBehalfOf(address owner) external;
  function cooldownWithPermit(
    address user,
    uint256 deadline,
    IERC4626StakeToken.SignatureParams memory sig
  ) external;
  function decimals() external view returns (uint8);
  function deposit(uint256 assets, address receiver) external returns (uint256);
  function depositWithPermit(
    uint256 assets,
    address receiver,
    uint256 deadline,
    IERC4626StakeToken.SignatureParams memory sig
  ) external returns (uint256);
  function eip712Domain()
    external
    view
    returns (
      bytes1 fields,
      string memory name,
      string memory version,
      uint256 chainId,
      address verifyingContract,
      bytes32 salt,
      uint256[] memory extensions
    );
  function emergencyEtherTransfer(address to, uint256 amount) external;
  function emergencyTokenTransfer(address erc20Token, address to, uint256 amount) external;
  function getCooldown() external view returns (uint256);
  function getMaxSlashableAssets() external view returns (uint256);
  function getStakerCooldown(
    address user
  ) external view returns (IERC4626StakeToken.CooldownSnapshot memory);
  function getUnstakeWindow() external view returns (uint256);
  function initialize(
    address stakedToken,
    string memory name,
    string memory symbol,
    address owner,
    uint256 cooldown_,
    uint256 unstakeWindow_
  ) external;
  function isCooldownOperator(address user, address operator) external view returns (bool);
  function latestAnswer() external view returns (int256);
  function maxDeposit(address receiver) external view returns (uint256);
  function maxMint(address receiver) external view returns (uint256);
  function maxRedeem(address owner) external view returns (uint256);
  function maxRescue(address erc20Token) external view returns (uint256);
  function maxWithdraw(address owner) external view returns (uint256);
  function mint(uint256 shares, address receiver) external returns (uint256);
  function name() external view returns (string memory);
  function nonces(address owner) external view returns (uint256);
  function owner() external view returns (address);
  function pause() external;
  function paused() external view returns (bool);
  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
  function previewDeposit(uint256 assets) external view returns (uint256);
  function previewMint(uint256 shares) external view returns (uint256);
  function previewRedeem(uint256 shares) external view returns (uint256);
  function previewWithdraw(uint256 assets) external view returns (uint256);
  function redeem(uint256 shares, address receiver, address owner) external returns (uint256);
  function renounceOwnership() external;
  function setCooldown(uint256 newCooldown) external;
  function setCooldownOperator(address operator, bool flag) external;
  function setUnstakeWindow(uint256 newUnstakeWindow) external;
  function slash(address destination, uint256 amount) external returns (uint256);
  function symbol() external view returns (string memory);
  function totalAssets() external view returns (uint256);
  function totalSupply() external view returns (uint256);
  function transfer(address to, uint256 value) external returns (bool);
  function transferFrom(address from, address to, uint256 value) external returns (bool);
  function transferOwnership(address newOwner) external;
  function unpause() external;
  function whoCanRescue() external view returns (address);
  function withdraw(uint256 assets, address receiver, address owner) external returns (uint256);
}
