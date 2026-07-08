import { cn } from "@/lib/utils";
import { iconOptions } from "./data";

type IconPickerProps = {
  selectedIcon: string;
  onSelect: (iconId: string) => void;
};

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1">
      {iconOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded transition-colors",
            selectedIcon === option.id
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50",
          )}
          title={option.label}
        >
          <option.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
