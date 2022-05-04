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
type TAnalyticsChart = {
  timestamp: number
  performance: number
  linePerformance: number
}[]
type TPayoutChart = {
  price: number
  buyerPayout: number
  sellerPayout: number
}[]
type THoldingVsStakingChart = {
  date: string
  lpPrice: number
  price: number
  timestamp: number
  tokenPrice: number
}[]

const OPIUM_WATCH_BASE_URL = 'https://api.opium.watch/v1'

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
 * @return.staking.params.epochLength - Length of the epoch in seconds
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

/**
 * Returns the performance chart of the pool
 * @return[].timestamp - Epoch timestamp
 * @return[].performance - Performance at the particular epoch (units: from 0 to 1, represents 0% to 100%)
 * @return[].linePerformance - Performance since inception (units: from 0 to 1, represents 0% to 100%)
 */
export const loadPoolPerformanceChart = async (env: EBlockchainEnvironment, poolAddress: string): Promise<TAnalyticsChart> => {
  const analyticsChartResponse = await CLIENTS[env].get<TAnalyticsChart>(`/products/${poolAddress.toLowerCase()}/analyticsChart`)
  
  return analyticsChartResponse.data
}

/**
 * Returns the payout chart of the derivative
 * @return[].price - Price of underlying asset
 * @return[].buyerPayout - Payout of buyer (non-relevant for the pools) (units: from 0 to 1, represents 0% to 100%)
 * @return[].sellerPayout - Payout of the pool (relevant for the pools) (units: from 0 to 1, represents 0% to 100%)
 */
export const loadPoolPayoutChart = async (env: EBlockchainEnvironment, poolAddress: string): Promise<TPayoutChart> => {
  if (PRODUCTS_CACHE[env] === null) {
    await loadProducts(env)
  }

  const products = PRODUCTS_CACHE[env]
  const product = products.find(product => product.params.poolAddress.toLowerCase() === poolAddress.toLowerCase())

  if (!product) {
    throw new Error('Not found')
  }

  const payoutChartResponse = await CLIENTS[env].get<TPayoutChart>(`/products/${product.id}/payoutChart`)
  
  return payoutChartResponse.data
}

/**
 * Returns the comparison chart for holding vs staking of the underlying token
 * @return[].date - DD-MM-YYY format of the reported day
 * @return[].lpPrice - Price of the LP token (pool share)
 * @return[].price - Price of the underlying token
 * @return[].timestamp - Timestamp of the reported day
 * @return[].tokenPrice === @return[].price
 */
export const loadHoldingVsStakingChart = async (env: EBlockchainEnvironment, poolAddress: string): Promise<THoldingVsStakingChart> => {
  if (PRODUCTS_CACHE[env] === null) {
    await loadProducts(env)
  }

  const products = PRODUCTS_CACHE[env]
  const product = products.find(product => product.params.poolAddress.toLowerCase() === poolAddress.toLowerCase())

  if (!product) {
    throw new Error('Not found')
  }

  const holdingVsStakingChartResponse = await axios.get<THoldingVsStakingChart>(
    `${OPIUM_WATCH_BASE_URL}/opium/analytics/${poolAddress.toLowerCase()}?network=${env}&marginToken=${product.params.marginTitle}`
  )
  
  return holdingVsStakingChartResponse.data
}
