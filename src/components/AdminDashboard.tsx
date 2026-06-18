import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Copy,
  Eye,
  GripVertical,
  Image,
  KeyRound,
  Laptop,
  Plus,
  RotateCcw,
  Rocket,
  Save,
  Search,
  Smartphone,
  Tablet,
  Trash2,
  Upload
} from "lucide-react";
import { ChangeEvent, ReactNode, useMemo, useState } from "react";
import {
  ContentKey,
  contentDefaults,
  contentSections,
  getContent,
  hasLocalContent,
  resetAllContent,
  resetContent,
  saveContent
} from "../content/contentStore";
import "../styles/admin.css";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type DraftMap = Record<ContentKey, JsonValue>;
type StudioSection =
  | "dashboard"
  | "hero"
  | "metrics"
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "personalProjects"
  | "certifications"
  | "education"
  | "awards"
  | "contact"
  | "media";
type PreviewSize = "desktop" | "tablet" | "mobile";

type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  summary: string;
  achievements: string[];
  tags: string[];
};

type ProjectItem = {
  id: string;
  title: string;
  organization: string;
  description: string;
  metric: string;
  tags: string[];
  categories: string[];
  featured?: boolean;
  liveUrl?: string;
  githubUrl?: string;
  thumbnail?: string;
  caseStudy?: {
    problem: string;
    approach: string[];
    results: Array<{ value: string; label: string }>;
  };
};

type PersonalProjectItem = {
  id: string;
  name: string;
  valueProposition: string;
  problemSolved: string;
  targetUsers: string;
  solution?: string;
  whyItMatters?: string;
  highlights: string[];
  techHighlights: string[];
  status: string;
  liveUrl: string;
  githubUrl?: string;
  thumbnail?: string;
};

type CertificationItem = {
  title: string;
  issuer: string;
  brand: string;
  brandMark: string;
  accent: string;
  year: string;
  url: string;
};

const authKey = "portfolio-admin-auth";
const modifiedKey = "portfolio-admin-last-modified";
const tokenKey = "portfolio-github-token";
const publishWorkflow = "publish-portfolio.yml";
const repoOwner = "vijayshagunkumar";
const repoName = "vijayshagunkumar.github.io";
const sourceBranch = "source";

const studioSections: Array<{ id: StudioSection; label: string; contentKey?: ContentKey }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "hero", label: "Hero", contentKey: "hero" },
  { id: "metrics", label: "Metrics", contentKey: "metrics" },
  { id: "about", label: "About", contentKey: "about" },
  { id: "skills", label: "Skills", contentKey: "skills" },
  { id: "experience", label: "Experience", contentKey: "experience" },
  { id: "projects", label: "Corporate Projects", contentKey: "projects" },
  { id: "personalProjects", label: "Products I've Built", contentKey: "personalProjects" },
  { id: "certifications", label: "Certifications", contentKey: "certifications" },
  { id: "education", label: "Education", contentKey: "education" },
  { id: "awards", label: "Awards", contentKey: "awards" },
  { id: "contact", label: "Contact", contentKey: "contact" },
  { id: "media", label: "Resume & Profile", contentKey: "contact" }
];

const fileForKey = (key: ContentKey) => contentSections.find((section) => section.key === key)?.file ?? `${key}.json`;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toJson(value: unknown): JsonValue {
  return clone(value) as JsonValue;
}

function createDrafts(): DraftMap {
  return Object.fromEntries(contentSections.map((section) => [section.key, toJson(getContent(section.key))])) as DraftMap;
}

function titleize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinCsv(items: unknown) {
  return Array.isArray(items) ? items.join(", ") : "";
}

function updateAtPath(value: JsonValue, path: Array<string | number>, next: JsonValue): JsonValue {
  if (path.length === 0) return next;
  const [head, ...rest] = path;
  if (Array.isArray(value)) return value.map((item, index) => (index === head ? updateAtPath(item, rest, next) : item));
  if (value && typeof value === "object") return { ...value, [head]: updateAtPath(value[String(head)] ?? "", rest, next) };
  return value;
}

function saveDraftsToLocalStorage(drafts: DraftMap) {
  contentSections.forEach((section) => saveContent(section.key, drafts[section.key]));
  localStorage.setItem(modifiedKey, new Date().toISOString());
}

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

