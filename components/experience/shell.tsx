"use client";
import dynamic from "next/dynamic";
import { useSyncExternalStore, useState } from "react";
import { usePathname } from "next/navigation";
import { assistantSnapshot, serverAssistantSnapshot, closeAssistant, subscribeAssistant } from "@/lib/experience/assistant-store";
import { Preferences } from "./preferences";
const Assistant = dynamic(() => import("./assistant-panel").then(m => m.AssistantPanel), { ssr: false });
const Observer = dynamic(() => import("./observer").then(m => m.ExperienceObserver), { ssr: false });
export function ExperienceShell() {
  const path = usePathname(); const assistant = useSyncExternalStore(subscribeAssistant, assistantSnapshot, serverAssistantSnapshot); const [tracking, setTracking] = useState(false);

  if (path.startsWith("/owner") || path.startsWith("/api/auth")) return null;
  return <><Preferences onTracking={setTracking} />{tracking && <Observer />}{assistant && <Assistant projectId={assistant.projectId} onClose={closeAssistant} />}</>;
}
