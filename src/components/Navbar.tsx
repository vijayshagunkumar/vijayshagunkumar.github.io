import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import { sectionHref } from "../utils/routes";

type Props = {
  sections: string[];
};

export function Navbar({ sections }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a className="nav-brand" href={sectionHref("hero")} aria-label="Go to top">
        Vijay Kumar<span>.</span>
      </a>
      <button className="mobile-menu" onClick={() => setOpen((current) => !current)} aria-label="Toggle navigation">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={open ? "open" : ""} aria-label="Main navigation">
        {sections.map((section) => (
          <a key={section} href={sectionHref(section)} onClick={() => setOpen(false)}>
            {section === "products-built"
              ? "Products I've Built"
              : section[0].toUpperCase() + section.slice(1)}
          </a>
        ))}
        <a className="nav-pill" href={profile.links.resume} target="_blank" rel="noreferrer">
          Resume
        </a>
      </nav>
    </header>
  );
}
