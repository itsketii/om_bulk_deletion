type TopbarProps = {
  title: string;
  description?: string;
};

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-white px-8 py-5">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold tracking-tight text-black">
          {title}
        </h1>
        {description ? (
          <p className="text-xs text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
