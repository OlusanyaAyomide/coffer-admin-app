'use client';

import { useState } from 'react';
import {
  
  cofferMobileColumns,
  createCofferColumns,
  getCofferMobileFooter,
  getCofferMobileTitle
} from './coffer-columns';
import TransactionTimelineDialog from './TransactionTimelineDialog';
import InvestmentDetailsDialog from './InvestmentDetailsDialog';
import CofferFilter from './CofferFilter';
import CofferTransactionsOverview from './CofferTransactionsOverview';
import UpcomingDividendsSection from './UpcomingDividendsSection';
import useCofferPlansContext from './useCofferPlansContext';
import type {CofferInvestment} from './coffer-columns';
import { Button } from '@/components/ui/button';
import MobileCards from '@/components/shared/MobileCards';
import CustomizableTable from '@/components/shared/CustomizableTable';
import { convertDateToTimeRange } from '@/services/TimeServices';

// Mock data based on UserInvestment and Investment schemas
const mockCofferInvestments: Array<CofferInvestment> = [
  {
    id: '1',
    reference: 'COF-2024-001',
    status: 'active',
    total_units_purchased: 10,
    created_at: '2024-09-15T10:00:00Z',
    investment: {
      id: 'inv-1',
      title: 'Agricultural Growth Fund',
      category: 'Agriculture',
      price_per_unit: 500,
      roi_percentage: 18,
      start_date: '2024-09-15T00:00:00Z',
      maturity_date: '2025-09-15T00:00:00Z',
      currency: 'USDT',
      description: 'Invest in sustainable agricultural projects across Nigeria with guaranteed returns.',
    },
    transactions: [
      { id: 't1', type: 'deposit', amount: 5000, date: '2024-09-15T10:00:00Z', status: 'completed', description: 'Initial investment' },
      { id: 't2', type: 'dividend', amount: 225, date: '2024-12-15T10:00:00Z', status: 'completed', description: 'Q4 2024 dividend' },
      { id: 't3', type: 'dividend', amount: 225, date: '2025-03-15T10:00:00Z', status: 'completed', description: 'Q1 2025 dividend' },
      { id: 't4', type: 'dividend', amount: 225, date: '2025-06-15T10:00:00Z', status: 'upcoming', description: 'Q2 2025 dividend' },
      { id: 't5', type: 'maturity', amount: 5225, date: '2025-09-15T10:00:00Z', status: 'upcoming', description: 'Capital + final dividend' },
    ],
    total_dividends_received: 450,
    next_dividend_date: '2025-06-15T00:00:00Z',
  },
  {
    id: '2',
    reference: 'COF-2024-002',
    status: 'matured',
    total_units_purchased: 20,
    created_at: '2024-01-10T10:00:00Z',
    investment: {
      id: 'inv-2',
      title: 'Real Estate Development Fund',
      category: 'Real Estate',
      price_per_unit: 1000,
      roi_percentage: 24,
      start_date: '2024-01-10T00:00:00Z',
      maturity_date: '2025-01-10T00:00:00Z',
      currency: 'USDT',
      description: 'Premium real estate development in Lagos with high yield potential.',
    },
    transactions: [
      { id: 't6', type: 'deposit', amount: 20000, date: '2024-01-10T10:00:00Z', status: 'completed' },
      { id: 't7', type: 'dividend', amount: 1200, date: '2024-04-10T10:00:00Z', status: 'completed' },
      { id: 't8', type: 'dividend', amount: 1200, date: '2024-07-10T10:00:00Z', status: 'completed' },
      { id: 't9', type: 'dividend', amount: 1200, date: '2024-10-10T10:00:00Z', status: 'completed' },
      { id: 't10', type: 'maturity', amount: 21200, date: '2025-01-10T10:00:00Z', status: 'completed' },
    ],
    total_dividends_received: 4800,
  },
  {
    id: '3',
    reference: 'COF-2024-003',
    status: 'not_started',
    total_units_purchased: 5,
    created_at: '2025-01-15T10:00:00Z',
    investment: {
      id: 'inv-3',
      title: 'Tech Startup Fund III',
      category: 'Technology',
      price_per_unit: 2000,
      roi_percentage: 30,
      start_date: '2025-02-01T00:00:00Z',
      maturity_date: '2026-02-01T00:00:00Z',
      currency: 'USDT',
      description: 'Early-stage investment in promising Nigerian tech startups.',
    },
    transactions: [
      { id: 't11', type: 'deposit', amount: 10000, date: '2025-01-15T10:00:00Z', status: 'completed' },
    ],
    total_dividends_received: 0,
    next_dividend_date: '2025-05-01T00:00:00Z',
  },
  {
    id: '4',
    reference: 'COF-2023-015',
    status: 'withdrawn',
    total_units_purchased: 15,
    created_at: '2023-06-01T10:00:00Z',
    investment: {
      id: 'inv-4',
      title: 'Infrastructure Bond',
      category: 'Government Bonds',
      price_per_unit: 100000,
      roi_percentage: 15,
      start_date: '2023-06-01T00:00:00Z',
      maturity_date: '2024-06-01T00:00:00Z',
      currency: 'NGN',
      description: 'Government-backed infrastructure development bonds.',
    },
    transactions: [
      { id: 't12', type: 'deposit', amount: 1500000, date: '2023-06-01T10:00:00Z', status: 'completed' },
      { id: 't13', type: 'dividend', amount: 56250, date: '2023-09-01T10:00:00Z', status: 'completed' },
      { id: 't14', type: 'dividend', amount: 56250, date: '2023-12-01T10:00:00Z', status: 'completed' },
      { id: 't15', type: 'withdrawal', amount: 1612500, date: '2024-01-15T10:00:00Z', status: 'completed', description: 'Early withdrawal with penalty' },
    ],
    total_dividends_received: 112500,
  },
];

