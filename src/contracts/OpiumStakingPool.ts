import { ProviderConnector } from '@1inch/limit-order-protocol'

import OPIUM_STAKING_POOL_ABI from '../abis/OpiumStakingPool.json'

export class OpiumStakingPool {
  public constructor(
    public readonly contractAddress: string,
    public readonly providerConnector: ProviderConnector
  ) {}

  // Actions
  public deposit(
    amount: string
  ): string {
    return this._getContractCallData('deposit', [
      amount
    ])
  }

  public withdraw(
    amount: string
  ): string {
    return this._getContractCallData('withdraw', [
      amount
    ])
  }

  // View
  /**
   * Calculates ration between amount of underlying tokens and LP tokens (pool shares)
   * @param amountOfUnderlyingTokens Amount of underlying tokens with decimals
   * @returns Amount of corresponding LP tokens with same decimals as underlying
   */
  public calculateUnderlyingToSharesRatio(
    amountOfUnderlyingTokens: string
  ): Promise<string> {
    const callData = this._getContractCallData(
      'calculateUnderlyingToSharesRatio',
      [
        amountOfUnderlyingTokens
      ]
    )

    return this.providerConnector
      .ethCall(this.contractAddress, callData)
  }

  private _getContractCallData(
    methodName: string,
    methodParams: unknown[] = []
  ): string {
    return this.providerConnector.contractEncodeABI(
      OPIUM_STAKING_POOL_ABI,
      this.contractAddress,
      methodName,
      methodParams
    )
  }
}
