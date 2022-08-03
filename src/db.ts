import { EBlockchainEnvironment, TLocalDBPool } from './types'

export const helpers: Record<EBlockchainEnvironment, {
  DepositScheduler: string
  WithdrawalScheduler: string
}> = {
  [EBlockchainEnvironment.ETHEREUM]: {
    DepositScheduler: '0xe47b867b2b5b21a2022068c9ef1293783864b274',
    WithdrawalScheduler: '0x27004Bd82cB5636A53b29203633A05FA256E0b5c'
  },
  [EBlockchainEnvironment.MATIC]: {
    DepositScheduler: '0xeE1270120cE07Af80D2Eb1691807f1f66816c521',
    WithdrawalScheduler: '0x04D64344caA3841Ad0157411914b3f3f39d88B40'
  },
  [EBlockchainEnvironment.ARBITRUM]: {
    DepositScheduler: '',
    WithdrawalScheduler: ''
  },
  [EBlockchainEnvironment.BINANCE]: {
    DepositScheduler: '0xC72E9B3E5a64FDca5f4C415F9f595eF92A5B9d86',
    WithdrawalScheduler: '0xD33767Cc46C5aaF173539B71642bd1ebC1dA1f2C'
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
