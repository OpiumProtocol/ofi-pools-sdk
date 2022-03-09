import { ProviderConnector } from '@1inch/limit-order-protocol'

import OPIUM_STAKING_POOL_ABI from '../abis/OpiumStakingPool.json'

export class OpiumStakingPool {
  public constructor(
    public readonly contractAddress: string,
    public readonly providerConnector: ProviderConnector
  ) {}

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
