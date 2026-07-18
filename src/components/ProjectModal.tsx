import { ExternalLink, Github, X } from "lucide-react";
import { Project } from "../data/projects";

type Props = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectModal({ project, onClose }: Props) {
  if (!project) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p>{project.organization}</p>
            <h3 id="project-modal-title">{project.title}</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close project details">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {project.caseStudy ? (
            <>
              <h4>Project Overview</h4>
              <p>{project.caseStudy.problem}</p>
              {project.caseStudy.plainEnglish ? (
                <p className="plain-english-callout">
                  <strong>In practice:</strong> {project.caseStudy.plainEnglish}
                </p>
              ) : null}
              <h4>Approach</h4>
              <ul>
                {project.caseStudy.approach.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Business Impact</h4>
              <div className="case-results">
                {project.caseStudy.results.map((result) => (
                  <div key={result.label}>
                    <strong>{result.value}</strong>
                    <span>{result.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4>Project Overview</h4>
              <p>{project.description}</p>
              {project.plainEnglish ? (
                <p className="plain-english-callout">
                  <strong>In practice:</strong> {project.plainEnglish}
                </p>
              ) : null}
              <h4>Product Impact</h4>
              <p>{project.metric}</p>
            </>
          )}
          <div className="tag-row">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="project-actions modal-actions">
            {project.liveUrl ? (
              <a className="btn primary" href={project.liveUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> View Live Product
              </a>
            ) : null}
            {project.githubUrl ? (
              <a className="btn light" href={project.githubUrl} target="_blank" rel="noreferrer">
                <Github size={16} /> View GitHub
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
