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
import { ChangeEvent, KeyboardEvent, ReactNode, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
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
import {
  hasUnsafeLineBreaks,
  normalizeBulletList,
  normalizeParagraphText,
  normalizePlainText,
  normalizeTextForField,
  TextFieldType
} from "../utils/textFormatting";
import { appPath } from "../utils/routes";

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
type PublishStepStatus = "pending" | "running" | "success" | "warning" | "error";

type PublishStep = {
  id: "content" | "trigger" | "status";
  label: string;
  status: PublishStepStatus;
  detail: string;
};

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
  techStack?: string[];
  status: string;
  liveUrl?: string;
  githubUrl?: string;
  thumbnail?: string;
  availability?: string;
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

type HeroContent = {
  profile: {
    name: string;
    headline: string;
    shortHeadline: string;
    location: string;
    preserveSummaryParagraphs?: boolean;
    targetRoles: string[];
    summary: string;
    executiveSummary: string[];
    narrative: string[];
    highlights: string[];
    seo: {
      title: string;
      description: string;
      canonical: string;
    };
  };
  profilePhoto: string;
};

const authKey = "portfolio-admin-auth";
const modifiedKey = "portfolio-admin-last-modified";
const tokenKey = "portfolio-github-token";
const publishWorkflow = "publish-portfolio.yml";
const repoOwner = "vijayshagunkumar";
const repoName = "vijayshagunkumar.github.io";
const sourceBranch = "source";

const initialPublishSteps: PublishStep[] = [
  {
    id: "content",
    label: "Step 1: Update content files on source branch",
    status: "pending",
    detail: "Waiting to publish JSON content for staging."
  },
  {
    id: "trigger",
    label: "Step 2: Trigger staging workflow",
    status: "pending",
    detail: "The workflow is triggered automatically by the push to source."
  },
  {
    id: "status",
    label: "Step 3: Review staging URL",
    status: "pending",
    detail: "Review https://vijayshagunkumar.github.io/staging/ before production."
  }
];

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

function normalizeHeroEditorText(value: string, trim = true) {
  const normalized = value.replace(/[\r\n]+/g, " ").replace(/[ \t]+/g, " ");
  return trim ? normalized.trim() : normalized;
}

function heroSummaryToParagraphs(value: string, preserveParagraphs: boolean, trim = true) {
  if (!preserveParagraphs) return [normalizeHeroEditorText(value, trim)].filter((item) => item.trim());
  return value
    .split(/\n+/)
    .map((item) => normalizeHeroEditorText(item, trim))
    .filter(Boolean);
}

function normalizeHeroContent(value: JsonValue): JsonValue {
  const data = clone(value) as unknown as HeroContent;
  if (!data.profile) return value;
  const preserveParagraphs = Boolean(data.profile.preserveSummaryParagraphs);
  const source = Array.isArray(data.profile.executiveSummary) && data.profile.executiveSummary.length
    ? data.profile.executiveSummary.join(preserveParagraphs ? "\n" : " ")
    : data.profile.summary ?? "";

  data.profile.executiveSummary = heroSummaryToParagraphs(source, preserveParagraphs);
  data.profile.summary = normalizePlainText(data.profile.summary ?? source);
  return data as unknown as JsonValue;
}

const plainTextKeys = new Set([
  "title",
  "name",
  "headline",
  "shortHeadline",
  "location",
  "summary",
  "description",
  "metric",
  "organization",
  "company",
  "role",
  "period",
  "valueProposition",
  "problemSolved",
  "targetUsers",
  "solution",
  "whyItMatters",
  "status",
  "issuer",
  "brand",
  "brandMark",
  "label",
  "problem"
]);

const excludedTextKeys = new Set(["id", "url", "liveUrl", "githubUrl", "thumbnail", "profilePhoto", "profilePhotoPath", "resumePath", "canonical", "accent"]);

function normalizeJsonText(value: JsonValue, key = ""): JsonValue {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) return normalizeBulletList(value as string[]);
    return value.map((item) => normalizeJsonText(item, key)) as JsonValue;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, normalizeJsonText(child as JsonValue, childKey)])) as JsonValue;
  }

  if (typeof value !== "string" || excludedTextKeys.has(key)) return value;
  if (plainTextKeys.has(key) || value.includes("\n")) return normalizePlainText(value);
  return normalizeTextForField(value, "plainText");
}

