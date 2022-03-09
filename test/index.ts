import assert from 'assert'
import Web3 from 'web3'

import { PrivateKeyProviderConnector } from '@1inch/limit-order-protocol'

import SDK, { EBlockchainEnvironment } from '../lib'

describe('SDK', () => {
  const environment = EBlockchainEnvironment.ETHEREUM
  const privateKey = '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc'
  const web3 = new Web3('https://cloudflare-eth.com')
  
  let poolAddress = ''
  let depositSchedulerAddress = ''
  let withdrawalSchedulerAddress = ''
  let providerConnector: PrivateKeyProviderConnector

  it('should return correct db', async () => {
    const { pools, helpers } = SDK.db
    assert.strictEqual(pools[environment][0].title, 'Weekly Turbo 1INCH', 'Wrong 1inch pool title')

    poolAddress = pools.ETHEREUM[0].address
    depositSchedulerAddress = helpers[environment].DepositScheduler
    withdrawalSchedulerAddress = helpers[environment].WithdrawalScheduler
  })

  it('should load the pool data and dependencies and correctly populate details', async () => {
    const pool = await SDK.api.loadPool(EBlockchainEnvironment.ETHEREUM, poolAddress)
    console.log(pool)
    console.log(SDK.api.getPoolDetails(pool))
  })

  it('should correctly prepare tx calldata', async () => {
    providerConnector = new PrivateKeyProviderConnector(privateKey, web3)

    const opiumStakingPool = new SDK.contracts.OpiumStakingPool(
      poolAddress,
      providerConnector
    )

    const depositScheduler = new SDK.contracts.DepositScheduler(
      depositSchedulerAddress,
      providerConnector
    )

    const withdrawalScheduler = new SDK.contracts.WithdrawalScheduler(
      withdrawalSchedulerAddress,
      providerConnector
    )

    const amount = web3.utils.toWei('1337')

    const deposit = opiumStakingPool.deposit(amount)
    const withdraw = opiumStakingPool.withdraw(amount)

    const scheduleDeposit = depositScheduler.scheduleDeposit(poolAddress, amount)
    const unscheduleDeposit = depositScheduler.scheduleDeposit(poolAddress, amount)
    const scheduled = await depositScheduler.getScheduled(poolAddress)
    
    const scheduleWithdrawal = withdrawalScheduler.scheduleWithdrawal(poolAddress)
    const unscheduleWithdrawal = withdrawalScheduler.unscheduleWithdrawal(poolAddress)
    // const isScheduled = await withdrawalScheduler.isScheduled(poolAddress)

    console.log({
      deposit,
      withdraw,

      scheduleDeposit,
      unscheduleDeposit,
      scheduled,

      scheduleWithdrawal,
      unscheduleWithdrawal
    })
  })
})
