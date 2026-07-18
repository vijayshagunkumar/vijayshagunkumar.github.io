import { Download, Github, Linkedin, Rocket } from "lucide-react";
import { impactMetrics, profile, profilePhoto } from "../data/profile";
import { sectionHref } from "../utils/routes";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-bar" />
      <div className="wrap hero-layout">
        <div className="hero-copy">
          <div className="hero-pill">Open to VP / Director Product Roles</div>
          <p className="hero-name">{profile.name}</p>
          <h1 id="hero-title">{profile.headline}</h1>
          <div className="executive-summary" aria-label="Executive summary">
            {profile.executiveSummary.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="target-roles" aria-label="Target roles">
            {profile.targetRoles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
          <div className="hero-actions">
            <a className="btn light" href={profile.links.resume} target="_blank" rel="noreferrer">
              <Download size={17} /> Download Resume
            </a>
            <a className="btn primary" href={sectionHref("experience")}>
              View Experience
            </a>
            <a className="btn ghost" href={sectionHref("products-built")}>
              <Rocket size={17} /> Products I've Built
            </a>
            <a className="icon-link" href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={19} />
            </a>
            <a className="icon-link" href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github size={19} />
            </a>
          </div>
          <div className="hero-stats">
            {impactMetrics.map((metric) => (
              <div className="stat" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.source}</small>
              </div>
            ))}
          </div>
        </div>
        <aside className="hero-photo" aria-label="Profile photo and recognition">
          <img
            src={profilePhoto}
            width="300"
            height="400"
            alt="Vijay Kumar, senior product and enterprise platform leader"
            loading="eager"
          />
        </aside>
      </div>
    </section>
  );
}
