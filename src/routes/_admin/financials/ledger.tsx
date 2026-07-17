import { createFileRoute } from '@tanstack/react-router'
import LedgerPage from '@/components/financials/ledger/LedgerPage'
import LedgerContextProvider from '@/components/financials/ledger/LedgerContextProvider'

export const Route = createFileRoute('/_admin/financials/ledger')({
  component: TransactionLedgerRoute,
})

function TransactionLedgerRoute() {
  return (
    <LedgerContextProvider>
      <LedgerPage />
    </LedgerContextProvider>
  )
}
