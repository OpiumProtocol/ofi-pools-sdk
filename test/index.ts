import assert from 'assert'
import Web3 from 'web3'

import { PrivateKeyProviderConnector } from '@1inch/limit-order-protocol'

import SDK, { EBlockchainEnvironment } from '../lib'

describe('SDK', () => {
  const environment = EBlockchainEnvironment.ETHEREUM
  const privateKey = '552be66668d14242eeeb0e84600f0946ddddc77777777c3761ea5906e9ddcccc'
  const web3 = new Web3('https://cloudflare-eth.com')
  
  let poolAddress = ''
  let providerConnector: PrivateKeyProviderConnector

  it('should return list of pools', async () => {
    const { pools } = SDK.db
    assert.strictEqual(pools[environment][0].title, 'Weekly Turbo 1INCH', 'Wrong 1inch pool title')

    poolAddress = pools.ETHEREUM[0].address
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

    const deposit = opiumStakingPool.deposit('1337')
    const withdraw = opiumStakingPool.withdraw('1337')

    console.log({
      deposit,
      withdraw
    })
  })
})