export default function CofferPlansTab() {
  const {
    investmentStatus,
    startDate,
    page,
    setPage,
  } = useCofferPlansContext();

  // Dialog states
  const [selectedInvestment, setSelectedInvestment] = useState<CofferInvestment | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Convert date filter to range
  const dateRange = startDate.length > 0 ? convertDateToTimeRange('start_date', startDate) : null;

  // Filter data
  const filteredData = mockCofferInvestments.filter((investment) => {
    // Status filter
    if (investmentStatus.length > 0 && !investmentStatus.includes(investment.status)) {
      return false;
    }

    // Date range filter
    if (dateRange) {
      const investmentStartDate = new Date(investment.investment.start_date);
      if (dateRange.start_date_start && investmentStartDate < new Date(dateRange.start_date_start)) return false;
      if (dateRange.start_date_end && investmentStartDate > new Date(dateRange.start_date_end)) return false;
    }

    return true;
  });

  // Handlers
  const handleViewInvestment = (investment: CofferInvestment) => {
    setSelectedInvestment(investment);
    setIsDetailsOpen(true);
  };

  const handleViewTransactions = (investment: CofferInvestment) => {
    setSelectedInvestment(investment);
    setIsTimelineOpen(true);
  };

  // Create columns with handlers
  const columns = createCofferColumns(handleViewInvestment, handleViewTransactions);

  // Mobile action wrapper
  const MobileAction = ({ row }: { row: CofferInvestment }) => (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary hover:bg-primary/10"
      onClick={() => handleViewTransactions(row)}
    >
      View
    </Button>
  );

  // Pagination meta (mock)
  const paginationMeta = {
    total: filteredData.length,
    page: page,
    limit: 10,
    total_page: Math.ceil(filteredData.length / 10),
    has_next_page: page < Math.ceil(filteredData.length / 10),
    has_previous_page: page > 1,
  };

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <CustomizableTable
        tableKey="coffer-plans-table"
        defaultVisibleColumns={[
          'sn',
          'investment_name',
          'status',
          'units_owned',
          'total_value',
          'roi',
          'maturity_date',
          'action',
        ]}
        columns={columns}
        data={filteredData}
        meta={paginationMeta}
        setPage={setPage}
      >
        <CofferFilter />
      </CustomizableTable>

      {/* Mobile Cards */}
      <MobileCards
        data={filteredData}
        columns={cofferMobileColumns}
        title={getCofferMobileTitle}
        action={MobileAction}
        footer={getCofferMobileFooter}
        meta={paginationMeta}
        setPage={setPage}
        testIdKey="id"
      />

      {/* Coffer Transactions Overview */}
      <CofferTransactionsOverview investments={mockCofferInvestments} />

      {/* Upcoming Dividends */}
      <UpcomingDividendsSection investments={mockCofferInvestments} />

      {/* Dialogs */}
      <TransactionTimelineDialog
        open={isTimelineOpen}
        onOpenChange={setIsTimelineOpen}
        investment={selectedInvestment}
      />

      <InvestmentDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        investment={selectedInvestment}
      />
    </div>
  );
}
