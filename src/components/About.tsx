import { BriefcaseBusiness, CheckCircle2, Clapperboard, Cpu, Globe2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { journey, profile, scopeOfInfluence } from "../data/profile";
import { SectionHeader } from "./SectionHeader";

const cards = [
  { icon: Layers3, title: "Enterprise Platform Builder", body: "Tax, ERP, SaaS, POS, CMS, CRM, commerce, and observability platforms." },
  { icon: Globe2, title: "Global Operating Range", body: "Product delivery across India, Japan, South America, 100+ countries, and 150 tax jurisdictions." },
  { icon: Sparkles, title: "AI-enabled Transformation", body: "Generative AI tooling, prompt products, RCA workflows, and decision intelligence." }
];

const leadershipThemes = [
  {
    icon: ShieldCheck,
    title: "Enterprise Platforms",
    detail: "Modernized global finance, tax, ERP, and operational systems where auditability, scale, and reliability matter."
  },
  {
    icon: Cpu,
    title: "AI & Product Builds",
    detail: "Built applied AI products and internal copilots that convert knowledge, workflows, and decisions into usable product experiences."
  },
  {
    icon: Clapperboard,
    title: "Media, Retail & Commerce",
    detail: "Launched and scaled OTT, POS, inventory, catalog, CRM, and subscription-commerce platforms across complex operating environments."
  }
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
              <div className="card-text-panel">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </article>
          ))}
          <article className="mini-card scope-card">
            <CheckCircle2 size={22} />
            <div className="card-text-panel">
              <h3>Scope of Influence</h3>
              <ul>
                {scopeOfInfluence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
      <div className="wrap">
        <div className="leadership-themes" aria-label="Product leadership themes">
          {leadershipThemes.map((theme) => (
            <article className="leadership-theme" key={theme.title}>
              <theme.icon size={20} />
              <div className="card-text-panel">
                <h3>{theme.title}</h3>
                <p>{theme.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="timeline-card journey-card journey-card-horizontal">
          <div className="journey-card-head">
            <BriefcaseBusiness size={22} />
            <div>
              <span>Career Journey</span>
              <h3>20+ Years of Product & Platform Leadership</h3>
            </div>
          </div>
          <div className="journey-lane" aria-label="Career journey timeline">
            {journey.map((item, index) => (
              <article className="journey-node" key={item.period}>
                <div className="journey-year">{item.period}</div>
                <div className="journey-dot" aria-hidden="true">
                  <span>{index + 1}</span>
                </div>
                <div className="journey-node-card">
                  <div className="card-text-panel">
                    <strong>{item.company}</strong>
                    <p>{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
