import { EBlockchainEnvironment, TLocalDBPool } from './types'

export const helpers: Record<EBlockchainEnvironment, {
  DepositScheduler: string
  WithdrawalScheduler: string
}> = {
  [EBlockchainEnvironment.ETHEREUM]: {
    DepositScheduler: '',
    WithdrawalScheduler: ''
  },
  [EBlockchainEnvironment.MATIC]: {
    DepositScheduler: '',
    WithdrawalScheduler: ''
  },
  [EBlockchainEnvironment.ARBITRUM]: {
    DepositScheduler: '',
    WithdrawalScheduler: ''
  },
  [EBlockchainEnvironment.BINANCE]: {
    DepositScheduler: '',
    WithdrawalScheduler: ''
  },
}

export const pools: Record<EBlockchainEnvironment, TLocalDBPool[]> = {
  [EBlockchainEnvironment.ETHEREUM]: [
    {
      title: 'Weekly Turbo 1INCH',
      address: '0xeC5bD46A5085BDfFfcf0E89F1029Bb0Fb59F9Ee0'
    },
  ],
  [EBlockchainEnvironment.MATIC]: [
    {
      title: 'Weekly Turbo ETH',
      address: '0x79Fcf1813327e88e55D07b7093cb5CA3Ecfc39A3'
    },
    {
      title: 'Weekly ETH Dump Protection',
      address: '0xbD0375A06Afd5C3A0A0AD26F30c4B37629F00D8e'
    },
  ],
  [EBlockchainEnvironment.ARBITRUM]: [],
  [EBlockchainEnvironment.BINANCE]: []
}