function normalizeDrafts(drafts: DraftMap): DraftMap {
  const normalized = Object.fromEntries(contentSections.map((section) => [section.key, normalizeJsonText(drafts[section.key])])) as DraftMap;
  return { ...normalized, hero: normalizeHeroContent(normalized.hero) };
}

function updateAtPath(value: JsonValue, path: Array<string | number>, next: JsonValue): JsonValue {
  if (path.length === 0) return next;
  const [head, ...rest] = path;
  if (Array.isArray(value)) return value.map((item, index) => (index === head ? updateAtPath(item, rest, next) : item));
  if (value && typeof value === "object") return { ...value, [head]: updateAtPath(value[String(head)] ?? "", rest, next) };
  return value;
}

function saveDraftsToLocalStorage(drafts: DraftMap) {
  const normalized = normalizeDrafts(drafts);
  contentSections.forEach((section) => saveContent(section.key, normalized[section.key]));
  localStorage.setItem(modifiedKey, new Date().toISOString());
}

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value: string) {
  return decodeURIComponent(escape(atob(value.replace(/\s/g, ""))));
}

function githubErrorMessage(status: number, body: string) {
  let message = body;
  try {
    const parsed = JSON.parse(body) as { message?: string; documentation_url?: string };
    message = parsed.message ?? body;
  } catch {
    // Keep the raw body when GitHub returns plain text.
  }

  if (status === 401) {
    return "GitHub rejected the token. Sign in again or create a fine-grained token for this repository with Contents: Read and Write and Actions: Read and Write.";
  }

  if (status === 403) {
    return `GitHub denied this API request: ${message}. Check that the fine-grained token has repository access plus Contents: Read and Write, Actions: Read and Write, and Metadata: Read-only.`;
  }

  if (status === 404) {
    return `GitHub could not find the repository, branch, workflow, or content file: ${message}. Confirm the token has access to ${repoOwner}/${repoName} and the source branch.`;
  }

  if (status === 409) {
    return "GitHub reported a branch conflict while publishing. Refresh the Studio, reload latest content, and try again.";
  }

  return message || `GitHub API request failed with ${status}`;
}

class GitHubApiError extends Error {
  status: number;
  endpoint: string;

  constructor(status: number, endpoint: string, message: string) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.endpoint = endpoint;
  }
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
    throw new GitHubApiError(response.status, path, githubErrorMessage(response.status, text));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

type GitHubContentFile = {
  type: "file";
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
};

async function getGitHubContentFile(token: string, path: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const file = await githubRequest<GitHubContentFile | GitHubContentFile[]>(
    token,
    `/contents/${encodedPath}?ref=${encodeURIComponent(sourceBranch)}`
  );

  if (Array.isArray(file) || file.type !== "file") {
    throw new Error(`GitHub content path is not a file: ${path}`);
  }

  return file;
}

