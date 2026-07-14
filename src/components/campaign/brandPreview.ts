/**
 * Sample values used to render the live preview. Mirrors the backend
 * `buildReplacements` shape so the admin sees roughly what recipients get.
 */
const SAMPLE_REPLACEMENTS: Record<string, string> = {
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  coffer_id: 'CFR-482913',
  brand_name: 'Coffer',
  support_email: 'support@utilour.ng',
  ngn_wallet_balance: '125,400.00',
  usdt_wallet_balance: '310.50',
  ngn_locker_balance: '80,000.00',
  usdt_locker_balance: '150.00',
  ngn_coffer_balance: '250,000.00',
  usdt_coffer_balance: '500.00',
  ngn_total_balance: '455,400.00',
  usdt_total_balance: '960.50',
  ngn_interest_earned: '12,340.00',
  usdt_interest_earned: '28.75',
};

function applyReplacements(input: string): string {
  return input.replace(
    /{{\s*([a-z_][a-z0-9_]*)\s*}}/gi,
    (_m, name: string) => SAMPLE_REPLACEMENTS[name.toLowerCase()] ?? '',
  );
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Wrap the editor's body HTML in the Coffer brand layout (header + footer with
 * links) for the preview iframe. Kept visually in sync with the backend
 * `campaign.wrapper.html`.
 */
export function buildBrandPreviewDoc(subject: string, bodyHtml: string): string {
  const body = applyReplacements(bodyHtml);
  const subj = applyReplacements(subject) || 'Subject preview';

  const logo =
    'https://res.cloudinary.com/da3wqzkz3/image/authenticated/s--B1gu3rFf--/v1784063793/coffer/hqszoroqouidewiwhssw.png';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml(subj)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:0;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;">
      <tr><td style="background:#2B3990;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
      <tr><td style="background:#ffffff;padding:24px 32px;border-bottom:1px solid #eceef3;"><img src="${logo}" alt="Coffer" height="30" style="display:block;height:30px;border:0;" /></td></tr>
      <tr><td style="padding:32px;color:#1a1c23;font-size:16px;line-height:1.6;">${body}</td></tr>
      <tr><td style="padding:24px 32px;border-top:1px solid #eceef3;color:#8a90a2;font-size:13px;line-height:1.5;">
        <p style="margin:0 0 6px;">You're receiving this because you have a Coffer account.</p>
        <p style="margin:0;">
          <a href="mailto:${SAMPLE_REPLACEMENTS.support_email}" style="color:#2B3990;text-decoration:underline;">Contact support</a>
          &nbsp;&middot;&nbsp;
          <a href="#" style="color:#8a90a2;text-decoration:underline;">Notification settings</a>
        </p>
        <p style="margin:8px 0 0;">&copy; ${new Date().getFullYear()} Coffer. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
