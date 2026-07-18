import { ExternalLink, Github, X } from "lucide-react";
import { useState } from "react";
import { PersonalProject, personalProjects } from "../data/personalProjects";
import { SectionHeader } from "./SectionHeader";

function ProductModal({ project, onClose }: { project: PersonalProject | null; onClose: () => void }) {
  if (!project) return null;
  const techStack = project.techStack ?? [];

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="project-modal product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p>{project.status} · {project.availability ?? "Self-built"}</p>
            <h3 id="product-modal-title">{project.name}</h3>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close product details">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <h4>Value Proposition</h4>
          <p>{project.valueProposition}</p>
          <div className="product-detail-grid">
            <article>
              <h4>Problem Solved</h4>
              <p>{project.problemSolved}</p>
            </article>
            <article>
              <h4>Target Users</h4>
              <p>{project.targetUsers}</p>
            </article>
            {project.solution ? (
              <article>
                <h4>Solution</h4>
                <p>{project.solution}</p>
              </article>
            ) : null}
            {project.whyItMatters ? (
              <article>
                <h4>Why It Matters</h4>
                <p>{project.whyItMatters}</p>
              </article>
            ) : null}
          </div>
          <h4>Product Highlights</h4>
          <ul>
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h4>Tech / Product Capabilities</h4>
          <div className="tag-row">
            {project.techHighlights.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h4>Tech Stack</h4>
          {techStack.length ? (
            <div className="tag-row tech-stack-row">
              {techStack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : (
            <p className="modal-note">Tech stack details are not documented yet.</p>
          )}
          {project.demoNote ? <p className="demo-note">{project.demoNote}</p> : null}
          <div className="project-actions modal-actions">
            {project.liveUrl ? (
              <a className="btn primary" href={project.liveUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> View Live Product
              </a>
            ) : (
              <span className="btn light disabled-link">Internal Tool</span>
            )}
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

export function PersonalInitiatives() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedProduct = personalProjects.find((project) => project.id === selectedProductId) ?? null;

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
            <article
              className="personal-card clickable-card"
              key={project.id}
              role="button"
              tabIndex={0}
              title="Click card to view tech stack and other details"
              onClick={() => setSelectedProductId(project.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedProductId(project.id);
                }
              }}
            >
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
              <div className="project-actions" onClick={(event) => event.stopPropagation()}>
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
              {project.demoNote ? <p className="demo-note card-demo-note">{project.demoNote}</p> : null}
            </article>
          ))}
        </div>
        <ProductModal project={selectedProduct} onClose={() => setSelectedProductId(null)} />
      </div>
    </section>
  );
}
