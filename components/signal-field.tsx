"use client";

import { useEffect, useRef, useState } from "react";
import { signalConfig, signalFrame, signalPaths } from "@/lib/signal-motion";

const initialFrame = signalFrame(signalConfig.initialSeconds);

export function SignalField() {
  const field = useRef<HTMLDivElement>(null);
  const clock = useRef<number>(signalConfig.initialSeconds);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = field.current;
    if (!root) return;
    const ambient = [...root.querySelectorAll<SVGCircleElement>(".signal-noise")];
    const groups = [...root.querySelectorAll<SVGGElement>(".signal-group")].map(group => ({
      path: group.querySelector<SVGPathElement>("path")!,
      points: [...group.querySelectorAll<SVGCircleElement>(".signal-point")],
      marker: group.querySelector<SVGCircleElement>(".signal-marker")!,
    }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visibleSize = window.matchMedia(`(min-width: ${signalConfig.visibleMinWidth}px)`);
    const compactSize = window.matchMedia(`(max-width: ${signalConfig.compactMaxWidth}px)`);
    let inView = false;
    let request: number | null = null;
    let previous: number | null = null;
    let lastDraw = 0;

    function position(element: SVGCircleElement, point: { x: number; y: number; opacity: number }) {
      element.setAttribute("cx", point.x.toFixed(3));
      element.setAttribute("cy", point.y.toFixed(3));
      element.setAttribute("opacity", point.opacity.toFixed(4));
    }
    function draw(seconds: number) {
      const frame = signalFrame(seconds);
      const compact = compactSize.matches;
      frame.ambient.forEach((point, i) => {
        if (!compact || i < signalConfig.compactAmbientPoints) position(ambient[i], point);
      });
      frame.signals.forEach((signal, i) => {
        if (compact && i === 2) return;
        groups[i].path.setAttribute("opacity", signal.opacity.toFixed(4));
        signal.points.forEach((point, j) => {
          if (!compact || j < signalConfig.compactSelectedPointsPerCurve) position(groups[i].points[j], point);
        });
        position(groups[i].marker, signal.marker);
      });
    }
    function tick(now: number) {
      if (previous !== null) clock.current += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (now - lastDraw >= 1000 / signalConfig.framesPerSecond) {
        draw(clock.current);
        lastDraw = now;
      }
      request = requestAnimationFrame(tick);
    }
    function sync() {
      if (!root) return;
      if (request !== null) cancelAnimationFrame(request);
      request = null;
      previous = null;
      const state = reduced.matches ? "reduced" : paused ? "paused" : !visibleSize.matches ? "responsive-hidden" : document.hidden ? "tab-hidden" : !inView ? "offscreen" : "running";
      root.dataset.motion = state;
      if (reduced.matches) draw(signalConfig.initialSeconds);
      else draw(clock.current);
      if (state === "running") request = requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.05 });
    observer.observe(root);
    reduced.addEventListener("change", sync);
    visibleSize.addEventListener("change", sync);
    compactSize.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    root.dataset.ready = "true";
    sync();
    return () => {
      if (request !== null) cancelAnimationFrame(request);
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      visibleSize.removeEventListener("change", sync);
      compactSize.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  return <div className="signal-field" ref={field}>
    <svg viewBox={`0 0 ${signalConfig.width} ${signalConfig.height}`} aria-hidden="true" focusable="false">
      <g className="signal-guides" fill="none" strokeDasharray="1 9">
        <path d="M120 398 H685 M200 334 H685 M360 128 V398 M556 75 V398 M672 52 V398" />
      </g>
      <g fill="#CBD5E1">{initialFrame.ambient.map((point, i) => <circle key={i} className={`signal-noise${i >= signalConfig.compactAmbientPoints ? " signal-desktop-only" : ""}`} cx={point.x} cy={point.y} r={point.radius} opacity={point.opacity} />)}</g>
      {initialFrame.signals.map((signal, i) => <g key={i} className={`signal-group${i === 2 ? " signal-desktop-only" : ""}`}>
        <path d={signalPaths[i]} fill="none" stroke="#E3AC79" strokeWidth={signalConfig.strokeWidth} opacity={signal.opacity} />
        {signal.points.map((point, j) => <circle key={j} className={`signal-point${j >= signalConfig.compactSelectedPointsPerCurve ? " signal-desktop-only" : ""}`} cx={point.x} cy={point.y} r="1.7" fill="#E3AC79" opacity={point.opacity} />)}
        <circle className="signal-marker" cx={signal.marker.x} cy={signal.marker.y} r={signalConfig.markerRadius} fill="#E3AC79" opacity={signal.marker.opacity} />
      </g>)}
    </svg>
    <button className="motion-toggle" type="button" onClick={() => setPaused(value => !value)}>
      <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span> {paused ? "Resume animation" : "Pause animation"}
    </button>
  </div>;
}
