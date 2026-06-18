import { CheckCircle2, Globe2, Layers3, Sparkles } from "lucide-react";
import { journey, profile, scopeOfInfluence } from "../data/profile";
import { SectionHeader } from "./SectionHeader";

const cards = [
  { icon: Layers3, title: "Enterprise Platform Builder", body: "Tax, ERP, SaaS, POS, CMS, CRM, commerce, and observability platforms." },
  { icon: Globe2, title: "Global Operating Range", body: "Product delivery across India, Japan, South America, 100+ countries, and 150 tax jurisdictions." },
  { icon: Sparkles, title: "AI-enabled Transformation", body: "Generative AI tooling, prompt products, RCA workflows, and decision intelligence." }
];

export function About() {
  return (
    <section id="about" className="section">
      <div className="wrap two-column">
        <div>
          <SectionHeader eyebrow="About" title="Product Leader at Global Scale" />
          <div className="prose">
            {profile.narrative.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ul className="highlight-list">
            {profile.highlights.map((highlight) => (
              <li key={highlight}>
                <CheckCircle2 size={18} /> {highlight}
              </li>
            ))}
          </ul>
        </div>
        <div className="stack">
          {cards.map((card) => (
            <article className="mini-card" key={card.title}>
              <card.icon size={22} />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
          <article className="mini-card scope-card">
            <CheckCircle2 size={22} />
            <h3>Scope of Influence</h3>
            <ul>
              {scopeOfInfluence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <div className="timeline-card">
            <h3>Career Journey</h3>
            {journey.map((item) => (
              <div className="journey-row" key={item.period}>
                <span>{item.period}</span>
                <strong>{item.company}</strong>
                <p>{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
