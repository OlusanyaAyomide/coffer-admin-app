import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/financials/ledger')({
  component: () => <div>Transaction Ledger (Not Implemented)</div>,
})
