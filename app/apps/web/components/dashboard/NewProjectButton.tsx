"use client";

export function NewProjectButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-pill bg-primary px-4 py-2.5 text-[13px] font-medium text-body transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
    >
      <svg viewBox="0 0 16 16" className="size-4">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      {disabled ? "Creando…" : "Nuevo proyecto"}
    </button>
  );
}
