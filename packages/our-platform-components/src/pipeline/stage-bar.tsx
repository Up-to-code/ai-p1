export interface StageBarProps {
  color: string;
}

export function StageBar({ color }: StageBarProps) {
  return <div className="h-1 w-full" style={{ backgroundColor: color }} />;
}
