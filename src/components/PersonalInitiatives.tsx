import { ExternalLink, Github } from "lucide-react";
import { personalProjects } from "../data/personalProjects";
import { SectionHeader } from "./SectionHeader";

export function PersonalInitiatives() {
  return (
    <section id="personal-initiatives" className="section muted compact-section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Independent Product Builds"
          title="Personal Initiative Projects"
          subtitle="Self-built product initiatives that demonstrate AI product thinking, practical workflow design, and fast experimentation."
        />
        <div className="personal-grid">
          {personalProjects.map((project) => (
            <article className="personal-card" key={project.id}>
              <div className="project-topline">
                <span>{project.status}</span>
                <strong>Self-built</strong>
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
                <a className="btn primary" href={project.liveUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Live Demo
                </a>
                {project.githubUrl ? (
                  <a className="btn light" href={project.githubUrl} target="_blank" rel="noreferrer">
                    <Github size={16} /> GitHub
                  </a>
                ) : (
                  <button className="btn light disabled-btn" type="button" disabled>
                    <Github size={16} /> GitHub Soon
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
