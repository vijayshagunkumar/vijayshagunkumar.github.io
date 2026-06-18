import { domains, skillGroups } from "../data/skills";
import { SectionHeader } from "./SectionHeader";

export function Skills() {
  return (
    <section id="skills" className="section muted">
      <div className="wrap">
        <SectionHeader
          eyebrow="Skills"
          title="Competencies & Domains"
          subtitle="A fast scan of product leadership strengths, platform domains, and operating tools."
        />
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-card" key={group.title}>
              <h3>{group.title}</h3>
              <div className="tag-row">
                {group.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="domain-grid">
          {domains.map((domain) => (
            <article className="domain-card" key={domain.name}>
              <h3>{domain.name}</h3>
              <p>{domain.years}</p>
              <div className="tag-row">
                {domain.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
