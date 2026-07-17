import { useMemo, useState } from 'react'
import LedgerContext from './LedgerContext'
import type { ReactNode } from 'react'
import type { LedgerContextType } from './LedgerContext'

function LedgerContextProvider({ children }: { children: ReactNode }) {
  const [flow, setFlow] = useState<Array<string>>([])
  const [status, setStatus] = useState<Array<string>>([])
  const [provider, setProvider] = useState<Array<string>>([])
  const [currency, setCurrency] = useState<Array<string>>([])
  const [duration, setDuration] = useState<Array<string>>([])
  const [integrity, setIntegrity] = useState<Array<string>>([])
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  const contextValue = useMemo<LedgerContextType>(
    () => ({
      flow,
      setFlow,
      status,
      setStatus,
      provider,
      setProvider,
      currency,
      setCurrency,
      duration,
      setDuration,
      integrity,
      setIntegrity,
      search,
      setSearch,
      page,
      setPage,
    }),
    [flow, status, provider, currency, duration, integrity, search, page],
  )

  return (
    <LedgerContext.Provider value={contextValue}>
      {children}
    </LedgerContext.Provider>
  )
}

export default LedgerContextProvider