async function githubRequest<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `GitHub API request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function blankFrom<T extends Record<string, unknown>>(sample: T, overrides: Partial<T> = {}): T {
  const blank = Object.fromEntries(
    Object.entries(sample).map(([key, value]) => {
      if (key === "id") return [key, `new-${Date.now()}`];
      if (Array.isArray(value)) return [key, []];
      if (typeof value === "boolean") return [key, false];
      if (typeof value === "number") return [key, 0];
      if (value && typeof value === "object") return [key, blankFrom(value as Record<string, unknown>)];
      return [key, ""];
    })
  ) as T;
  return { ...blank, ...overrides };
}

function duplicateItem<T extends { id?: string; title?: string; name?: string; company?: string }>(item: T): T {
  const copy = clone(item);
  if (copy.id) copy.id = `${copy.id}-copy-${Date.now()}`;
  if (copy.title) copy.title = `${copy.title} Copy`;
  if (copy.name) copy.name = `${copy.name} Copy`;
  if (copy.company && !copy.title && !copy.name) copy.company = `${copy.company} Copy`;
  return copy;
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function CsvField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <Field label={label} value={joinCsv(value)} onChange={(next) => onChange(splitCsv(next))} />;
}

function SwitchField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="studio-switch">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function SortableCard({
  id,
  title,
  meta,
  children,
  actions
}: {
  id: string;
  title: string;
  meta?: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <details
      className={`studio-card ${isDragging ? "dragging" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      open
    >
      <summary>
        <button className="drag-handle" type="button" {...attributes} {...listeners} aria-label={`Drag ${title}`}>
          <GripVertical size={16} />
        </button>
        <div>
          <strong>{title}</strong>
          {meta ? <span>{meta}</span> : null}
        </div>
      </summary>
      <div className="studio-card-actions">{actions}</div>
      <div className="studio-card-body">{children}</div>
    </details>
  );
}

function SortableEditor<T extends { id?: string } & Record<string, unknown>>({
  items,
  getId,
  getTitle,
  getMeta,
  onItems,
  renderItem,
  createItem,
  addLabel
}: {
  items: T[];
  getId: (item: T, index: number) => string;
  getTitle: (item: T, index: number) => string;
  getMeta?: (item: T) => string;
  onItems: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (item: T) => void) => ReactNode;
  createItem: () => T;
  addLabel: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = items.map(getId);

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    onItems(arrayMove(items, index, nextIndex));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex >= 0 && newIndex >= 0) onItems(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <section className="studio-list">
      <div className="studio-list-head">
        <p>{items.length} items</p>
        <button type="button" onClick={() => onItems([...items, createItem()])}>
          <Plus size={15} /> {addLabel}
        </button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableCard
              key={getId(item, index)}
              id={getId(item, index)}
              title={getTitle(item, index)}
              meta={getMeta?.(item)}
              actions={
                <>
                  <button type="button" onClick={() => onItems(items.flatMap((entry, itemIndex) => (itemIndex === index ? [entry, duplicateItem(item)] : [entry])))}>
                    <Copy size={14} /> Duplicate
                  </button>
                  <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>
                    Move Up
                  </button>
                  <button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                    Move Down
                  </button>
                  <button type="button" className="danger" onClick={() => onItems(items.filter((_, itemIndex) => itemIndex !== index))}>
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              }
            >
              {renderItem(item, index, (next) => onItems(items.map((entry, itemIndex) => (itemIndex === index ? next : entry))))}
            </SortableCard>
          ))}
        </SortableContext>
      </DndContext>
    </section>
  );
}

