import { createContactHandler } from "@/lib/contact-server";

export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = createContactHandler();
