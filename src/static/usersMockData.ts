import type { UserData, UserStats } from '@/types/UserTypes';

export const mockUserStats: UserStats = {
  total_users: 1248,
  active_users: 1105,
  pending_kyc: 87,
  suspended: 56,
  growth_percentage: 12,
};

const firstNames = ['Alex', 'Jessica', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Olivia', 'Robert', 'Sophia', 'William', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte', 'Christopher', 'Amelia', 'Daniel', 'Evelyn'];
const lastNames = ['Sterling', 'Morgan', 'Chen', 'Johnson', 'Williams', 'Brown', 'Taylor', 'Martinez', 'Anderson', 'Thomas', 'Garcia', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Young', 'Allen', 'King', 'Wright'];
const countries = ['US', 'UK', 'SG', 'CA', 'NG', 'AU', 'DE', 'MX', 'BR', 'FR'];
const kycStatuses: ('verified' | 'pending' | 'rejected' | 'not_started')[] = ['verified', 'pending', 'rejected', 'not_started'];
const accountStatuses: ('active' | 'suspended' | 'inactive')[] = ['active', 'suspended', 'inactive'];
const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

export const mockUsers: UserData[] = Array.from({ length: 50 }, (_, i) => {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

  return {
    id: (i + 1).toString(),
    user_id: `UID-${5501 + i}`,
    first_name: firstName,
    last_name: lastName,
    email: email,
    kyc_status: kycStatuses[i % kycStatuses.length],
    account_status: accountStatuses[i % accountStatuses.length],
    balance: Math.floor(Math.random() * 50000),
    naira_balance: Math.floor(Math.random() * 1000000),
    usdt_balance: Math.floor(Math.random() * 10000),
    risk_level: riskLevels[i % riskLevels.length],
    country_id: countries[i % countries.length],
    last_active: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    created_at: new Date(Date.now() - Math.random() * 50000000000).toISOString(),
  };
});

export const countryOptions = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Singapore', value: 'SG' },
  { label: 'Canada', value: 'CA' },
  { label: 'Nigeria', value: 'NG' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'Mexico', value: 'MX' },
  { label: 'Brazil', value: 'BR' },
  { label: 'France', value: 'FR' },
];
