type Point = { label: string; value: number };

export function HomeActivityChart({ points, formatValue }: { points: Point[]; formatValue: (value: number) => string }) {
  const values = points.map((point) => Math.max(0, point.value));
  const max = Math.max(...values, 1);
  const coordinates = values.map((value, index) => ({ x: 18 + index * (264 / Math.max(values.length - 1, 1)), y: 112 - (value / max) * 82 }));
  const line = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = `${line} L282 122 L18 122 Z`;

  return <div className="home-activity-chart" aria-label="Actividad de recompensas recientes">
    <svg viewBox="0 0 300 150" role="img">
      <defs><linearGradient id="homeChartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#16df8a" stopOpacity=".28"/><stop offset="1" stopColor="#16df8a" stopOpacity="0"/></linearGradient><linearGradient id="homeChartLine" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#16df8a"/><stop offset="1" stopColor="#22c8f5"/></linearGradient></defs>
      {[32,62,92,122].map((y) => <line key={y} x1="18" x2="282" y1={y} y2={y} className="chart-grid-line" />)}
      <path d={area} fill="url(#homeChartFill)" />
      <path d={line} className="chart-line" />
      {coordinates.map((point, index) => <g className="chart-point" key={`${points[index]?.label}-${index}`} aria-label={`${points[index]?.label}: ${formatValue(values[index])}`}><circle cx={point.x} cy={point.y} r="9" className="chart-hit"/><circle cx={point.x} cy={point.y} r="3.5"/></g>)}
    </svg>
    <div className="chart-labels">{points.map((point, index) => <span key={`${point.label}-${index}`}>{point.label}</span>)}</div>
  </div>;
}
