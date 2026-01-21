interface SubmittedInfo {
  full_name: string;
  date_of_birth: string;
  document_number: string;
  nationality: string;
  issue_date: string;
  expiry_date: string;
}

interface KycSubmittedInformationProps {
  info: SubmittedInfo;
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function KycSubmittedInformation({ info }: KycSubmittedInformationProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-base font-semibold mb-4">Submitted Information</h3>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <InfoItem label="Full Name" value={info.full_name} />
        <InfoItem label="Date of Birth" value={info.date_of_birth} />
        <InfoItem label="Document Number" value={info.document_number} />
        <InfoItem label="Nationality" value={info.nationality} />
        <InfoItem label="Issue Date" value={info.issue_date} />
        <InfoItem label="Expiry Date" value={info.expiry_date} />
      </div>
    </div>
  );
}
