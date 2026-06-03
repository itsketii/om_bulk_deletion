type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight text-black">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-[var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}
