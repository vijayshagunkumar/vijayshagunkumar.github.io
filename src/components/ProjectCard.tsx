import { ExternalLink, Github, Layers3 } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Project } from "../data/projects";

type Props = {
  project: Project;
  onViewDetails: () => void;
};

export function ProjectCard({ project, onViewDetails }: Props) {
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewDetails();
    }
  };

  return (
    <article
      className={`project-card clickable-card ${project.featured ? "featured" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      title="Click card to view details"
      onClick={onViewDetails}
      onKeyDown={handleCardKeyDown}
    >
      <div className="project-topline">
        <span>{project.organization}</span>
        {project.featured ? <strong>Featured</strong> : null}
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-metric">{project.metric}</div>
      <div className="tag-row">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="project-actions">
        <button
          className="text-button"
          onClick={(event) => {
            event.stopPropagation();
            onViewDetails();
          }}
          type="button"
        >
          <Layers3 size={16} /> {project.caseStudy ? "View Case Study" : "View Details"}
        </button>
        {project.liveUrl ? (
          <a
            className="text-button"
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            <ExternalLink size={16} /> Live Demo
          </a>
        ) : null}
        {project.githubUrl ? (
          <a
            className="text-button"
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            <Github size={16} /> GitHub
          </a>
        ) : null}
      </div>
    </article>
  );
}
