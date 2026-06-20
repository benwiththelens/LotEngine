/**
 * Shared utility to build domain-aware links.
 * If not on the marketing domain, the path is returned directly.
 * If on the marketing domain, the path is prefixed with the tenant domain.
 */
export function getLink(path: string, domain: string, isMarketingDomain: boolean): string {
  if (!isMarketingDomain) return path;
  return `/${domain}${path === '/' ? '' : path}`;
}
