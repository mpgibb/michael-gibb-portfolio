"use client";
import { openAssistant } from "@/lib/experience/assistant-store";
export function AskButton({ projectId, label }: { projectId?: string; label?: string }) { return <button type="button" className="assistant-entry" onClick={() => openAssistant(projectId)}>{label ?? (projectId ? "Ask about this study" : "Ask about my work")} <span aria-hidden="true">↗</span></button>; }
export function PreferencesButton() { return <button className="preferences-link" type="button" onClick={() => window.dispatchEvent(new Event("portfolio:preferences"))}>Privacy preferences</button>; }
