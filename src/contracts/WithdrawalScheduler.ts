import { ProviderConnector } from '@1inch/limit-order-protocol'

import WITHDRAWAL_SCHEDULER_ABI from '../abis/WithdrawalScheduler.json'

export class WithdrawalScheduler {
  public constructor(
    public readonly contractAddress: string,
    public readonly providerConnector: ProviderConnector
  ) {}

  public scheduleWithdrawal(
    poolAddress: string
  ): string {
    return this._getContractCallData('scheduleWithdrawal', [
      poolAddress
    ])
  }

  public unscheduleWithdrawal(
    poolAddress: string
  ): string {
    return this._getContractCallData('unscheduleWithdrawal', [
      poolAddress
    ])
  }

  public isScheduled(
    poolAddress: string,
    userAddress?: string
  ): Promise<boolean> {
    const callData = userAddress
      ? this._getContractCallData('isScheduled(address,address)', [
        userAddress,
        poolAddress
      ])
      : this._getContractCallData('isScheduled(address)', [
        poolAddress
      ])

    return this.providerConnector
      .ethCall(this.contractAddress, callData)
      .then(isScheduled => isScheduled === 'true')
  }

  private _getContractCallData(
    methodName: string,
    methodParams: unknown[] = []
  ): string {
    return this.providerConnector.contractEncodeABI(
      WITHDRAWAL_SCHEDULER_ABI,
      this.contractAddress,
      methodName,
      methodParams
    )
  }
}
