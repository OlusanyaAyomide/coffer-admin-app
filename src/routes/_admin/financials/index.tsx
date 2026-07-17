import { createFileRoute } from '@tanstack/react-router'
import FinancialsOverviewPage from '@/components/financials/overview/FinancialsOverviewPage'

export const Route = createFileRoute('/_admin/financials/')({
  component: FinancialsOverviewPage,
})
