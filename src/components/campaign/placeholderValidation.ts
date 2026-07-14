import { ALLOWED_PLACEHOLDERS } from '@/types/EmailTemplateTypes';

const PLACEHOLDER_PATTERN = /{{\s*([a-z_][a-z0-9_]*)\s*}}/gi;
const ALLOWED = ALLOWED_PLACEHOLDERS.map((p) => p.token);

/**
 * Client-side mirror of the backend placeholder checks (placeholder-extractor.ts)
 * so the admin sees problems before saving. Returns human-readable issues; an
 * empty array means the body is clean.
 */
export function validatePlaceholders(body: string): Array<string> {
  const issues: Array<string> = [];

  const stripped = body.replace(PLACEHOLDER_PATTERN, '');
  for (const m of stripped.matchAll(/{{[^{}]{0,50}/g)) {
    issues.push(`Malformed placeholder: "${m[0]}"`);
  }
  for (const m of stripped.matchAll(/[^{}]{0,50}}}/g)) {
    issues.push(`Malformed placeholder: "${m[0]}"`);
  }

  const seen = new Set<string>();
  for (const match of body.matchAll(PLACEHOLDER_PATTERN)) {
    const name = match[1].toLowerCase();
    if (!seen.has(name) && !ALLOWED.includes(name)) {
      seen.add(name);
      issues.push(`Unknown placeholder: {{${name}}}`);
    }
  }

  return issues;
}
