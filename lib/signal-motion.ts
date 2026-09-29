/** Decorative geometry only. All time, density and appearance settings live here. */
export const signalConfig = {
  width: 1440,
  height: 550,
  cycleSeconds: 24,
  initialSeconds: 5,
  framesPerSecond: 30,
  compactMaxWidth: 1199,
  mobileMaxWidth: 600,
  ambientPoints: 48,
  compactAmbientPoints: 28,
  mobileAmbientPoints: 16,
  selectedPointsPerCurve: 12,
  compactSelectedPointsPerCurve: 8,
  mobileSelectedPointsPerCurve: 6,
  curvePhases: [0, 1 / 3, 2 / 3],
  curveAmplitude: 0.075,
  overscanFraction: 0.16,
  noiseOpacity: [0.1, 0.26],
  curveOpacity: [0.32, 0.86],
  driftPixels: 7,
  strokeWidth: 1.35,
  markerRadius: 3.6,
} as const;

export type SignalPoint = { x: number; y: number };
const profiles = [
  [0.86, 0.72, 0.57, 0.31, 0.17],
  [0.65, 0.56, 0.27, 0.43, 0.46],
  [0.27, 0.42, 0.67, 0.56, 0.3],
];
// Shallower sweeps leave both signals visible in a narrow, tall hero.
const mobileProfiles = [
  [0.62, 0.57, 0.46, 0.29, 0.23],
  [0.24, 0.31, 0.43, 0.57, 0.65],
  profiles[2],
];
const unit = (value: number) => value - Math.floor(value);
const seed = (i: number) => unit(Math.sin(i * 127.1 + 311.7) * 43758.5453);
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;

export function signalDensity(width: number) {
  const mobile = width <= signalConfig.mobileMaxWidth;
  const compact = width <= signalConfig.compactMaxWidth;
  return {
    curves: compact ? 2 : 3,
    ambient: mobile ? signalConfig.mobileAmbientPoints : compact ? signalConfig.compactAmbientPoints : signalConfig.ambientPoints,
    selected: mobile ? signalConfig.mobileSelectedPointsPerCurve : compact ? signalConfig.compactSelectedPointsPerCurve : signalConfig.selectedPointsPerCurve,
  };
}

/** Shared Hermite spline for the path, fitted points and moving markers. */
export function signalCurve(seconds: number, index: number, width: number, height: number) {
  const phase = 2 * Math.PI * (seconds / signalConfig.cycleSeconds + signalConfig.curvePhases[index]);
  const over = signalConfig.overscanFraction;
  const xs = [-over, 0.2, 0.53, 0.86, 1 + over];
  const profile = width <= signalConfig.mobileMaxWidth ? mobileProfiles[index] : profiles[index];
  const knots = profile.map((y, i) => ({
    x: xs[i] * width,
    y: height * (y + signalConfig.curveAmplitude * Math.sin(phase + i * 0.47) + 0.025 * Math.cos(phase - i * 0.31)),
  }));
  const slopes = knots.map((point, i) => {
    const before = knots[Math.max(0, i - 1)];
    const after = knots[Math.min(knots.length - 1, i + 1)];
    return (after.y - before.y) / (after.x - before.x);
  });
  const segments = knots.slice(0, -1).map((a, i) => {
    const d = knots[i + 1];
    const dx = (d.x - a.x) / 3;
    return [a, { x: a.x + dx, y: a.y + slopes[i] * dx }, { x: d.x - dx, y: d.y - slopes[i + 1] * dx }, d];
  });
  const coordinate = (p: SignalPoint) => `${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
  const path = `M${coordinate(knots[0])} ` + segments.map(([, b, c, d]) => `C${coordinate(b)} ${coordinate(c)} ${coordinate(d)}`).join(" ");
  function at(t: number): SignalPoint {
    const x = mix(knots[0].x, knots.at(-1)!.x, Math.max(0, Math.min(1, t)));
    const i = Math.min(segments.length - 1, knots.findIndex(p => p.x >= x) - 1);
    const [a, b, c, d] = segments[Math.max(0, i)];
    const u = (x - a.x) / (d.x - a.x);
    const s = 1 - u;
    return { x, y: s ** 3 * a.y + 3 * s * s * u * b.y + 3 * s * u * u * c.y + u ** 3 * d.y };
  }
  return { path, at, knots, slopes };
}

export function signalFrame(seconds: number, width: number = signalConfig.width, height: number = signalConfig.height) {
  const cycle = seconds / signalConfig.cycleSeconds;
  const density = signalDensity(width);
  const ambient = Array.from({ length: signalConfig.ambientPoints }, (_, i) => {
    const phase = 2 * Math.PI * (cycle + seed(i));
    return {
      x: seed(i + 100) * width + Math.sin(phase) * signalConfig.driftPixels,
      y: (0.1 + seed(i + 200) * 0.8) * height + Math.cos(phase) * signalConfig.driftPixels * 0.7,
      opacity: i < density.ambient ? mix(...signalConfig.noiseOpacity, seed(i + 300)) : 0,
      radius: 0.8 + seed(i + 400) * 0.6,
    };
  });
  const signals = profiles.map((_, index) => {
    const curve = signalCurve(seconds, index, width, height);
    const phase = unit(cycle + signalConfig.curvePhases[index]);
    const alignment = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    const visible = index < density.curves;
    const points = Array.from({ length: signalConfig.selectedPointsPerCurve }, (_, i) => {
      const target = curve.at((i + 1) / (density.selected + 1));
      const id = index * 30 + i;
      const driftPhase = 2 * Math.PI * (cycle + seed(id + 800));
      return {
        x: target.x + (1 - alignment) * ((seed(id + 500) - 0.5) * Math.min(width * 0.09, 90) + Math.sin(driftPhase) * signalConfig.driftPixels),
        y: target.y + (1 - alignment) * ((seed(id + 600) - 0.5) * height * 0.25 + Math.cos(driftPhase) * signalConfig.driftPixels),
        opacity: visible && i < density.selected ? 0.13 + alignment * 0.47 : 0,
      };
    });
    const markerPhase = unit(phase + 0.17);
    return {
      path: curve.path,
      opacity: visible ? mix(...signalConfig.curveOpacity, alignment ** 2) : 0,
      points,
      marker: {
        ...curve.at(markerPhase),
        // Opacity and its first derivative are zero before a marker recycles.
        opacity: visible ? Math.sin(Math.PI * markerPhase) ** 2 * (0.45 + alignment * 0.5) : 0,
      },
    };
  });
  return { ambient, signals };
}
