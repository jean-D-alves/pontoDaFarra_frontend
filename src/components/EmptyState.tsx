import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  role?: "status" | "alert";
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  role,
}: EmptyStateProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-6 py-14 text-center"
    >
      <Icon
        aria-hidden="true"
        size={48}
        strokeWidth={1.5}
        className="text-muted"
      />
      <p className="text-base font-semibold text-black">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
