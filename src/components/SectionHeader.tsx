type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  inverse?: boolean;
};

export function SectionHeader({ eyebrow, title, subtitle, inverse }: Props) {
  return (
    <div className={`section-header ${inverse ? "inverse" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}
