export type ThemeName = "navy-teal" | "light-executive" | "dark-elegant" | "minimal-recruiter";

export const themes: Array<{ id: ThemeName; label: string }> = [
  { id: "navy-teal", label: "Professional Navy/Teal" },
  { id: "light-executive", label: "Light Executive" },
  { id: "dark-elegant", label: "Dark Elegant" },
  { id: "minimal-recruiter", label: "Minimal Recruiter" }
];

export const profile = {
  name: "Vijay Kumar",
  headline: "VP/Director Product Leader | Enterprise Platforms, OTT Pioneer & Global Tax Tech",
  targetDesignation: "Aspiring VP / Director - Product Management",
  shortHeadline: "Product & Platform Leader",
  location: "India",
  targetRoles: [
    "Director Product",
    "VP Product",
    "Finance Transformation",
    "Enterprise Platforms",
    "AI-enabled Transformation",
    "Global Product Leadership"
  ],
  summary:
    "20+ years building digital platforms across tax technology, OTT, retail POS, ERP, SaaS, and cross-border commerce. Currently leading Dell's global Indirect Tax technology portfolio across 100+ countries and 150 tax jurisdictions.",
  executiveSummary: [
    "Senior product and platform leader across finance transformation, enterprise systems, OTT, retail, and AI-enabled operations.",
    "Built and modernized platforms from 0 to 1 launches through global enterprise scale.",
    "Targeting VP/Director Product roles where product strategy, execution rigor, and transformation leadership matter."
  ],
  narrative: [
    "Accomplished Product Leader with 20+ years of experience building digital platforms that span industries, geographies, and product stages. The journey began in retail technology, leading the nationwide rollout of POS and inventory systems across 100+ Planet M music stores, then scaled to building India's first subscription OTT platform, Reliance BigFlix, from scratch.",
    "At Dell, played a key role in enterprise finance modernization by integrating Oracle Fusion ERP, migrating from on-prem Sabrix to TR OneSource Cloud, and executing a zero-downtime migration of 10M+ customer exemption records with full SOX compliance.",
    "Architected a middleware tax enrichment layer serving 100+ enterprise applications, built the 0 to 1 tax exemption management platform, and led global CERTifyTax rollout across Deloitte, Thomson Reuters, and CERTifyTax vendor ecosystems."
  ],
  highlights: [
    "0 to 1 pioneer across BigFlix, Planet M retail tech rollout, and multiple enterprise platforms",
    "Cloud and AI modernization experience across Oracle Fusion ERP, TR OneSource Cloud, CERTifyTax, and generative AI observability",
    "Global delivery across 6+ industries, 3 continents, 100+ countries, and 150 tax jurisdictions",
    "Executive-level stakeholder alignment across Finance, Tax Operations, Legal, Engineering, vendors, and business teams"
  ],
  links: {
    email: "mailto:vijay.shagunkumar@gmail.com",
    emailLabel: "vijay.shagunkumar@gmail.com",
    linkedin: "https://www.linkedin.com/in/vshn",
    linkedinLabel: "linkedin.com/in/vshn",
    github: "https://github.com/vijayshagunkumar",
    githubLabel: "github.com/vijayshagunkumar",
    resume: `${import.meta.env.BASE_URL}resume.pdf`,
    phone: "tel:+917738774442",
    phoneLabel: "+91 77387 74442"
  },
  seo: {
    title: "Vijay Kumar | VP Product Leader | Enterprise Platforms, OTT Pioneer & Global Tax Tech",
    description:
      "Vijay Kumar portfolio for VP/Director Product leadership across enterprise platforms, finance transformation, AI-enabled transformation, OTT, Dell global tax tech, 100+ countries and 150 tax jurisdictions.",
    canonical: "https://vijayshagunkumar.github.io"
  }
};

export const impactMetrics = [
  { value: "20+", label: "Years Product Leadership" },
  { value: "100+", label: "Countries Enabled" },
  { value: "150", label: "Tax Jurisdictions" },
  { value: "10M+", label: "Records Migrated" },
  { value: "300K+", label: "Annual Tax Transactions" },
  { value: "99.6%", label: "Processing Improvement" }
];

export const impactBullets = [
  "99.6% processing efficiency improvement for Dell global tax operations",
  "$50K+ annual savings through cloud-based transaction simulation and optimization",
  "Zero-downtime 10M+ customer exemption record migration with SOX compliance",
  "100+ enterprise applications decoupled from direct tax engine complexity",
  "Built India's first subscription OTT platform systems at BigFlix",
  "Dell Game Changers Award 2023 and Dell Learning Exchange Rockstar 2025"
];

export const journey = [
  { period: "2002-2007", company: "Times Group - Planet M", role: "Retail technology rollout across 100+ stores" },
  { period: "2007-2014", company: "Reliance - BigFlix", role: "Built OTT, CMS, CRM, ERP, ecommerce and POS platforms" },
  { period: "2014-2016", company: "E-Creation / Digital Publishing", role: "Led multimedia publishing and education technology delivery" },
  { period: "2017-2020", company: "YsecIT", role: "Delivered ERP, POS, forestry, trade, restaurant, and SaaS platforms" },
  { period: "2021-Present", company: "Dell Technologies", role: "Global Indirect Tax product portfolio and finance modernization" }
];
