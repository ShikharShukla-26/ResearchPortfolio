import type { SiteSettings } from '@/lib/cms/types';

function phoneTel(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:+${digits.replace(/^0/, '')}` : '';
}

export function SiteContact({ site }: { site: SiteSettings }) {
  const tel = phoneTel(site.phone);
  const hasContact = Boolean(site.email || site.phone || site.address);
  if (!hasContact) return null;

  return (
    <section className="site-contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="site-contact-heading">
        Contact
      </h2>
      {(site.email || site.phone) && (
        <p className="site-contact-line">
          {site.email ? (
            <a href={`mailto:${site.email}`}>{site.email}</a>
          ) : null}
          {site.email && site.phone ? <span className="site-contact-sep"> · </span> : null}
          {site.phone && tel ? (
            <a href={tel}>{site.phone}</a>
          ) : site.phone ? (
            <span>{site.phone}</span>
          ) : null}
        </p>
      )}
      {site.address ? (
        <p className="site-contact-address">{site.address}</p>
      ) : null}
    </section>
  );
}