async function putGitHubContentFile(token: string, path: string, content: string, sha: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return githubRequest<{ content: { path: string; sha: string }; commit: { sha: string; html_url: string } }>(
    token,
    `/contents/${encodedPath}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: `Publish ${path} from Portfolio Studio`,
        content: encodeBase64(content),
        sha,
        branch: sourceBranch
      })
    }
  );
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
  type = "text",
  fieldType = multiline ? "plainText" : "plainText",
  preserveParagraphBreaks = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  fieldType?: TextFieldType;
  preserveParagraphBreaks?: boolean;
}) {
  const cleanValue = () => onChange(normalizeTextForField(value, fieldType, preserveParagraphBreaks));
  const unsafeBreaks = fieldType === "plainText" && hasUnsafeLineBreaks(value);

  return (
    <div className="studio-field">
      <label>
        <span>{label}</span>
      </label>
      {multiline ? (
        <>
          <textarea
            aria-label={label}
            value={value}
            rows={4}
            onKeyDown={(event) => {
              if (fieldType !== "plainText" || event.key !== "Enter" || event.shiftKey) return;
              event.preventDefault();
              const target = event.currentTarget;
              target.setRangeText(" ", target.selectionStart, target.selectionEnd, "end");
              onChange(normalizeTextForField(target.value, fieldType, preserveParagraphBreaks));
            }}
            onChange={(event) => onChange(event.target.value)}
            onBlur={cleanValue}
          />
          <button className="clean-format-button" type="button" onClick={cleanValue}>
            Clean Formatting
          </button>
          {unsafeBreaks ? (
            <small className="format-warning">This field contains line breaks that may break the public layout. Clean formatting before publishing.</small>
          ) : null}
        </>
      ) : (
        <input aria-label={label} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

function CsvField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <Field label={label} value={joinCsv(value)} onChange={(next) => onChange(splitCsv(next))} />;
}

function HeroSummaryField({
  value,
  preserveParagraphs,
  onChange,
  onModeChange
}: {
  value: string[];
  preserveParagraphs: boolean;
  onChange: (value: string[]) => void;
  onModeChange: (checked: boolean, value: string[]) => void;
}) {
  const text = value.join(preserveParagraphs ? "\n" : " ");
  const handledEnterRef = useRef(false);

  const updateSummary = (next: string, preserve = preserveParagraphs) => {
    onChange(heroSummaryToParagraphs(next, preserve, false));
  };

  const insertSpaceForEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return false;
    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    target.setRangeText(" ", start, end, "end");
    flushSync(() => updateSummary(target.value));
    return true;
  };

  return (
    <section className="hero-summary-editor">
      <label className="studio-field">
        <span>Hero Summary</span>
        <textarea
          value={text}
          rows={6}
          onKeyDown={(event) => {
            handledEnterRef.current = insertSpaceForEnter(event);
          }}
          onKeyUp={(event) => {
            if (event.key !== "Enter") return;
            if (!handledEnterRef.current) insertSpaceForEnter(event);
            handledEnterRef.current = false;
          }}
          onChange={(event) => updateSummary(event.target.value)}
        />
      </label>
      <button className="clean-format-button" type="button" onClick={() => onChange(heroSummaryToParagraphs(text, preserveParagraphs))}>
        Clean Formatting
      </button>
      {!preserveParagraphs && hasUnsafeLineBreaks(text) ? (
        <small className="format-warning">This field contains line breaks that may break the public layout. Clean formatting before publishing.</small>
      ) : null}
      <p className="studio-help">Press Shift+Enter to create a new paragraph. Regular Enter will be converted into spaces.</p>
      <SwitchField
        label="Preserve Paragraph Breaks"
        checked={preserveParagraphs}
        onChange={(checked) => {
          onModeChange(checked, heroSummaryToParagraphs(text, checked));
        }}
      />
      <div className="hero-summary-preview" aria-label="Rendered hero summary preview">
        {heroSummaryToParagraphs(text, preserveParagraphs).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
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

function HeroEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const data = value as unknown as HeroContent;
  const profile = data.profile;
  const updateProfile = (next: Partial<HeroContent["profile"]>) => onChange({ ...data, profile: { ...profile, ...next } } as unknown as JsonValue);
  const preserveParagraphs = Boolean(profile.preserveSummaryParagraphs);

  return (
    <div className="studio-grid hero-editor-grid">
      <Field label="Name" value={profile.name} onChange={(name) => updateProfile({ name })} />
      <Field label="Headline" value={profile.headline} onChange={(headline) => updateProfile({ headline })} />
      <Field label="Short Headline" value={profile.shortHeadline} onChange={(shortHeadline) => updateProfile({ shortHeadline })} />
      <Field label="Location" value={profile.location} onChange={(location) => updateProfile({ location })} />
      <CsvField label="Target Roles" value={profile.targetRoles} onChange={(targetRoles) => updateProfile({ targetRoles })} />
      <Field label="Legacy Summary" value={profile.summary} onChange={(summary) => updateProfile({ summary })} multiline />
      <HeroSummaryField
        value={profile.executiveSummary}
        preserveParagraphs={preserveParagraphs}
        onChange={(executiveSummary) => updateProfile({ executiveSummary })}
        onModeChange={(preserveSummaryParagraphs, executiveSummary) => updateProfile({ preserveSummaryParagraphs, executiveSummary })}
      />
      <CsvField label="Highlights" value={profile.highlights} onChange={(highlights) => updateProfile({ highlights })} />
      <Field label="SEO Title" value={profile.seo.title} onChange={(title) => updateProfile({ seo: { ...profile.seo, title } })} />
      <Field label="SEO Description" value={profile.seo.description} onChange={(description) => updateProfile({ seo: { ...profile.seo, description } })} multiline />
      <Field label="Canonical URL" value={profile.seo.canonical} onChange={(canonical) => updateProfile({ seo: { ...profile.seo, canonical } })} />
      <Field label="Profile Photo Path" value={data.profilePhoto} onChange={(profilePhoto) => onChange({ ...data, profilePhoto } as unknown as JsonValue)} />
    </div>
  );
}

function AboutEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const data = value as unknown as {
    narrative: string[];
    highlights: string[];
    scopeOfInfluence: string[];
    journey: Array<{ period: string; company: string; role: string }>;
  };

  const updateNarrative = (index: number, paragraph: string) => {
    onChange({ ...data, narrative: data.narrative.map((item, itemIndex) => (itemIndex === index ? paragraph : item)) } as unknown as JsonValue);
  };

  return (
    <div className="studio-list">
      <div className="studio-list-head">
        <p>{data.narrative.length} narrative paragraphs</p>
        <button type="button" onClick={() => onChange({ ...data, narrative: [...data.narrative, ""] } as unknown as JsonValue)}>
          <Plus size={15} /> Add Paragraph
        </button>
      </div>
      {data.narrative.map((paragraph, index) => (
        <article className="studio-card" key={`about-${index}`}>
          <div className="studio-card-body">
            <Field
              label={`Narrative Paragraph ${index + 1}`}
              value={paragraph}
              onChange={(next) => updateNarrative(index, next)}
              multiline
              fieldType="plainText"
            />
            <div className="studio-card-actions">
              <button type="button" disabled={index === 0} onClick={() => onChange({ ...data, narrative: arrayMove(data.narrative, index, index - 1) } as unknown as JsonValue)}>
                Move Up
              </button>
              <button type="button" disabled={index === data.narrative.length - 1} onClick={() => onChange({ ...data, narrative: arrayMove(data.narrative, index, index + 1) } as unknown as JsonValue)}>
                Move Down
              </button>
              <button type="button" className="danger" onClick={() => onChange({ ...data, narrative: data.narrative.filter((_, itemIndex) => itemIndex !== index) } as unknown as JsonValue)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </article>
      ))}
      <section className="studio-subsection">
        <h3>Highlights</h3>
        <CsvField label="Highlights" value={data.highlights} onChange={(highlights) => onChange({ ...data, highlights } as unknown as JsonValue)} />
      </section>
      <section className="studio-subsection">
        <h3>Scope of Influence</h3>
        <CsvField label="Scope Items" value={data.scopeOfInfluence} onChange={(scopeOfInfluence) => onChange({ ...data, scopeOfInfluence } as unknown as JsonValue)} />
      </section>
      <section className="studio-subsection">
        <h3>Journey</h3>
        <GenericEditor value={{ journey: data.journey } as JsonValue} onChange={(next) => onChange({ ...data, ...(next as object) } as JsonValue)} />
      </section>
    </div>
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
            <Field label="Live Demo" value={item.liveUrl ?? ""} onChange={(liveUrl) => update({ ...item, liveUrl })} />
            <Field label="GitHub" value={item.githubUrl ?? ""} onChange={(githubUrl) => update({ ...item, githubUrl })} />
            <Field label="Availability" value={item.availability ?? ""} onChange={(availability) => update({ ...item, availability })} />
            <Field label="Thumbnail URL" value={item.thumbnail ?? ""} onChange={(thumbnail) => update({ ...item, thumbnail })} />
            <CsvField label="Highlights" value={item.highlights} onChange={(highlights) => update({ ...item, highlights })} />
            <CsvField label="Tech Highlights" value={item.techHighlights} onChange={(techHighlights) => update({ ...item, techHighlights })} />
            <CsvField label="Tech Stack" value={item.techStack ?? []} onChange={(techStack) => update({ ...item, techStack })} />
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
        <iframe title={`${size} portfolio preview`} src={appPath("/?studioPreview=1")} style={{ width: dimensions[size].width, height: dimensions[size].height }} />
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
  const [publishSteps, setPublishSteps] = useState<PublishStep[]>(() => clone(initialPublishSteps));

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
    const normalized = normalizeDrafts(drafts);
    saveContent(selectedKey, normalized[selectedKey]);
    setDrafts(normalized);
    setSavedDrafts((current) => ({ ...current, [selectedKey]: clone(normalized[selectedKey]) }));
    const timestamp = new Date().toLocaleString();
    localStorage.setItem(modifiedKey, timestamp);
    setLastModified(timestamp);
    setMessage(`${selectedMeta.label} saved locally.`);
  };

  const saveAll = () => {
    const normalized = normalizeDrafts(drafts);
    saveDraftsToLocalStorage(normalized);
    setDrafts(normalized);
    setSavedDrafts(clone(normalized));
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
    const normalized = normalizeDrafts(drafts);
    saveDraftsToLocalStorage(normalized);
    setDrafts(normalized);
    setSavedDrafts(clone(normalized));
    setPreviewOpen(true);
  };

  const updatePublishStep = (id: PublishStep["id"], status: PublishStepStatus, detail: string) => {
    setPublishSteps((current) => current.map((step) => (step.id === id ? { ...step, status, detail } : step)));
  };

  const formatApiFailure = (scope: string, error: unknown) => {
    if (error instanceof GitHubApiError) {
      const actionHelp = error.status === 403 && error.endpoint.includes("/actions/")
        ? "\nYour token can update content, but cannot trigger Actions. Update token Actions permission to Read and Write, or rely on push-triggered workflow."
        : "";
      return `${scope} failed.\nEndpoint: ${error.endpoint}\nStatus: ${error.status}\n${error.message}${actionHelp}`;
    }
    return `${scope} failed.\n${error instanceof Error ? error.message : "Unknown error."}`;
  };

  const publishToStaging = async () => {
    const token = githubToken.trim();
    if (!token) {
      setPublishStatus("error");
      setPublishMessage("Enter a GitHub token with Contents read/write, Actions read/write, and Metadata read-only access.");
      setPublishSteps(clone(initialPublishSteps));
      return;
    }

    let contentUpdated = false;

    try {
      setPublishStatus("publishing");
      setPublishMessage("Publishing content changes to staging...");
      setPublishSteps(clone(initialPublishSteps));
      updatePublishStep("content", "running", "Checking JSON files on the source branch.");
      sessionStorage.setItem(tokenKey, token);
      const normalized = normalizeDrafts(drafts);
      setDrafts(normalized);
      saveDraftsToLocalStorage(normalized);

      let updatedFiles = 0;

      for (const section of contentSections) {
        const path = `src/content/${section.file}`;
        setPublishMessage(`Checking ${section.file} on the source branch...`);
        const remoteFile = await getGitHubContentFile(token, path);
        const nextContent = JSON.stringify(normalized[section.key], null, 2) + "\n";
        const currentContent = remoteFile.encoding === "base64" ? decodeBase64(remoteFile.content) : remoteFile.content;

        if (currentContent === nextContent) continue;

        setPublishMessage(`Publishing ${section.file} to the source branch...`);
        await putGitHubContentFile(token, path, nextContent, remoteFile.sha);
        updatedFiles += 1;
        contentUpdated = true;
      }

      updatePublishStep(
        "content",
        "success",
        updatedFiles
          ? `Updated ${updatedFiles} JSON file${updatedFiles === 1 ? "" : "s"} on source.`
          : "No JSON file changes were needed; source already matches this Studio draft."
      );
      updatePublishStep(
        "trigger",
        updatedFiles ? "success" : "warning",
        updatedFiles
          ? "Staging deployment should start automatically because the workflow runs on pushes to source."
          : "No push was created because content was unchanged, so no new staging run was triggered."
      );
      updatePublishStep(
        "status",
        "warning",
        "Open GitHub Actions to confirm the latest staging run, then review https://vijayshagunkumar.github.io/staging/."
      );

      setSavedDrafts(clone(normalized));
      const timestamp = new Date().toLocaleString();
      localStorage.setItem(modifiedKey, timestamp);
      setLastModified(timestamp);
      setPublishStatus("success");
      setPublishMessage(
        updatedFiles
          ? "Content published to source. Staging deployment should start automatically."
          : "No JSON file changes were needed. Existing staging content is already up to date."
      );
    } catch (error) {
      if (contentUpdated) {
        setPublishStatus("success");
        updatePublishStep("content", "success", "Some content files were saved to GitHub before a later step failed.");
        updatePublishStep("trigger", "warning", "At least one source commit was created, so GitHub Actions may still publish staging automatically.");
        updatePublishStep("status", "warning", formatApiFailure("Contents update", error));
        setPublishMessage("Some content was saved to GitHub, but another content file could not be updated. Check the step details before publishing again.");
        return;
      }

      setPublishStatus("error");
      updatePublishStep("content", "error", formatApiFailure("Contents update", error));
      updatePublishStep("trigger", "pending", "Not started because content update did not complete.");
      updatePublishStep("status", "pending", "Not checked because content update did not complete.");
      setPublishMessage(formatApiFailure("Contents update", error));
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
    if (selected === "hero") return <HeroEditor value={drafts.hero} onChange={(value) => updateSection("hero", normalizeHeroContent(value))} />;
    if (selected === "about") return <AboutEditor value={drafts.about} onChange={(value) => updateSection("about", value)} />;
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
              <Rocket size={16} /> Publish Staging
            </button>
            <button type="button" className="danger" onClick={resetChanges}>
              <RotateCcw size={16} /> Reset Changes
            </button>
          </div>
        </header>

        <p className="admin-notice">Changes are saved locally in your browser. Publish to staging first, review, then deploy production only after approval.</p>
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
          <div className="publish-modal" role="dialog" aria-modal="true" aria-label="Publish staging portfolio">
            <section>
              <div className="publish-head">
                <div>
                  <p>Staging publish</p>
                  <h3>Publish Portfolio to Staging</h3>
                </div>
                <button type="button" onClick={() => setPublishOpen(false)}>Close</button>
              </div>
              <p className="admin-notice">
                Publish updates changed JSON files on the `source` branch with the GitHub Contents API, then GitHub Actions builds the staging preview.
                Production is not changed until the staging URL is approved.
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
                  placeholder="Fine-grained token with Contents read/write"
                />
              </label>
              <p className="admin-help">
                Use a fine-grained GitHub token for this repository with `Contents: Read and write`, `Actions: Read and write`, and `Metadata: Read-only`.
                The token is only stored in `sessionStorage` if you publish successfully.
              </p>
              <div className="publish-steps" aria-label="Publish progress">
                {publishSteps.map((step) => (
                  <article className={`publish-step ${step.status}`} key={step.id}>
                    <div>
                      <strong>{step.label}</strong>
                      <span>{step.status}</span>
                    </div>
                    <p>{step.detail}</p>
                  </article>
                ))}
              </div>
              {publishMessage ? <p className={`publish-message ${publishStatus}`}>{publishMessage}</p> : null}
              <div className="publish-actions">
                <button type="button" disabled={publishStatus === "publishing"} onClick={publishToStaging}>
                  <Rocket size={16} /> {publishStatus === "publishing" ? "Publishing..." : "Publish to Staging"}
                </button>
                <a href="https://vijayshagunkumar.github.io/staging/" target="_blank" rel="noreferrer">
                  Open Staging
                </a>
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
