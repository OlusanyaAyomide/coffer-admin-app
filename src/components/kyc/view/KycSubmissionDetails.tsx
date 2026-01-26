import { User, MapPin, Briefcase, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateToReadable } from '@/services/TimeServices';
import type { KycSubmittedDataWithUrls } from '@/types/UserTypes';

interface KycSubmissionDetailsProps {
  kyc: KycSubmittedDataWithUrls;
}

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium break-words">{value}</span>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b text-muted-foreground">
    <Icon className="w-4 h-4" />
    <span className="text-sm font-semibold uppercase">{title}</span>
  </div>
);

export default function KycSubmissionDetails({ kyc }: KycSubmissionDetailsProps) {
  // Check if sections have data to render
  const hasPersonalInfo = kyc.first_name || kyc.last_name || kyc.date_of_birth || kyc.phone_number;
  const hasIdentityInfo = kyc.proof_of_identity_number || kyc.expiry_date || kyc.proof_of_identity_type;
  const hasAddressInfo = kyc.street_address || kyc.city || kyc.state || kyc.postal_code || kyc.second_street_address;
  const hasIncomeInfo = kyc.income_source || kyc.income_range_start || kyc.income_range_end;

  if (!hasPersonalInfo && !hasIdentityInfo && !hasAddressInfo && !hasIncomeInfo) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Personal Info */}
        {hasPersonalInfo && (
          <div>
            <SectionHeader icon={User} title="Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="First Name" value={kyc.first_name} />
              <DetailRow label="Middle Name" value={kyc.middle_name} />
              <DetailRow label="Last Name" value={kyc.last_name} />
              <DetailRow label="Date of Birth" value={kyc.date_of_birth ? formatDateToReadable(kyc.date_of_birth) : null} />
              <DetailRow label="Phone Number" value={kyc.phone_number} />
            </div>
          </div>
        )}

        {/* Identity Info */}
        {hasIdentityInfo && (
          <div>
            <SectionHeader icon={CreditCard} title="Identity Details" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="ID Type" value={kyc.proof_of_identity_type?.replace(/_/g, ' ')} />
              <DetailRow label="ID Number" value={kyc.proof_of_identity_number} />
              <DetailRow label="Expiry Date" value={kyc.expiry_date ? formatDateToReadable(kyc.expiry_date) : null} />
            </div>
          </div>
        )}

        {/* Address Info */}
        {hasAddressInfo && (
          <div>
            <SectionHeader icon={MapPin} title="Address Information" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Proof Type" value={kyc.proof_of_address_type?.replace(/_/g, ' ')} />
              <DetailRow label="Street Address" value={kyc.street_address} />
              <DetailRow label="City" value={kyc.city} />
              <DetailRow label="State/Region" value={kyc.state} />
              <DetailRow label="Postal Code" value={kyc.postal_code} />

              {/* Second Address if present */}
              {(kyc.second_street_address || kyc.second_city) && (
                <>
                  <div className="col-span-2 mt-2 mb-1 text-xs font-semibold text-muted-foreground">Secondary Address</div>
                  <DetailRow label="Street Address" value={kyc.second_street_address} />
                  <DetailRow label="City" value={kyc.second_city} />
                  <DetailRow label="State/Region" value={kyc.second_state} />
                  <DetailRow label="Postal Code" value={kyc.second_postal_code} />
                </>
              )}
            </div>
          </div>
        )}

        {/* Income Info */}
        {hasIncomeInfo && (
          <div>
            <SectionHeader icon={Briefcase} title="Income Information" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Income Source" value={kyc.income_source} />
              <DetailRow
                label="Income Range"
                value={kyc.income_range_start && kyc.income_range_end
                  ? `${kyc.income_range_start.toLocaleString()} - ${kyc.income_range_end.toLocaleString()}`
                  : (kyc.income_range_start ? `${kyc.income_range_start.toLocaleString()}+` : null)
                }
              />
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
