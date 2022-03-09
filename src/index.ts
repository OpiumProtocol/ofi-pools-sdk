import { pools, helpers } from './db'
import { loadProducts, loadStakings, loadPool, getPoolDetails } from './api'
import { OpiumStakingPool } from './contracts/OpiumStakingPool'

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
    OpiumStakingPool    
  }
}

export * from './types'
