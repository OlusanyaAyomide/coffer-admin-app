import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/communication/email')({
  component: () => <div>Bulk Email (Not Implemented)</div>,
})
