import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/financials/withdrawals')({
  component: () => <div>Withdrawal Requests (Not Implemented)</div>,
})
