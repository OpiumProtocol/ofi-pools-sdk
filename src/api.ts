import axios from 'axios'
import { EProductType, TProduct, TProductState } from '@opiumteam/ofi-sdk/lib/product'
import { TAllStakingsResponse } from '@opiumteam/ofi-sdk/lib/staking'

import { EBlockchainEnvironment } from '.'
import { getPoolPhaseDetails, renderAvgCost } from './utils'

type ProductResponse = TProduct<EProductType> & { state: TProductState<EProductType> }
type TAllProductsResponse = Array<ProductResponse>
type TPoolData = {
  product: ProductResponse
  staking: TAllStakingsResponse[0]
}

const CLIENTS = {
  [EBlockchainEnvironment.ETHEREUM]: axios.create({ baseURL: 'https://api.opium.finance/v1' }),
  [EBlockchainEnvironment.MATIC]: axios.create({ baseURL: 'https://api-matic.opium.finance/v1' }),
  [EBlockchainEnvironment.ARBITRUM]: axios.create({ baseURL: 'https://api-arbitrum.opium.finance/v1' }),
  [EBlockchainEnvironment.BINANCE]: axios.create({ baseURL: 'https://api-bsc.opium.finance/v1' }),
}

const PRODUCTS_CACHE: Record<EBlockchainEnvironment, TAllProductsResponse | null> = {
  [EBlockchainEnvironment.ETHEREUM]: null,
  [EBlockchainEnvironment.MATIC]: null,
  [EBlockchainEnvironment.ARBITRUM]: null,
  [EBlockchainEnvironment.BINANCE]: null,
}

const STAKINGS_CACHE: Record<EBlockchainEnvironment, TAllStakingsResponse | null> = {
  [EBlockchainEnvironment.ETHEREUM]: null,
  [EBlockchainEnvironment.MATIC]: null,
  [EBlockchainEnvironment.ARBITRUM]: null,
  [EBlockchainEnvironment.BINANCE]: null,
}

export const loadProducts = async (env: EBlockchainEnvironment, userAddress: string | null = null): Promise<void> => {
  const productsResponse = await CLIENTS[env].get<TAllProductsResponse>(
    userAddress === null ? '/products' : `/products?address=${userAddress.toLowerCase()}`
  )
  
  PRODUCTS_CACHE[env] = productsResponse.data
}

export const loadStakings = async (env: EBlockchainEnvironment, userAddress: string | null = null): Promise<void> => {
  const stakingsResponse = await CLIENTS[env].get<TAllStakingsResponse>(
    userAddress === null ? '/stakings' : `/stakings?address=${userAddress.toLowerCase()}`
  )
  
  STAKINGS_CACHE[env] = stakingsResponse.data
}

/**
 * @return === null - if no related product or staking was found
 * Product
 * @return.product.params.inverseTrigger - Strike price
 * @return.product.avgCostFrequency - Product frequency
 * Staking
 * @return.staking.params.poolUtilization - Current pool utilization (units: from 0 to 1, represents 0% to 100%)
 * @return.staking.params.yieldToDate - Return since inception (in %)
 * @return.staking.params.yieldToDateAnnualized - Annualized return (APR) (in %)
 * @return.staking.params.currentEpochTimestamp - Strike price reset timestamp
 * @return.staking.params.stakingPhaseLength - Rebalancing phase duration
 * @return.staking.params.poolSize - Total staked
 * @return.staking.userStaked - Your stake (only if userAddress is passed, otherwise 0)
 * @return.staking.userStakedPending - Your stake (scheduled | pending) (only if userAddress is passed, otherwise 0)
 * Computed
 * {@return.staking.params.currentEpochTimestamp - @return.staking.params.epochLength} - Epoch start timestamp
 * @return.staking.params.currentEpochTimestamp - Epoch end timestamp
 */
export const loadPool = async (env: EBlockchainEnvironment, poolAddress: string, userAddress: string | null = null, refresh = false): Promise<TPoolData | null> => {
  const preparedRequests = []

  if (PRODUCTS_CACHE[env] === null || refresh) {
    preparedRequests.push(loadProducts(env, userAddress))
  }

  if (STAKINGS_CACHE[env] === null || refresh) {
    preparedRequests.push(loadStakings(env, userAddress))
  }

  await Promise.all(preparedRequests)

  const products = PRODUCTS_CACHE[env]
  const product = products.find(product => product.params.poolAddress.toLowerCase() === poolAddress.toLowerCase())

  const stakings = STAKINGS_CACHE[env]
  const staking = stakings.find(staking => staking.productId === product.id)

  return product === null || staking === null ? null : { product, staking }
}

/**
 * Phases
 * @return.phases.phase - Current phase
 * @return.phases.nextStakingPhaseTimestamp - Next rebalancing (roll) timestamp
 * Returns
 * @return.returns.benchmarkReturn - Benchmark return calculated
 */
export const getPoolDetails = (poolData: TPoolData) => {
  return {
    phases: getPoolPhaseDetails(
      poolData.product.state.epochLength,
      poolData.product.state.stakingPhaseLength,
      poolData.product.state.tradingPhaseLength,
      poolData.product.state.currentEpochTimestamp
    ),
    returns: {
      benchmarkReturn: renderAvgCost(
        poolData.product.avgCost,
        poolData.product.avgCostFrequency,
        poolData.product.params.collateralization
      )
    }
  }
}
