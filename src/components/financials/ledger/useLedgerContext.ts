import { useContext } from 'react'
import LedgerContext from './LedgerContext'

export default function useLedgerContext() {
  const context = useContext(LedgerContext)

  if (!context) {
    throw new Error(
      'useLedgerContext must be used within LedgerContextProvider',
    )
  }

  return context
}
