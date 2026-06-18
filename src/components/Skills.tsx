import { BarChart3, Boxes, BrainCircuit, BriefcaseBusiness, CloudCog, Film, Globe2, Landmark, LineChart, LucideIcon, ShoppingBag, Sparkles, Wrench } from "lucide-react";
import { domains, skillGroups } from "../data/skills";
import { SectionHeader } from "./SectionHeader";

const skillIcons: Record<string, LucideIcon> = {
  "Product Strategy & Execution": BriefcaseBusiness,
  "Product Analytics & Data": BarChart3,
  "Platforms & Domains": Boxes,
  "Tools & Technologies": Wrench
};

const domainIcons: Record<string, LucideIcon> = {
  "Enterprise Tax Technology": Landmark,
  "OTT & Digital Media": Film,
  "Retail POS & Commerce": ShoppingBag,
  "Cross-Border Trade & ERP": Globe2,
  "AI & Emerging Tech": BrainCircuit,
  "ERP & Cloud Migration": CloudCog
};

function VisibleTags({ items }: { items: string[] }) {
  const visible = items.slice(0, 4);
  const more = items.length - visible.length;
  return (
    <div className="tag-row">
      {visible.map((item) => (
        <span key={item}>{item}</span>
      ))}
      {more > 0 ? <span className="more-tag">+{more} more</span> : null}
    </div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="section muted">
      <div className="wrap">
        <SectionHeader
          eyebrow="Skills"
          title="Competencies & Domains"
          subtitle="A fast scan of product leadership strengths, platform domains, and operating tools."
        />
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-card capability-card" key={group.title}>
              <div className="capability-head">
                {(() => {
                  const Icon = skillIcons[group.title] ?? Sparkles;
                  return <Icon size={21} />;
                })()}
                <h3>{group.title}</h3>
              </div>
              <VisibleTags items={group.skills} />
            </article>
          ))}
        </div>
        <div className="domain-grid">
          {domains.map((domain) => (
            <article className="domain-card capability-card" key={domain.name}>
              <div className="capability-head">
                {(() => {
                  const Icon = domainIcons[domain.name] ?? LineChart;
                  return <Icon size={21} />;
                })()}
                <h3>{domain.name}</h3>
              </div>
              <p>{domain.years}</p>
              <VisibleTags items={domain.tags} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
