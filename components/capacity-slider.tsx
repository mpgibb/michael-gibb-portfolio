type Props = { points: number[]; index: number; onChange: (index: number) => void; valueText: string };

/** Saved capacities can have unequal gaps. Expose percentages, step through actual saved rows. */
export function CapacitySlider({ points, index, onChange, valueText }: Props) {
  return <input type="range" min={points[0]} max={points.at(-1)} step="any" value={points[index]} aria-valuetext={valueText}
    onChange={event => {
      const value = Number(event.target.value);
      const closest = points.reduce((best, point, i) => Math.abs(point - value) < Math.abs(points[best] - value) ? i : best, 0);
      onChange(closest);
    }}
    onKeyDown={event => {
      const moves: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 2, PageDown: -2 };
      if (event.key in moves || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        onChange(event.key === "Home" ? 0 : event.key === "End" ? points.length - 1 : Math.max(0, Math.min(points.length - 1, index + moves[event.key])));
      }
    }} />;
}
