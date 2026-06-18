import { BadgeCheck } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { certifications, credentialProfiles } from "../data/certifications";
import { SectionHeader } from "./SectionHeader";

export function Certifications() {
  return (
    <section id="certifications" className="section muted">
      <div className="wrap">
        <SectionHeader eyebrow="Certifications" title="Executive Learning & Certifications" />
        <div className="compact-grid three">
          {certifications.map((item) => (
            <a className="compact-card linked-card" key={item.title} href={item.url} target="_blank" rel="noreferrer">
              <BadgeCheck size={23} />
              <h3>{item.title}</h3>
              <p>{item.issuer}</p>
              <span>
                {item.year} · View Credential <ExternalLink size={13} />
              </span>
            </a>
          ))}
        </div>
        <div className="credential-links" aria-label="Credential profile links">
          {credentialProfiles.map((profile) => (
            <a key={profile.label} href={profile.url} target="_blank" rel="noreferrer">
              {profile.label} <ExternalLink size={13} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
