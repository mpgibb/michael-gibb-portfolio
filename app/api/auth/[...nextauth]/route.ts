import type { NextRequest } from "next/server";
import { handlers, authConfigured } from "@/lib/experience/auth";
export const runtime = "nodejs";
export const GET = (request: NextRequest) => authConfigured() ? handlers.GET(request) : Response.json({ error: "Owner sign-in is not configured." }, { status: 503 });
export const POST = (request: NextRequest) => authConfigured() ? handlers.POST(request) : Response.json({ error: "Owner sign-in is not configured." }, { status: 503 });
