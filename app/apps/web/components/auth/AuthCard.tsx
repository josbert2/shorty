export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-faint bg-surface/60 p-7 backdrop-blur-sm">
      <h1 className="text-[24px] font-medium tracking-[-0.02em]">{title}</h1>
      <p className="mt-1.5 text-[13.5px] text-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-5 text-center text-[12.5px] text-muted">{footer}</div>}
    </div>
  );
}
