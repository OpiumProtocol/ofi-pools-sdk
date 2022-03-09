import assert from 'assert'

import SDK, { EBlockchainEnvironment } from '../lib'

describe('SDK', () => {
  const environment = EBlockchainEnvironment.ETHEREUM
  let poolAddress = ''
  it('should return list of pools', async () => {
    const { pools } = SDK.db
    assert.strictEqual(pools[environment][0].title, 'Weekly Turbo 1INCH', 'Wrong 1inch pool title')

    poolAddress = pools.ETHEREUM[0].address
  })

  it('should return list of pools', async () => {
    const pool = await SDK.loadPool(EBlockchainEnvironment.ETHEREUM, poolAddress)
    console.log(pool)
    console.log(SDK.getPoolDetails(pool))
  })
})
