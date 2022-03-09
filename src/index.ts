import { pools } from './db'
import { loadProducts, loadStakings, loadPool, getPoolDetails } from './pools'

export default {
  db: {
    pools,
  },
  loadProducts,
  loadStakings,
  loadPool,
  getPoolDetails
}

export * from './types'
