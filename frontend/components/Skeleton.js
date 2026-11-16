export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="sk-card" key={i}>
          <div className="skeleton sk-img" />
          <div className="sk-body">
            <div className="skeleton sk-line" style={{ width: "40%" }} />
            <div className="skeleton sk-line" style={{ width: "85%" }} />
            <div className="skeleton sk-line" style={{ width: "55%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="panel" key={i}>
          <div className="skeleton sk-line" style={{ width: "35%", height: 20, marginBottom: 12 }} />
          <div className="skeleton sk-line" style={{ width: "60%", marginBottom: 8 }} />
          <div className="skeleton sk-line" style={{ width: "45%" }} />
        </div>
      ))}
    </div>
  );
}
