import { Trophy } from "lucide-react";
import { awards } from "../data/awards";
import { SectionHeader } from "./SectionHeader";

export function Awards() {
  return (
    <section id="awards" className="section">
      <div className="wrap">
        <SectionHeader eyebrow="Awards" title="Recognition" />
        <div className="compact-grid">
          {awards.map((award) => (
            <article className="compact-card" key={award.title}>
              <Trophy size={24} />
              <h3>{award.title}</h3>
              <span>{award.year}</span>
              <p>{award.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
