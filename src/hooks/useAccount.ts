import { useSyncExternalStore } from 'react'
import { subscribeAccount, getAccount, type AccountData } from '../utils/account'

/** 계정(주인) 재화·인벤토리를 반응형으로 구독 */
export function useAccount(): AccountData {
  return useSyncExternalStore(subscribeAccount, getAccount, getAccount)
}
