import { EProductAvgCostFrequency } from '@opiumteam/ofi-sdk/lib/product'

export const enum EPhase {
  STAKING = 'STAKING',
  TRADING = 'TRADING',
  IDLE = 'IDLE',
  NOT_INITIALIZED = 'NOT_INITIALIZED'
}

export type TPoolPhaseDetails = {
  phase: EPhase
  stakingPhaseEnd: number
  nextTradingPhaseTimestamp: number
  nextStakingPhaseTimestamp: number
  nextIdlePhase: number
  stakingPhaseStart: number
}

export const getPoolPhaseDetails = (epochLength: number, stakingPhaseLength: number, tradingPhaseLength: number, maturity: number): TPoolPhaseDetails => {
  const now = ~~(Date.now() / 1000)
  const TIME_DELTA = 60

  const stakingPhaseStart = maturity - epochLength
  const stakingPhaseEnd = stakingPhaseStart + stakingPhaseLength
  const tradingPhaseEnd = stakingPhaseEnd + tradingPhaseLength

  const isStakingPhase = (stakingPhaseStart + TIME_DELTA < now) && (now < stakingPhaseEnd - TIME_DELTA)
  const isTradingPhase = (stakingPhaseEnd + TIME_DELTA < now) && (now < tradingPhaseEnd - TIME_DELTA)
  const isIdlePhase = 
    ((stakingPhaseStart < now) && (now < stakingPhaseStart + TIME_DELTA)) || 
    ((stakingPhaseEnd - TIME_DELTA < now) && (now < stakingPhaseEnd + TIME_DELTA)) || 
    ((tradingPhaseEnd - TIME_DELTA < now) && (now < tradingPhaseEnd)) || 
    ((tradingPhaseEnd < now) && (now < maturity))

  const phase: EPhase = isStakingPhase ?
    EPhase.STAKING :
    isTradingPhase ?
      EPhase.TRADING :
      isIdlePhase ?
        EPhase.IDLE :
        EPhase.NOT_INITIALIZED

  const nextTradingPhaseTimestamp: number = now < stakingPhaseEnd + TIME_DELTA ? stakingPhaseEnd + TIME_DELTA : maturity + stakingPhaseLength + TIME_DELTA
  const nextStakingPhaseTimestamp: number = maturity + TIME_DELTA
  const nextIdlePhase: number = tradingPhaseEnd
  
  return {
    phase,
    stakingPhaseEnd: stakingPhaseEnd - TIME_DELTA,
    nextTradingPhaseTimestamp,
    nextStakingPhaseTimestamp,
    nextIdlePhase,
    stakingPhaseStart
  }
}

const calculateAvgCost = (avgCost: number, pow: number, collateralization: number): number => {
  return ((1 + (avgCost / 100 / collateralization)) ** pow - 1) * 100
}

export const renderAvgCost = (avgCost: number, frequency: EProductAvgCostFrequency | null, collateralization: number): string => {
  switch (frequency) {
    case EProductAvgCostFrequency.ANNUAL:
      return `APR: ${avgCost}%`
    case EProductAvgCostFrequency.DAILY:
      return `${avgCost}% daily  (APR}: ${(calculateAvgCost(avgCost, 365, collateralization)).toFixed(1)}%)`
    case EProductAvgCostFrequency.MONTHLY:
      return `${avgCost}% monthly (APR}: ${(calculateAvgCost(avgCost, 12, collateralization)).toFixed(1)}%)`
    case EProductAvgCostFrequency.WEEKLY:
      return `${avgCost}% weekly (APR}: ${(calculateAvgCost(avgCost, 52, collateralization)).toFixed(1)}%)`
    case EProductAvgCostFrequency.PER_3_DAYS:
      return `${avgCost}% per 3 days (APR}: ${(calculateAvgCost(avgCost, 120, collateralization)).toFixed(1)}%)`
    case EProductAvgCostFrequency.SINGLE_EPOCH:
      return `${avgCost}%`
    default:
      return ''
  }
}
