import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/financials/internal')({
  component: () => <div>Internal Entries (Not Implemented)</div>,
})