function GenericEditor({
  value,
  onChange
}: {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}) {
  const renderValue = (label: string, item: JsonValue, path: Array<string | number>) => {
    if (Array.isArray(item)) {
      const primitive = item.every((entry) => entry === null || ["string", "number", "boolean"].includes(typeof entry));
      if (primitive) return <CsvField label={titleize(label)} value={item.map(String)} onChange={(next) => onChange(updateAtPath(value, path, next))} />;
      return (
        <SortableEditor
          items={item as Array<Record<string, unknown>>}
          getId={(entry, index) => String(entry.id ?? entry.title ?? entry.name ?? entry.label ?? index)}
          getTitle={(entry, index) => String(entry.title ?? entry.name ?? entry.label ?? entry.company ?? `Item ${index + 1}`)}
          onItems={(next) => onChange(updateAtPath(value, path, next as JsonValue))}
          createItem={() => blankFrom((item[0] as Record<string, unknown>) ?? { title: "" })}
          addLabel="Add Item"
          renderItem={(entry, index, update) => (
            <div className="studio-grid">
              {Object.entries(entry).map(([key, child]) => (
                <div key={key}>{renderValue(key, child as JsonValue, [...path, index, key])}</div>
              ))}
            </div>
          )}
        />
      );
    }
    if (item && typeof item === "object") {
      return (
        <div className="studio-grid">
          {Object.entries(item).map(([key, child]) => (
            <div key={key}>{renderValue(key, child as JsonValue, [...path, key])}</div>
          ))}
        </div>
      );
    }
    if (typeof item === "boolean") {
      return <SwitchField label={titleize(label)} checked={item} onChange={(checked) => onChange(updateAtPath(value, path, checked))} />;
    }
    return <Field label={titleize(label)} value={item === null ? "" : String(item)} onChange={(next) => onChange(updateAtPath(value, path, next))} multiline={String(item ?? "").length > 100} />;
  };

  return <>{renderValue("Content", value, [])}</>;
}

function ExperienceEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const data = value as unknown as { experience: ExperienceItem[] };
  const items = data.experience ?? [];
  return (
    <SortableEditor
      items={items as unknown as Array<ExperienceItem & Record<string, unknown>>}
      getId={(item, index) => `${item.company}-${item.period}-${index}`}
      getTitle={(item) => item.role || item.company || "Experience Entry"}
      getMeta={(item) => `${item.company} · ${item.period}`}
      addLabel="Add Experience"
      createItem={() => blankFrom(items[0] ?? { company: "", role: "", period: "", summary: "", achievements: [], tags: [] })}
      onItems={(next) => onChange({ ...data, experience: next } as unknown as JsonValue)}
      renderItem={(item, _index, update) => (
        <div className="studio-grid">
          <Field label="Role" value={item.role} onChange={(role) => update({ ...item, role })} />
          <Field label="Company" value={item.company} onChange={(company) => update({ ...item, company })} />
          <Field label="Period" value={item.period} onChange={(period) => update({ ...item, period })} />
          <Field label="Summary" value={item.summary} onChange={(summary) => update({ ...item, summary })} multiline />
          <CsvField label="Achievements" value={item.achievements} onChange={(achievements) => update({ ...item, achievements })} />
          <CsvField label="Tags" value={item.tags} onChange={(tags) => update({ ...item, tags })} />
        </div>
      )}
    />
  );
}

function ProjectsEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const data = value as unknown as { projects: ProjectItem[]; projectCategories: string[] };
  const items = data.projects ?? [];
  return (
    <SortableEditor
      items={items as unknown as Array<ProjectItem & Record<string, unknown>>}
      getId={(item, index) => item.id || `${item.title}-${index}`}
      getTitle={(item) => item.title || "Project"}
      getMeta={(item) => item.organization}
      addLabel="Add Project"
      createItem={() =>
        blankFrom(items[0] ?? { id: "", title: "", organization: "", description: "", metric: "", tags: [], categories: [], featured: false }, {
          id: `project-${Date.now()}`
        })
      }
      onItems={(next) => onChange({ ...data, projects: next } as unknown as JsonValue)}
      renderItem={(item, _index, update) => (
        <div className="studio-grid">
          <Field label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
          <Field label="Organization" value={item.organization} onChange={(organization) => update({ ...item, organization })} />
          <CsvField label="Category" value={item.categories} onChange={(categories) => update({ ...item, categories })} />
          <Field label="Description" value={item.description} onChange={(description) => update({ ...item, description })} multiline />
          <Field label="Impact" value={item.metric} onChange={(metric) => update({ ...item, metric })} />
          <CsvField label="Tags" value={item.tags} onChange={(tags) => update({ ...item, tags })} />
          <Field label="Live URL" value={item.liveUrl ?? ""} onChange={(liveUrl) => update({ ...item, liveUrl })} />
          <Field label="GitHub URL" value={item.githubUrl ?? ""} onChange={(githubUrl) => update({ ...item, githubUrl })} />
          <SwitchField
            label="Featured"
            checked={!!item.featured}
            onChange={(featured) => update({ ...item, featured })}
          />
          <SwitchField
            label="Case Study"
            checked={!!item.caseStudy}
            onChange={(checked) =>
              update({
                ...item,
                caseStudy: checked ? item.caseStudy ?? { problem: "", approach: [], results: [] } : undefined
              })
            }
          />
          {item.caseStudy ? (
            <>
              <Field label="Case Study Problem" value={item.caseStudy.problem} onChange={(problem) => update({ ...item, caseStudy: { ...item.caseStudy!, problem } })} multiline />
              <CsvField label="Case Study Approach" value={item.caseStudy.approach} onChange={(approach) => update({ ...item, caseStudy: { ...item.caseStudy!, approach } })} />
            </>
          ) : null}
        </div>
      )}
    />
  );
}

function ProductsEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const data = value as unknown as { personalProjects: PersonalProjectItem[] };
  const items = data.personalProjects ?? [];
  return (
    <SortableEditor
      items={items as unknown as Array<PersonalProjectItem & Record<string, unknown>>}
      getId={(item, index) => item.id || `${item.name}-${index}`}
      getTitle={(item) => item.name || "Product"}
      getMeta={(item) => item.status}
      addLabel="Add Product"
      createItem={() => blankFrom(items[0] ?? { id: "", name: "", valueProposition: "", problemSolved: "", targetUsers: "", highlights: [], techHighlights: [], status: "", liveUrl: "" }, { id: `product-${Date.now()}` })}
      onItems={(next) => onChange({ ...data, personalProjects: next } as unknown as JsonValue)}
      renderItem={(item, _index, update) => (
        <div className="product-editor-card">
          <div className="product-thumb">
            {item.thumbnail ? <img src={item.thumbnail} alt="" /> : <Image size={30} />}
          </div>
          <div className="studio-grid">
            <Field label="Product Name" value={item.name} onChange={(name) => update({ ...item, name })} />
            <Field label="Tagline" value={item.valueProposition} onChange={(valueProposition) => update({ ...item, valueProposition })} />
            <Field label="Problem Solved" value={item.problemSolved} onChange={(problemSolved) => update({ ...item, problemSolved })} multiline />
            <Field label="Solution" value={item.solution ?? ""} onChange={(solution) => update({ ...item, solution })} multiline />
            <Field label="Why It Matters" value={item.whyItMatters ?? ""} onChange={(whyItMatters) => update({ ...item, whyItMatters })} multiline />
            <Field label="Target Users" value={item.targetUsers} onChange={(targetUsers) => update({ ...item, targetUsers })} />
            <Field label="Live Demo" value={item.liveUrl} onChange={(liveUrl) => update({ ...item, liveUrl })} />
            <Field label="GitHub" value={item.githubUrl ?? ""} onChange={(githubUrl) => update({ ...item, githubUrl })} />
            <Field label="Thumbnail URL" value={item.thumbnail ?? ""} onChange={(thumbnail) => update({ ...item, thumbnail })} />
            <CsvField label="Highlights" value={item.highlights} onChange={(highlights) => update({ ...item, highlights })} />
            <CsvField label="Tech Highlights" value={item.techHighlights} onChange={(techHighlights) => update({ ...item, techHighlights })} />
          </div>
        </div>
      )}
    />
  );
}

function CertificationsEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const data = value as unknown as { certifications: CertificationItem[]; credentialProfiles: Array<{ label: string; url: string }> };
  const items = data.certifications ?? [];
  return (
    <>
      <SortableEditor
        items={items as unknown as Array<CertificationItem & Record<string, unknown>>}
        getId={(item, index) => `${item.title}-${index}`}
        getTitle={(item) => item.title || "Certification"}
        getMeta={(item) => `${item.brandMark} · ${item.year}`}
        addLabel="Add Certification"
        createItem={() => blankFrom(items[0] ?? { title: "", issuer: "", brand: "", brandMark: "", accent: "#0d9488", year: "", url: "" })}
        onItems={(next) => onChange({ ...data, certifications: next } as unknown as JsonValue)}
        renderItem={(item, _index, update) => (
          <div className="studio-grid">
            <Field label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
            <Field label="Issuer" value={item.issuer} onChange={(issuer) => update({ ...item, issuer })} />
            <Field label="Year" value={item.year} onChange={(year) => update({ ...item, year })} />
            <Field label="Credential URL" value={item.url} onChange={(url) => update({ ...item, url })} />
            <Field label="Brand Mark" value={item.brandMark} onChange={(brandMark) => update({ ...item, brandMark })} />
            <Field label="Brand" value={item.brand} onChange={(brand) => update({ ...item, brand })} />
            <Field label="Accent Color" value={item.accent} onChange={(accent) => update({ ...item, accent })} type="color" />
          </div>
        )}
      />
      <section className="studio-subsection">
        <h3>Credential Profile Links</h3>
        <GenericEditor value={{ credentialProfiles: data.credentialProfiles } as JsonValue} onChange={(next) => onChange({ ...data, ...(next as object) } as JsonValue)} />
      </section>
    </>
  );
}

function MediaEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const data = value as unknown as { resumePath: string; profilePhotoPath: string };
  const onFile = (event: ChangeEvent<HTMLInputElement>, key: "resumePath" | "profilePhotoPath") => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...data, [key]: reader.result as string } as unknown as JsonValue);
    reader.readAsDataURL(file);
  };

  return (
    <section className="media-panel">
      <p className="admin-help">Uploads are stored locally for preview only. Replace the actual files in the `public` folder before deployment.</p>
      <div className="media-grid">
        <article>
          <h3>Profile Photo</h3>
          <p>Current path: {data.profilePhotoPath}</p>
          <p>Current file: {data.profilePhotoPath.split("/").pop()?.slice(0, 80) || "Not set"}</p>
          {data.profilePhotoPath ? <img src={data.profilePhotoPath} alt="Profile preview" /> : null}
          <Field label="Profile Photo Path" value={data.profilePhotoPath} onChange={(profilePhotoPath) => onChange({ ...data, profilePhotoPath } as unknown as JsonValue)} />
          <label className="upload-button">
            <Upload size={15} /> Upload Profile Photo
            <input type="file" accept="image/*" onChange={(event) => onFile(event, "profilePhotoPath")} />
          </label>
        </article>
        <article>
          <h3>Resume</h3>
          <p>Current path: {data.resumePath}</p>
          <p>Current file: {data.resumePath.split("/").pop()?.slice(0, 80) || "Not set"}</p>
          <Field label="Resume Path" value={data.resumePath} onChange={(resumePath) => onChange({ ...data, resumePath } as unknown as JsonValue)} />
          <label className="upload-button">
            <Upload size={15} /> Upload Resume
            <input type="file" accept="application/pdf" onChange={(event) => onFile(event, "resumePath")} />
          </label>
        </article>
      </div>
    </section>
  );
}

function PreviewPanel({ size, onSize }: { size: PreviewSize; onSize: (size: PreviewSize) => void }) {
  const dimensions = {
    desktop: { width: "100%", height: 680, icon: Laptop },
    tablet: { width: 768, height: 760, icon: Tablet },
    mobile: { width: 390, height: 760, icon: Smartphone }
  };
  return (
    <section className="preview-panel">
      <div className="preview-toolbar">
        {(Object.keys(dimensions) as PreviewSize[]).map((item) => {
          const Icon = dimensions[item].icon;
          return (
            <button key={item} className={size === item ? "active" : ""} type="button" onClick={() => onSize(item)}>
              <Icon size={15} /> {titleize(item)} Preview
            </button>
          );
        })}
      </div>
      <div className="preview-frame-wrap">
        <iframe title={`${size} portfolio preview`} src="/" style={{ width: dimensions[size].width, height: dimensions[size].height }} />
      </div>
    </section>
  );
}

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const password = (import.meta.env.VITE_ADMIN_PASSWORD ?? "").trim();
  const [entry, setEntry] = useState("");
  const [error, setError] = useState("");

  if (!password) {
    return (
      <main className="admin-login">
        <section>
          <h1>Portfolio Studio</h1>
          <p className="admin-warning">No `VITE_ADMIN_PASSWORD` is configured. This static studio is for local editing only.</p>
          <button type="button" onClick={onUnlock}>
            Continue Locally
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-login">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (entry === password) {
            localStorage.setItem(authKey, "true");
            onUnlock();
          } else {
            setError("Incorrect password.");
          }
        }}
      >
        <h1>Portfolio Studio</h1>
        <p>Static password gate. This hides accidental access but is not real backend security.</p>
        <input type="password" value={entry} onChange={(event) => setEntry(event.target.value)} placeholder="Admin password" />
        {error ? <span>{error}</span> : null}
        <button type="submit">Open Studio</button>
      </form>
    </main>
  );
}

