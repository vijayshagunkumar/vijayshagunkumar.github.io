import { useMemo, useState } from "react";
import { projectCategories, projects } from "../data/projects";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { SectionHeader } from "./SectionHeader";

export function Projects() {
  const [category, setCategory] = useState<(typeof projectCategories)[number]>("All");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredProjects = useMemo(
    () => (category === "All" ? projects : projects.filter((project) => project.categories.includes(category))),
    [category]
  );

  const visibleProjects = category === "All" && !showAll ? filteredProjects.slice(0, 6) : filteredProjects;

  return (
    <section id="projects" className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Projects"
          title="Corporate & Work Projects"
          subtitle="Enterprise, finance transformation, OTT, ERP, retail, and platform delivery work. Independent product builds are separated below."
        />
        <div className="filter-bar" role="list" aria-label="Project filters">
          {projectCategories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => {
                setCategory(item);
                setShowAll(false);
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="project-grid">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={() => setSelectedProjectId(project.id)}
            />
          ))}
        </div>
        {category === "All" && filteredProjects.length > visibleProjects.length ? (
          <div className="section-action">
            <button className="btn light" type="button" onClick={() => setShowAll(true)}>
              Show All Corporate Projects ({filteredProjects.length})
            </button>
          </div>
        ) : null}
        {category === "All" && showAll ? (
          <div className="section-action">
            <button className="text-button" type="button" onClick={() => setShowAll(false)}>
              Show Featured First
            </button>
          </div>
        ) : null}
        <ProjectModal
          project={projects.find((project) => project.id === selectedProjectId) ?? null}
          onClose={() => setSelectedProjectId(null)}
        />
      </div>
    </section>
  );
}
