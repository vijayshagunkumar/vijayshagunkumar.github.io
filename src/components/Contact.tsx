import { Download, Github, Linkedin, Mail, Phone } from "lucide-react";
import { profile } from "../data/profile";
import { SectionHeader } from "./SectionHeader";

export function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Contact"
          title="Let's Talk About Platform-Scale Product Leadership"
          subtitle="Best fit: Director/VP Product, finance transformation, enterprise platforms, AI-enabled operating models, and global product leadership."
          inverse
        />
        <div className="contact-grid">
          <a href={profile.links.email} className="contact-card">
            <Mail size={24} />
            <span>Email</span>
            <strong>{profile.links.emailLabel}</strong>
          </a>
          <a href={profile.links.linkedin} className="contact-card" target="_blank" rel="noreferrer">
            <Linkedin size={24} />
            <span>LinkedIn</span>
            <strong>{profile.links.linkedinLabel}</strong>
          </a>
          <a href={profile.links.github} className="contact-card" target="_blank" rel="noreferrer">
            <Github size={24} />
            <span>GitHub</span>
            <strong>{profile.links.githubLabel}</strong>
          </a>
          <a href={profile.links.phone} className="contact-card">
            <Phone size={24} />
            <span>Phone</span>
            <strong>{profile.links.phoneLabel}</strong>
          </a>
          <a href={profile.links.resume} className="contact-card" target="_blank" rel="noreferrer">
            <Download size={24} />
            <span>Resume</span>
            <strong>Download PDF</strong>
          </a>
        </div>
      </div>
    </section>
  );
}
