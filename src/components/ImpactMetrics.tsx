import { Award, CircleDollarSign } from "lucide-react";
import { impactBullets, resultMetrics } from "../data/profile";
import { SectionHeader } from "./SectionHeader";

const icons = [Award, CircleDollarSign];

export function ImpactMetrics() {
  return (
    <section id="impact" className="impact-section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Impact"
          title="Selected Product Impact"
          subtitle="Measurable outcomes across Dell Technologies, Reliance BigFlix, YsecIT, and Times Group platforms."
          inverse
        />
        <div className="metrics-grid results-grid">
          {resultMetrics.map((metric, index) => {
            const Icon = icons[index % icons.length];
            return (
              <article className="metric-card" key={metric.label}>
                <Icon size={22} />
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.source}</small>
              </article>
            );
          })}
        </div>
        <div className="impact-bullets">
          {impactBullets.map((bullet) => (
            <div key={bullet}>{bullet}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
