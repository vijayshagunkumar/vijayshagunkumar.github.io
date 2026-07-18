import { ExternalLink, Github } from "lucide-react";
import { personalProjects } from "../data/personalProjects";
import { SectionHeader } from "./SectionHeader";

export function PersonalInitiatives() {
  return (
    <section id="products-built" className="section muted compact-section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Independent Product Builds"
          title="Products I've Built"
          subtitle="AI products, internal enterprise tools, and independent builds that demonstrate product thinking, workflow design, and measurable adoption."
        />
        <div className="personal-grid">
          {personalProjects.map((project) => (
            <article className="personal-card" key={project.id}>
              <div className="project-topline">
                <span>{project.status}</span>
                <strong>{project.availability ?? "Self-built"}</strong>
              </div>
              <h3>{project.name}</h3>
              <p className="personal-value">{project.valueProposition}</p>
              <dl className="personal-meta">
                <div>
                  <dt>Problem</dt>
                  <dd>{project.problemSolved}</dd>
                </div>
                <div>
                  <dt>Users</dt>
                  <dd>{project.targetUsers}</dd>
                </div>
              </dl>
              <ul>
                {project.highlights.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="tag-row">
                {project.techHighlights.slice(0, 2).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="project-actions">
                {project.liveUrl ? (
                  <a className="btn primary" href={project.liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} /> Live Demo
                  </a>
                ) : (
                  <span className="btn light disabled-link">Internal Tool</span>
                )}
                {project.githubUrl ? (
                  <a className="btn light" href={project.githubUrl} target="_blank" rel="noreferrer">
                    <Github size={16} /> GitHub
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
