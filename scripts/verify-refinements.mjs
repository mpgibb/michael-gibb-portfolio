import assert from "node:assert/strict";
import { signalConfig, signalCurve, signalDensity, signalFrame } from "../lib/signal-motion.ts";
import { formatCurrency, formatPercent } from "../lib/format.ts";
import { matchesResearch, inBusinessArea } from "../lib/research-discovery.ts";

// Numerical continuity and attachment complement, but do not replace, browser motion review.
for (const width of [320, 360, 390, 768, 1024, 1440]) {
  for (let second = 0; second < 48; second += 0.5) {
    const frame = signalFrame(second, width, 550);
    const repeated = signalFrame(second + signalConfig.cycleSeconds, width, 550);
    frame.signals.forEach((signal, index) => {
      const curve = signalCurve(second, index, width, 550);
      assert(curve.knots[0].x < 0 && curve.knots.at(-1).x > width, "Both tails overscan");
      assert.equal(signal.path, repeated.signals[index].path, "Geometry repeats without a reset");
      const t = (signal.marker.x - curve.knots[0].x) / (curve.knots.at(-1).x - curve.knots[0].x);
      assert(Math.abs(curve.at(t).y - signal.marker.y) < 1e-8, "Marker stays on its current path");
      assert(Math.abs(signal.marker.opacity - repeated.signals[index].marker.opacity) < 1e-10);
      for (let knot = 1; knot < curve.knots.length - 1; knot++) {
        const location = (curve.knots[knot].x - curve.knots[0].x) / (curve.knots.at(-1).x - curve.knots[0].x);
        const a = curve.at(location - 1e-6), b = curve.at(location), c = curve.at(location + 1e-6);
        assert(Math.abs((b.y-a.y)/(b.x-a.x) - (c.y-b.y)/(c.x-b.x)) < .0001, "Joined tails have continuous slope");
      }
      assert.notEqual(signal.path, signalFrame(second + 3, width, 550).signals[index].path, "Curves visibly evolve");
    });
  }
}
assert.equal(signalDensity(320).curves, 2);
assert.equal(signalDensity(390).curves, 2);
assert.equal(signalDensity(1440).curves, 3);
assert.equal(formatCurrency(-.04), "-$0.04");
assert.equal(formatCurrency(1.2, 2, "GBP"), "£1.20");
assert.equal(formatPercent(.17294, 2), "17.29%");
for (const query of ["retention", "churn", "customer-return", "win-back", "winback"]) {
  for (const id of ["S03", "S47", "customer-value"]) assert(matchesResearch(query, id, ""), `${query}: ${id}`);
  assert(!matchesResearch(query, "S13", "sensor failure inspection"));
}
assert(inBusinessArea("operations", "operational-planning", ""));
assert(inBusinessArea("sales", "S28", ""));
console.log("PASS: two-cycle geometry, curve joins, marker attachment, responsive density, formatting and research discovery");
