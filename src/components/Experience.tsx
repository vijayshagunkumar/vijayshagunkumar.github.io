import { BriefcaseBusiness } from "lucide-react";
import { experience } from "../data/experience";
import { SectionHeader } from "./SectionHeader";

export function Experience() {
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
            <article className="experience-card" key={item.company}>
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
      </div>
    </section>
  );
}
