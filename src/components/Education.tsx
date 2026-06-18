import { GraduationCap } from "lucide-react";
import { education } from "../data/education";
import { SectionHeader } from "./SectionHeader";

export function Education() {
  return (
    <section id="education" className="section">
      <div className="wrap">
        <SectionHeader eyebrow="Education" title="Education" />
        <div className="compact-grid">
          {education.map((item) => (
            <article className="compact-card" key={item.degree}>
              <GraduationCap size={24} />
              <h3>{item.degree}</h3>
              <p>{item.school}</p>
              <span>{item.meta}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
