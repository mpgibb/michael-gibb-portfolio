import { assistantEnabled } from "@/lib/experience/assistant";
import { isContactConfigured } from "@/lib/contact-server";
export const GET = () => Response.json({ available: assistantEnabled(), contact: isContactConfigured() }, { headers: { "Cache-Control": "no-store" } });
