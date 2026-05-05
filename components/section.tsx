export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-black text-slate-950 md:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      {action}
    </div>
  );
}
