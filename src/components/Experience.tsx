import { BriefcaseBusiness, Maximize2, X } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { experience } from "../data/experience";
import { SectionHeader } from "./SectionHeader";

type ExperienceItem = (typeof experience)[number];

function ExperienceModal({ item, onClose }: { item: ExperienceItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;
  const details = item.details;
  const detailCategories = details
    ? [
        { label: "Product Leadership", items: [details.scope[0], details.responsibilities[0]].filter(Boolean) },
        { label: "Customer Discovery & Problem Framing", items: [details.scope[1], details.responsibilities[1]].filter(Boolean) },
        { label: "Strategy, Roadmap & Governance", items: details.responsibilities.slice(2, 4) },
        { label: "Delivery & Stakeholder Operating Model", items: details.scope.slice(2) }
      ].filter((category) => category.items.length)
    : [];

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
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close experience details" title="Close details (Esc)">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <h4>Executive Scope</h4>
          <p>{details?.overview ?? item.summary}</p>
          {details?.flagshipAchievement ? (
            <p className="flagship-achievement">
              <strong>Modernization highlight:</strong> {details.flagshipAchievement.replace(/^Flagship achievement:\s*/i, "")}
            </p>
          ) : null}

          {details ? (
            <>
              <div className="experience-category-list">
                {detailCategories.map((category) => (
                  <section className="experience-category" key={category.label}>
                    <h4>{category.label}</h4>
                    <ul>
                      {category.items.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </section>
                ))}
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
              <span className="card-open-hint" aria-hidden="true">
                <Maximize2 size={15} />
              </span>
              <div className="experience-icon">
                <BriefcaseBusiness size={22} />
              </div>
              <div>
                <div className="experience-meta">{item.period}</div>
                <h3>{item.role}</h3>
                <h4>{item.company}</h4>
                <p>{item.summary}</p>
                {item.achievements[0] ? (
                  <p className="experience-card-highlight">
                    <strong>Highlighted impact:</strong> {item.achievements[0]}
                  </p>
                ) : null}
                <ul>
                  {item.achievements.slice(1).map((achievement) => (
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
