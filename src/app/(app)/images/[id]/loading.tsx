export default function Loading() {
  return (
    <div role="status" aria-label="Cargando" className="space-y-5">
      <div className="skeleton h-11 w-40" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-10">
        <div className="skeleton aspect-[4/3] rounded-lg" />
        <div className="space-y-4">
          <div className="skeleton h-9 w-3/4" />
          <div className="skeleton h-10 w-1/2" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-12 w-40" />
        </div>
      </div>
    </div>
  );
}
