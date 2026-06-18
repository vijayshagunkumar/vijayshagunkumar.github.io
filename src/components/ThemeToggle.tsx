import { Palette } from "lucide-react";
import { ThemeName, themes } from "../data/profile";

type Props = {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
};

export function ThemeToggle({ value, onChange }: Props) {
  return (
    <label className="theme-control">
      <span className="sr-only">Choose theme</span>
      <Palette size={16} aria-hidden="true" />
      <select value={value} onChange={(event) => onChange(event.target.value as ThemeName)} aria-label="Choose theme">
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
    </label>
  );
}
