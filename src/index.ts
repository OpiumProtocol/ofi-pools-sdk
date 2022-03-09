import { pools, helpers } from './db'

import { loadProducts, loadStakings, loadPool, getPoolDetails } from './api'

import { OpiumStakingPool } from './contracts/OpiumStakingPool'
import { WithdrawalScheduler } from './contracts/WithdrawalScheduler'
import { DepositScheduler } from './contracts/DepositScheduler'

export default {
  db: {
    pools,
    helpers
  },
  api: {
    loadProducts,
    loadStakings,
    loadPool,
    getPoolDetails
  },
  contracts: {
    OpiumStakingPool,
    DepositScheduler,
    WithdrawalScheduler
  }
}

export * from './types'
