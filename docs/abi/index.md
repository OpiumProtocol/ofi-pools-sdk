# How to communicate with pools

## What function is used to get staked balance for a given address?

All stakers receieve LP (shares) tokens. So you can get it's `balance` or it's `underlyingBalance`

```
const sharesBalance = opiumStakingContract.balanceOf(user)

const underlyingBalance = opiumStakingContract.calculateSharesToUnderlyingRatio(sharesBalance)
```

# 6. What function is used to stake assets?

Deposits are only available during `STAKING` and `TRADING` phase

```
  /// @notice Deposit underlying token and receive LP tokens (pool shares)
  /// @param _amount an amount of underlying token to deposit
  function deposit(uint256 _amount);
```

# 7. What function is used to to unstake assets? Function name or link to the GitHub

Withdrawals are only available during `STAKING` phase

```
  /// @notice Withdraw user's funds from staking pool
  /// @param _amount an amount of underlying token to withdraw
  function withdraw(uint256 _amount);
```

# Appendix
Staking contracts have 3 phases:
- `STAKING` - where stakers can deposit / withdraw their stake
- `TRADING` - where hedgers can purchase derivatives against the pool
- `IDLE` - where none of above are not available, simply: waitinig period

Staking phase is defined by condition:
```
const EPOCH = opiumStakingContract.EPOCH()
const TIME_DELTA = opiumStakingContract.TIME_DELTA()
const STAKING_PHASE = opiumStakingContract.STAKING_PHASE()
const TRADING_PHASE = opiumStakingContract.TRADING_PHASE()
const derivativeMaturity = opiumStakingContract.derivative().endTime

const isStakingPhase = (derivativeMaturity - EPOCH + TIME_DELTA < now) && (now < derivativeMaturity - EPOCH + STAKING_PHASE - TIME_DELTA)
const isTradingPhase = (derivativeMaturity - EPOCH + STAKING_PHASE + TIME_DELTA < now) && (now < derivativeMaturity - EPOCH + STAKING_PHASE + TRADING_PHASE - TIME_DELTA)
```

Alternatively there are helping functions
```
const isStakingPhase = opiumStakingContract.isStakingPhase()
const isTradingPhase = opiumStakingContract.isTradingPhase()
```

# Events

Pools implement ERC20 token interface, so it inherits all of it's events

Additionally it has the following events:

```
/// @notice Indicates new deposits into the pool
/// @param user an address of the depositor
/// @param _amount an amount of the deposit
event Deposit(address indexed user, uint256 _amount);

/// @notice Indicates new withdrawals from the pool
/// @param user an address of the withdrawer
/// @param _amount an amount of the withdrawal
event Withdraw(address indexed user, uint256 _amount);

/// @notice Indicates new hedge action
/// @param user an address of the hedger
/// @param _quantity an amount of created positions
event Hedge(address indexed user, uint256 _quantity);

/// @notice Indicates deployment of new LONG position token wrapper
/// @param longTokenId a tokenId of the LONG position
/// @param wrapper an address of the deployed wrapper
event LongPositionWrapper(uint256 longTokenId, address wrapper);
```
