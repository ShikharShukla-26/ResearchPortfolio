/** Default brief/full URLs from resume PDF hyperlinks (CMS overrides when set). */
export const RESEARCH_DOCUMENT_DEFAULTS: Record<
  string,
  { briefUrl: string; fullUrl: string }
> = {
  'six-week-silence': {
    briefUrl:
      'https://shikharshukla26.substack.com/p/research-project-001-the-six-week',
    fullUrl:
      'https://docs.google.com/document/d/1ln9ZmSYoq51CgS51H_S1xh8EjrJb9bLS/view'
  },
  zipcar: {
    briefUrl:
      'https://docs.google.com/presentation/d/1wSTen9i5dZ06_fcMTsxV-GU3ZJQv2RXx/view',
    fullUrl:
      'https://docs.google.com/presentation/d/1rPqm54lZRCnCmpSDettAXGx5mGV_9Chi/view'
  },
  decathlon: {
    briefUrl:
      'https://docs.google.com/presentation/d/1Q62OPmQoQfo__Y69-W7E7E98vAr7Zivi/view',
    fullUrl:
      'https://docs.google.com/presentation/d/1U7iHwHeZ4aAhJ4Su8pA_Pwx_pkZ-dVb-/view'
  },
  wise: {
    briefUrl:
      'https://docs.google.com/presentation/d/1ST54bL8Z7IWPabXGi6kPvpL0kLD0xOXd/view',
    fullUrl:
      'https://docs.google.com/document/d/1iomDHdY3jA-S0iMA7nJts3L1yA1mdAne/view'
  },
  'surface-compliance': {
    briefUrl: '',
    fullUrl:
      'https://docs.google.com/document/d/1ZQCCOqf4Nv_Mra81kt2GAYhkefNhMsD_/view'
  },
  'surface-compliance-exit-arc': {
    briefUrl: '',
    fullUrl:
      'https://docs.google.com/document/d/1sKPgBmv5R_f1Biq89hbPJRmHFVFAPbOt/view'
  }
};

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function resolveResearchDocumentUrls(
  slug: string,
  briefUrl: string,
  fullUrl: string
): { briefUrl: string; fullUrl: string } {
  const defaults = RESEARCH_DOCUMENT_DEFAULTS[slug];
  return {
    briefUrl: briefUrl.trim() || defaults?.briefUrl || '',
    fullUrl: fullUrl.trim() || defaults?.fullUrl || ''
  };
}

/** Show Brief/Full modal only when both URLs exist and differ. */
export function researchHasVersionChoice(
  briefUrl: string,
  fullUrl: string
): boolean {
  const brief = normalizeUrl(briefUrl);
  const full = normalizeUrl(fullUrl);
  return Boolean(brief && full && brief !== full);
}

/** Single external URL for direct open (prefers full). */
export function researchSingleExternalUrl(
  briefUrl: string,
  fullUrl: string
): string {
  const full = normalizeUrl(fullUrl);
  const brief = normalizeUrl(briefUrl);
  return full || brief;
}

/** Prefer full document for direct /work/[slug] visits. */
export function researchExternalRedirectUrl(
  slug: string,
  briefUrl = '',
  fullUrl = ''
): string {
  const resolved = resolveResearchDocumentUrls(slug, briefUrl, fullUrl);
  return researchSingleExternalUrl(resolved.briefUrl, resolved.fullUrl);
}
