"use client";
type State = { projectId?: string } | null;
let state: State = null;
const listeners = new Set<() => void>();
export const assistantSnapshot = () => state;
export const serverAssistantSnapshot = () => null;
export function openAssistant(projectId?: string) { state = { projectId }; listeners.forEach(listener => listener()); }
export function closeAssistant() { state = null; listeners.forEach(listener => listener()); }
export function subscribeAssistant(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
