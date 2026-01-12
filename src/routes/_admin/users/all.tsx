import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/users/all')({
  component: () => <div>All Users (Not Implemented)</div>,
})
