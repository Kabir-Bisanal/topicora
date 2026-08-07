export default function Loading() {
  return (
    <div
      className="mx-auto max-w-(--content-width) animate-pulse px-5 py-14"
      aria-label="Loading"
    >
      <div className="bg-muted h-3 w-28 rounded" />
      <div className="bg-muted mt-5 h-16 max-w-3xl rounded" />
      <div className="bg-muted mt-10 aspect-[16/6] rounded-2xl" />
    </div>
  );
}
