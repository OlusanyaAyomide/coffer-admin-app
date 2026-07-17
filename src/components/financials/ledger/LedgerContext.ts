import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export type LedgerContextType = {
  flow: Array<string>
  setFlow: Dispatch<SetStateAction<Array<string>>>
  status: Array<string>
  setStatus: Dispatch<SetStateAction<Array<string>>>
  provider: Array<string>
  setProvider: Dispatch<SetStateAction<Array<string>>>
  currency: Array<string>
  setCurrency: Dispatch<SetStateAction<Array<string>>>
  duration: Array<string>
  setDuration: Dispatch<SetStateAction<Array<string>>>
  integrity: Array<string>
  setIntegrity: Dispatch<SetStateAction<Array<string>>>
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  page: number
  setPage: Dispatch<SetStateAction<number>>
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined)

export default LedgerContext
