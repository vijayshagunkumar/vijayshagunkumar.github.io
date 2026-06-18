import { Download, Github, Linkedin, Mail, Rocket } from "lucide-react";
import { impactMetrics, profile } from "../data/profile";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-bar" />
      <div className="wrap hero-layout">
        <div className="hero-copy">
          <div className="hero-pill">Available for senior product leadership conversations</div>
          <h1 id="hero-title">{profile.name}</h1>
          <p className="hero-target">{profile.targetDesignation}</p>
          <p className="hero-role">{profile.headline}</p>
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
            <a className="btn primary" href="#projects">
              <Rocket size={17} /> View Projects
            </a>
            <a className="btn ghost" href="#personal-initiatives">
              Independent Builds
            </a>
            <a className="btn light" href={profile.links.resume} target="_blank" rel="noreferrer">
              <Download size={17} /> Download Resume
            </a>
            <a className="btn ghost" href={profile.links.email}>
              <Mail size={17} /> Contact Me
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
              </div>
            ))}
          </div>
        </div>
        <aside className="hero-photo" aria-label="Profile photo and recognition">
          <img src={`${import.meta.env.BASE_URL}profile-photo.jpg`} alt="Vijay Kumar, Product Leader" />
        </aside>
      </div>
    </section>
  );
}
