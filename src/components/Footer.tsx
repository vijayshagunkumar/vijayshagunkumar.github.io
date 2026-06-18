import { profile } from "../data/profile";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>Vijay Kumar</span>
        <nav aria-label="Footer navigation">
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={profile.links.email}>Email</a>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.links.phone}>Phone</a>
          <a href={profile.links.resume} target="_blank" rel="noreferrer">
            Resume
          </a>
        </nav>
        <small>© 2026 Vijay Kumar - Product Leader</small>
      </div>
    </footer>
  );
}
