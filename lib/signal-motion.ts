/** Decorative geometry and motion settings. No measured data is represented. */
export const signalConfig = {
  width: 720,
  height: 440,
  cycleSeconds: 24,
  initialSeconds: 13,
  framesPerSecond: 30,
  visibleMinWidth: 900,
  compactMaxWidth: 1199,
  ambientPoints: 48,
  compactAmbientPoints: 30,
  selectedPointsPerCurve: 10,
  compactSelectedPointsPerCurve: 8,
  curvePhases: [0, 1 / 3, 2 / 3],
  noiseOpacity: [0.09, 0.23],
  curveOpacity: [0.15, 0.82],
  drift: 6,
  strokeWidth: 1.35,
  markerRadius: 4,
} as const;

type Point = { x: number; y: number };
const curves: readonly (readonly Point[])[] = [
  [{ x: 18, y: 365 }, { x: 365, y: 350 }, { x: 415, y: 90 }, { x: 702, y: 52 }],
  [{ x: 18, y: 366 }, { x: 330, y: 290 }, { x: 180, y: 65 }, { x: 460, y: 224 }],
  [{ x: 18, y: 371 }, { x: 350, y: 355 }, { x: 465, y: 320 }, { x: 702, y: 186 }],
];

export const signalPaths = curves.map(([a, b, c, d]) => `M${a.x} ${a.y} C${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`);
const unit = (value: number) => value - Math.floor(value);
const seed = (i: number) => unit(Math.sin(i * 127.1 + 311.7) * 43758.5453);
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;

function curvePoint(index: number, t: number): Point {
  const [a, b, c, d] = curves[index];
  const s = 1 - t;
  return {
    x: s ** 3 * a.x + 3 * s * s * t * b.x + 3 * s * t * t * c.x + t ** 3 * d.x,
    y: s ** 3 * a.y + 3 * s * s * t * b.y + 3 * s * t * t * c.y + t ** 3 * d.y,
  };
}

export function signalFrame(seconds: number) {
  const cycle = seconds / signalConfig.cycleSeconds;
  const ambient = Array.from({ length: signalConfig.ambientPoints }, (_, i) => {
    const phase = 2 * Math.PI * (cycle + seed(i));
    return {
      x: 36 + seed(i + 100) * 644 + Math.sin(phase) * signalConfig.drift,
      y: 58 + seed(i + 200) * 325 + Math.cos(phase) * signalConfig.drift * 0.7,
      opacity: mix(...signalConfig.noiseOpacity, seed(i + 300)),
      radius: 0.8 + seed(i + 400) * 0.7,
    };
  });
  const signals = curves.map((_, index) => {
    const phase = unit(cycle + signalConfig.curvePhases[index]);
    // Cosine easing has matching positions and velocities at the cycle seam.
    const alignment = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    const points = Array.from({ length: signalConfig.selectedPointsPerCurve }, (_, i) => {
      const target = curvePoint(index, (i + 1) / (signalConfig.selectedPointsPerCurve + 1));
      const id = index * 30 + i;
      const driftPhase = 2 * Math.PI * (cycle + seed(id + 800));
      const scattered = {
        x: target.x + (seed(id + 500) - 0.5) * 70 + Math.sin(driftPhase) * signalConfig.drift,
        y: target.y + (seed(id + 600) - 0.5) * 110 + Math.cos(driftPhase) * signalConfig.drift,
      };
      return {
        x: mix(scattered.x, target.x, alignment),
        y: mix(scattered.y, target.y, alignment),
        opacity: 0.12 + alignment * 0.48,
      };
    });
    const markerPhase = unit(phase + 0.17);
    return {
      opacity: mix(...signalConfig.curveOpacity, alignment ** 2),
      points,
      marker: {
        ...curvePoint(index, markerPhase),
        // Fully invisible, with zero opacity velocity, before recycling.
        opacity: Math.sin(Math.PI * markerPhase) ** 2 * (0.35 + alignment * 0.6),
      },
    };
  });
  return { ambient, signals };
}
