import { BriefcaseBusiness, X } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { experience } from "../data/experience";
import { SectionHeader } from "./SectionHeader";

type ExperienceItem = (typeof experience)[number];

function ExperienceModal({ item, onClose }: { item: ExperienceItem | null; onClose: () => void }) {
  if (!item) return null;
  const details = item.details;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="project-modal experience-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="experience-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p>{item.period} · {item.company}</p>
            <h3 id="experience-modal-title">{item.role}</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close experience details">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <h4>Executive Scope</h4>
          <p>{details?.overview ?? item.summary}</p>

          {details ? (
            <>
              <div className="experience-detail-grid">
                <article>
                  <h4>Scope</h4>
                  <ul>
                    {details.scope.map((scope) => (
                      <li key={scope}>{scope}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h4>Responsibilities</h4>
                  <ul>
                    {details.responsibilities.map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                </article>
              </div>
              <h4>Measured Impact</h4>
              <ul className="modal-highlight-list">
                {details.impact.map((impact) => (
                  <li key={impact}>{impact}</li>
                ))}
              </ul>
              <h4>Tools, Platforms & Domains</h4>
              <div className="tag-row tech-stack-row">
                {details.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4>Key Achievements</h4>
              <ul>
                {item.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
              <h4>Domains</h4>
              <div className="tag-row">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export function Experience() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const selectedItem = experience.find((item) => item.company === selectedCompany) ?? null;

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, company: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedCompany(company);
    }
  };

  return (
    <section id="experience" className="section muted">
      <div className="wrap">
        <SectionHeader
          eyebrow="Experience"
          title="Professional Experience"
          subtitle="A recruiter-friendly view of platform scope, operating model, and measurable delivery."
        />
        <div className="experience-list">
          {experience.map((item) => (
            <article
              className="experience-card clickable-card"
              key={item.company}
              role="button"
              tabIndex={0}
              aria-label={`View leadership details for ${item.role} at ${item.company}`}
              title="Click to view leadership scope, impact, and platform details"
              onClick={() => setSelectedCompany(item.company)}
              onKeyDown={(event) => handleCardKeyDown(event, item.company)}
            >
              <div className="experience-icon">
                <BriefcaseBusiness size={22} />
              </div>
              <div>
                <div className="experience-meta">{item.period}</div>
                <h3>{item.role}</h3>
                <h4>{item.company}</h4>
                <p>{item.summary}</p>
                <ul>
                  {item.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
                <div className="tag-row">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <ExperienceModal item={selectedItem} onClose={() => setSelectedCompany(null)} />
      </div>
    </section>
  );
}
