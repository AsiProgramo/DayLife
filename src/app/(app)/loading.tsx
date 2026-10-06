export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="grid gap-10 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12"
    >
      <div className="space-y-5">
        <div className="skeleton h-9 w-2/3" />
        <div className="skeleton h-48 w-full rounded-lg" />
        <div className="skeleton hidden h-96 w-full rounded-lg lg:block" />
      </div>
      <div className="space-y-5">
        <div className="skeleton h-8 w-40" />
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton aspect-[4/5] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