export function AdminDashboard() {
  const password = (import.meta.env.VITE_ADMIN_PASSWORD ?? "").trim();
  const [unlocked, setUnlocked] = useState(() => !password || localStorage.getItem(authKey) === "true");
  const [selected, setSelected] = useState<StudioSection>("dashboard");
  const [drafts, setDrafts] = useState<DraftMap>(() => createDrafts());
  const [savedDrafts, setSavedDrafts] = useState<DraftMap>(() => createDrafts());
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const [lastModified, setLastModified] = useState(() => localStorage.getItem(modifiedKey) ?? "Not saved yet");
  const [publishOpen, setPublishOpen] = useState(false);
  const [githubToken, setGithubToken] = useState(() => sessionStorage.getItem(tokenKey) ?? "");
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [publishMessage, setPublishMessage] = useState("");

  const selectedMeta = studioSections.find((section) => section.id === selected) ?? studioSections[0];
  const selectedKey = selectedMeta.contentKey;
  const unsavedKeys = contentSections
    .filter((section) => JSON.stringify(drafts[section.key]) !== JSON.stringify(savedDrafts[section.key]))
    .map((section) => section.key);
  const modifiedKeys = contentSections.filter((section) => hasLocalContent(section.key)).map((section) => section.key);
  const overview = {
    projects: ((drafts.projects as { projects?: unknown[] }).projects ?? []).length,
    products: ((drafts.personalProjects as { personalProjects?: unknown[] }).personalProjects ?? []).length,
    certifications: ((drafts.certifications as { certifications?: unknown[] }).certifications ?? []).length,
    experience: ((drafts.experience as { experience?: unknown[] }).experience ?? []).length
  };

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    const results: Array<{ label: string; section: StudioSection; detail: string }> = [];
    const add = (label: string, section: StudioSection, detail: string) => {
      if (`${label} ${detail}`.toLowerCase().includes(term)) results.push({ label, section, detail });
    };
    ((drafts.projects as { projects?: ProjectItem[] }).projects ?? []).forEach((item) => add(item.title, "projects", item.organization));
    ((drafts.personalProjects as { personalProjects?: PersonalProjectItem[] }).personalProjects ?? []).forEach((item) => add(item.name, "personalProjects", item.valueProposition));
    ((drafts.certifications as { certifications?: CertificationItem[] }).certifications ?? []).forEach((item) => add(item.title, "certifications", item.issuer));
    ((drafts.experience as { experience?: ExperienceItem[] }).experience ?? []).forEach((item) => add(item.company, "experience", item.role));
    ((drafts.skills as { skillGroups?: Array<{ title: string; skills: string[] }> }).skillGroups ?? []).forEach((group) => add(group.title, "skills", group.skills.join(", ")));
    return results.slice(0, 12);
  }, [drafts, query]);

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;

  const updateSection = (key: ContentKey, value: JsonValue) => {
    setDrafts((current) => ({ ...current, [key]: value }));
  };

  const saveSelected = () => {
    if (!selectedKey) return;
    saveContent(selectedKey, drafts[selectedKey]);
    setSavedDrafts((current) => ({ ...current, [selectedKey]: clone(drafts[selectedKey]) }));
    const timestamp = new Date().toLocaleString();
    localStorage.setItem(modifiedKey, timestamp);
    setLastModified(timestamp);
    setMessage(`${selectedMeta.label} saved locally.`);
  };

  const saveAll = () => {
    saveDraftsToLocalStorage(drafts);
    setSavedDrafts(clone(drafts));
    const timestamp = new Date().toLocaleString();
    setLastModified(timestamp);
    setMessage("All sections saved locally.");
  };

  const resetChanges = () => {
    resetAllContent();
    const clean = Object.fromEntries(contentSections.map((section) => [section.key, toJson(contentDefaults[section.key])])) as DraftMap;
    setDrafts(clean);
    setSavedDrafts(clean);
    setLastModified("Not saved yet");
    localStorage.removeItem(modifiedKey);
    setMessage("All local changes reset.");
  };

  const openPreview = () => {
    saveDraftsToLocalStorage(drafts);
    setSavedDrafts(clone(drafts));
    setPreviewOpen(true);
  };

  const publishToProduction = async () => {
    const token = githubToken.trim();
    if (!token) {
      setPublishStatus("error");
      setPublishMessage("Enter a GitHub token with Contents read/write and Actions write access.");
      return;
    }

    try {
      setPublishStatus("publishing");
      setPublishMessage("Saving JSON content to the source branch...");
      sessionStorage.setItem(tokenKey, token);
      saveDraftsToLocalStorage(drafts);

      const ref = await githubRequest<{ object: { sha: string } }>(token, `/git/ref/heads/${sourceBranch}`);
      const commit = await githubRequest<{ tree: { sha: string } }>(token, `/git/commits/${ref.object.sha}`);

      const treeItems = await Promise.all(
        contentSections.map(async (section) => {
          const blob = await githubRequest<{ sha: string }>(token, "/git/blobs", {
            method: "POST",
            body: JSON.stringify({
              content: encodeBase64(JSON.stringify(drafts[section.key], null, 2) + "\n"),
              encoding: "base64"
            })
          });

          return {
            path: `src/content/${section.file}`,
            mode: "100644",
            type: "blob",
            sha: blob.sha
          };
        })
      );

      const tree = await githubRequest<{ sha: string }>(token, "/git/trees", {
        method: "POST",
        body: JSON.stringify({
          base_tree: commit.tree.sha,
          tree: treeItems
        })
      });

      const nextCommit = await githubRequest<{ sha: string; html_url: string }>(token, "/git/commits", {
        method: "POST",
        body: JSON.stringify({
          message: "Publish portfolio content from Studio",
          tree: tree.sha,
          parents: [ref.object.sha]
        })
      });

      await githubRequest(token, `/git/refs/heads/${sourceBranch}`, {
        method: "PATCH",
        body: JSON.stringify({
          sha: nextCommit.sha,
          force: false
        })
      });

      setPublishMessage("Triggering production deployment workflow...");

      await githubRequest(token, `/actions/workflows/${publishWorkflow}/dispatches`, {
        method: "POST",
        body: JSON.stringify({
          ref: sourceBranch
        })
      });

      setSavedDrafts(clone(drafts));
      const timestamp = new Date().toLocaleString();
      localStorage.setItem(modifiedKey, timestamp);
      setLastModified(timestamp);
      setPublishStatus("success");
      setPublishMessage("Publish started. GitHub Actions is building and deploying production now.");
    } catch (error) {
      setPublishStatus("error");
      setPublishMessage(error instanceof Error ? error.message : "Publish failed.");
    }
  };

  const renderEditor = () => {
    if (selected === "dashboard") {
      return (
        <section className="studio-dashboard">
          <div className="overview-grid">
            <article><span>Projects</span><strong>{overview.projects}</strong></article>
            <article><span>Products Built</span><strong>{overview.products}</strong></article>
            <article><span>Certifications</span><strong>{overview.certifications}</strong></article>
            <article><span>Experience Entries</span><strong>{overview.experience}</strong></article>
          </div>
          <div className="dashboard-panel">
            <h3>Last Modified</h3>
            <p>{lastModified}</p>
            <h3>Unsaved Changes</h3>
            {unsavedKeys.length ? (
              <ul>{unsavedKeys.map((key) => <li key={key}>● {studioSections.find((section) => section.contentKey === key)?.label ?? key}</li>)}</ul>
            ) : (
              <p>All Changes Saved ✓</p>
            )}
            <h3>Modified</h3>
            {modifiedKeys.length ? (
              <ul>{modifiedKeys.map((key) => <li key={key}>✓ {studioSections.find((section) => section.contentKey === key)?.label ?? key}</li>)}</ul>
            ) : (
              <p>No local drafts saved yet.</p>
            )}
          </div>
        </section>
      );
    }
    if (!selectedKey) return null;
    if (selected === "experience") return <ExperienceEditor value={drafts.experience} onChange={(value) => updateSection("experience", value)} />;
    if (selected === "projects") return <ProjectsEditor value={drafts.projects} onChange={(value) => updateSection("projects", value)} />;
    if (selected === "personalProjects") return <ProductsEditor value={drafts.personalProjects} onChange={(value) => updateSection("personalProjects", value)} />;
    if (selected === "certifications") return <CertificationsEditor value={drafts.certifications} onChange={(value) => updateSection("certifications", value)} />;
    if (selected === "media") return <MediaEditor value={drafts.contact} onChange={(value) => updateSection("contact", value)} />;
    return <GenericEditor value={drafts[selectedKey]} onChange={(value) => updateSection(selectedKey, value)} />;
  };

  return (
    <main className="admin-shell studio-shell">
      <aside className="admin-sidebar studio-sidebar">
        <div>
          <p>Portfolio Studio</p>
          <h1>Admin</h1>
          <span className={unsavedKeys.length ? "draft-badge dirty" : "draft-badge"}>{unsavedKeys.length ? "Unsaved Changes ●" : "All Changes Saved ✓"}</span>
        </div>
        <label className="studio-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search portfolio..." />
        </label>
        {searchResults.length ? (
          <div className="search-results">
            {searchResults.map((result) => (
              <button key={`${result.section}-${result.label}`} type="button" onClick={() => { setSelected(result.section); setQuery(""); }}>
                <strong>{result.label}</strong>
                <span>{result.detail}</span>
              </button>
            ))}
          </div>
        ) : null}
        <nav aria-label="Admin sections">
          {studioSections.map((section) => (
            <button key={section.id} className={selected === section.id ? "active" : ""} type="button" onClick={() => setSelected(section.id)}>
              {section.label}
              {section.contentKey && unsavedKeys.includes(section.contentKey) ? <span>draft</span> : section.contentKey && hasLocalContent(section.contentKey) ? <span>saved</span> : null}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-panel studio-panel">
        <header className="admin-header studio-header">
          <div>
            <p>{selectedKey ? fileForKey(selectedKey) : "Portfolio overview"}</p>
            <h2>{selectedMeta.label === "Dashboard" ? "Portfolio Overview" : selectedMeta.label}</h2>
          </div>
          <div className="admin-actions studio-actions">
            <button type="button" onClick={selected === "dashboard" ? saveAll : saveSelected}>
              <Save size={16} /> Save
            </button>
            <button type="button" onClick={openPreview}>
              <Eye size={16} /> Preview Portfolio
            </button>
            <button type="button" className="publish-button" onClick={() => setPublishOpen(true)}>
              <Rocket size={16} /> Publish
            </button>
            <button type="button" className="danger" onClick={resetChanges}>
              <RotateCcw size={16} /> Reset Changes
            </button>
          </div>
        </header>

        <p className="admin-notice">Changes are saved locally in your browser. Export JSON and replace content files before deployment.</p>
        {selected === "media" ? <p className="admin-help">Upload previews are stored locally only. Replace files in `public` before deployment.</p> : null}
        {message ? <p className="admin-message">{message}</p> : null}

        {renderEditor()}

        {previewOpen ? (
          <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Portfolio preview">
            <div className="preview-modal-head">
              <h3>Portfolio Preview</h3>
              <button type="button" onClick={() => setPreviewOpen(false)}>Close</button>
            </div>
            <PreviewPanel size={previewSize} onSize={setPreviewSize} />
          </div>
        ) : null}

        {publishOpen ? (
          <div className="publish-modal" role="dialog" aria-modal="true" aria-label="Publish portfolio">
            <section>
              <div className="publish-head">
                <div>
                  <p>Production publish</p>
                  <h3>Publish Portfolio</h3>
                </div>
                <button type="button" onClick={() => setPublishOpen(false)}>Close</button>
              </div>
              <p className="admin-notice">
                Publish commits your edited JSON to the `source` branch, then starts GitHub Actions to build and deploy production.
                Your token stays in this browser session. Do not paste it into chat.
              </p>
              <div className="publish-grid">
                <article>
                  <span>Repository</span>
                  <strong>{repoOwner}/{repoName}</strong>
                </article>
                <article>
                  <span>Content branch</span>
                  <strong>{sourceBranch}</strong>
                </article>
                <article>
                  <span>Workflow</span>
                  <strong>{publishWorkflow}</strong>
                </article>
              </div>
              <label className="studio-field">
                <span>GitHub token</span>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(event) => setGithubToken(event.target.value)}
                  placeholder="Fine-grained token with Contents read/write and Actions write"
                />
              </label>
              <p className="admin-help">
                Use a fine-grained GitHub token for this repository with `Contents: Read and write` and `Actions: Read and write`.
                The token is only stored in `sessionStorage` if you publish successfully.
              </p>
              {publishMessage ? <p className={`publish-message ${publishStatus}`}>{publishMessage}</p> : null}
              <div className="publish-actions">
                <button type="button" disabled={publishStatus === "publishing"} onClick={publishToProduction}>
                  <Rocket size={16} /> {publishStatus === "publishing" ? "Publishing..." : "Publish to Production"}
                </button>
                <a href={`https://github.com/${repoOwner}/${repoName}/actions`} target="_blank" rel="noreferrer">
                  View Actions
                </a>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
