import {
  Briefcase,
  CreditCard,
  FileText,
  LayoutDashboard,
  Lock,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react'

export const adminNavData = {
  navMain: [
    {
      title: 'Overview',
      url: '/overview',
      icon: LayoutDashboard,
    },
    {
      title: 'KYC Management',
      url: '/kyc',
      icon: FileText,
    },
    {
      title: 'User Management',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'All Users',
          url: '/users/all',
        },
        {
          title: 'Referral Tree',
          url: '/users/referral-tree',
        },
        {
          title: 'Activity Logs',
          url: '/users/activity-logs',
        },
      ],
    },
    {
      title: 'Coffer (Investments)',
      url: '#',
      icon: Briefcase,
      items: [
        {
          title: 'Marketplace',
          url: '/coffer/marketplace',
        },
        {
          title: 'Active Coffers',
          url: '/coffer/active',
        },
        {
          title: 'Dividend Desk',
          url: '/coffer/dividends',
        },
        {
          title: 'Performance',
          url: '/coffer/performance',
        },
      ],
    },
    {
      title: 'Locker',
      url: '#',
      icon: Lock,
      items: [
        {
          title: 'Analytics',
          url: '/locker/analytics',
        },
        {
          title: 'Rate Manager',
          url: '/locker/rates',
        },
        {
          title: 'Categories',
          url: '/locker/categories',
        },
        {
          title: 'Cabals',
          url: '/locker/cabals',
        },
        {
          title: 'Auto-Save Rules',
          url: '/locker/rules',
        },
      ],
    },
    {
      title: 'Financials',
      url: '#',
      icon: CreditCard,
      items: [
        {
          title: 'Transaction Ledger',
          url: '/financials/ledger',
        },
        {
          title: 'Internal Entries',
          url: '/financials/internal',
        },
        {
          title: 'Provider Config',
          url: '/financials/provider-config',
        },
        {
          title: 'Withdrawal Requests',
          url: '/financials/withdrawals',
          badge: '5',
        },
      ],
    },
    {
      title: 'Communication',
      url: '#',
      icon: Megaphone,
      items: [
        {
          title: 'Bulk Email',
          url: '/communication/email',
        },
        {
          title: 'Push Notifications',
          url: '/communication/notifications',
        },
        {
          title: 'In-App Updates',
          url: '/communication/updates',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'Country Management',
          url: '/settings/countries',
        },
        {
          title: 'Admin Access',
          url: '/settings/access',
        },
        {
          title: 'App Configuration',
          url: '/settings/config',
        },
      ],
    },
  ],
}
