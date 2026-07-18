import { useEffect, useMemo, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AdminDashboard } from "./components/AdminDashboard";
import { About } from "./components/About";
import { Awards } from "./components/Awards";
import { Certifications } from "./components/Certifications";
import { Contact } from "./components/Contact";
import { Education } from "./components/Education";
import { Experience } from "./components/Experience";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { ImpactMetrics } from "./components/ImpactMetrics";
import { Navbar } from "./components/Navbar";
import { PersonalInitiatives } from "./components/PersonalInitiatives";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { ThemeName, profile } from "./data/profile";

const storedTheme = () => (localStorage.getItem("portfolio-theme") as ThemeName | null) ?? "navy-teal";

export default function App() {
  const [theme, setTheme] = useState<ThemeName>(storedTheme);
  const [showTop, setShowTop] = useState(false);
  const isAdmin = window.location.pathname.replace(/\/$/, "").endsWith("/admin");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.title = profile.seo.title;
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = useMemo(
    () => ["experience", "projects", "products-built", "certifications", "contact"],
    []
  );

  if (isAdmin) return <AdminDashboard />;

  return (
    <>
      <Navbar sections={sections} />
      <main>
        <Hero />
        <About />
        <ImpactMetrics />
        <Experience />
        <Projects />
        <PersonalInitiatives />
        <Skills />
        <Education />
        <Certifications />
        <Awards />
        <Contact />
      </main>
      <Footer />
      <button
        className={`scroll-top ${showTop ? "show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>
    </>
  );
}
