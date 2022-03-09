import { ProviderConnector } from '@1inch/limit-order-protocol'
import { BigNumber } from '@ethersproject/bignumber'

import DEPOSIT_SCHEDULER_ABI from '../abis/DepositScheduler.json'

export class DepositScheduler {
  public constructor(
    public readonly contractAddress: string,
    public readonly providerConnector: ProviderConnector
  ) {}

  public scheduleDeposit(
    poolAddress: string,
    amount: string
  ): string {
    return this._getContractCallData('scheduleDeposit', [
      poolAddress,
      amount
    ])
  }

  public unscheduleDeposit(
    poolAddress: string,
    amount: string
  ): string {
    return this._getContractCallData('unscheduleDeposit', [
      poolAddress,
      amount
    ])
  }

  public getScheduled(
    poolAddress: string
  ): Promise<string> {
    const callData = this._getContractCallData(
      'getScheduled(address)',
      [
        poolAddress
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
      DEPOSIT_SCHEDULER_ABI,
      this.contractAddress,
      methodName,
      methodParams
    )
  }
}
