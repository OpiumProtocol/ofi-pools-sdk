# Opium Finance Staking Pools SDK

- [Pools explained](docs/explained/index.md)
- [Pools ABI](docs/abi/index.md)

# How to use schedulers

Since pools are only allowing direct deposits and withdrawals within short amount of time, for better UX there are schedulers, which help to plan a scheduled deposit / withdrawal from the pool.

## Deposit scheduler

Allows to schedule a deposit of any amount of underlying token into any pool that accepts it.

It transfers users funds into itself and holds it till direct deposit is available. Once direct deposit is available, execution of the deposit may be triggered securely by any 3rd party. For example CronJob service.

Once deposit execution is triggered, scheduler contract deposits users' funds into the pool and receives pool shares (LP tokens). Received pool shares (LP tokens) are transferred to the user, that scheduled the deposit.

`DepositScheduler.sol`
```
interface IDepositScheduler {
  // Setters
  /**
   * @notice Transfers underlying tokens from user to the scheduler contract for further direct deposit execution to the provided pool
   */
  function scheduleDeposit(address _pool, uint256 _amount) external;
  /**
   * @notice Returns underlying tokens back to the user
   */
  function unscheduleDeposit(address _pool, uint256 _amount) external;
  /**
   * @notice Executes the scheduled deposit for the user, when possible
   */
  function execute(address _user, address _pool) external;

  // Getters
  /**
   * @notice Returns the amount of scheduled deposits for provided user and pool
   */
  function getScheduled(address _user, address _pool) external view returns (uint256)
}
```

`Your smart contract`
```
contract SmartWallet is Ownable {
  IERC20 public underlyingToken;
  IDepositScheduler public depositScheduler;

  function addPlannedDeposit(address _pool, uint256 _amount) external onlyOwner {
    underlyingToken.approve(address(depositScheduler), _amount);
    depositScheduler.scheduleDeposit(_pool, _amount);
  }

  function removePlannedDeposit(address _pool, uint256 _amount) external onlyOwner {
    depositScheduler.unscheduleDeposit(_pool, _amount);
  }
}
```

## Withdrawal scheduler

Allows to schedule a withdrawal of ALL the amount of pool shares (LP tokens) that user holds from any pool.

It holds allowance of users pool shares (LP tokens) and waits till direct withdrawal is available. Once direct withdrawal is available, execution of the withdrawal may be triggered securely by any 3rd party. For example CronJob service.

Once withdrawal execution is triggered, scheduler transfers pool shares (LP tokens) from user to itself and redeems them for underlying tokens from the pool. Received underlying tokens are transferred to the user, that scheduled the withdrawal.

`WithdrawalScheduler.sol`
```
interface IWithdrawalScheduler {
  // Setters
  /**
   * @notice Schedules the withdrawal of all user's shares for the provided pool
   */
  function scheduleWithdrawal(address _pool) external;
  /**
   * @notice Unschedules the withdrawal of all user's shares for the provided pool
   */
  function unscheduleWithdrawal(address _pool) external;
  /**
   * @notice Executes the scheduled withdrawal for the user, when possible 
   */
  function execute(address _user, address _pool) external;

  // Getters
  /**
   * @notice Indicates whether withdrawal is scheduled for provided user and pool
   */
  function isScheduled(address _user, address _pool) external view returns (bool);
}
```

`Your smart contract`
```
contract SmartWallet is Ownable {
  IERC20 public underlyingToken;
  IWithdrawalScheduler public withdrawalScheduler;

  function addPlannedWithdrawal(address _pool) external onlyOwner {
    uint256 ownedShares = IERC20(_pool).balanceOf(address(this));
    IERC20(_pool).approve(address(withdrawalScheduler), ownedShares);
    withdrawalScheduler.scheduleWithdrawal(_pool);
  }

  function removePlannedWithdrawal(address _pool) external onlyOwner {
    IERC20(_pool).approve(address(withdrawalScheduler), 0);
    withdrawalScheduler.unscheduleWithdrawal(_pool);
  }
}
```
