import type { Metadata } from "next";
import { authConfigured, ownerSession, signIn, signOut } from "@/lib/experience/auth";
import { OwnerInbox } from "@/components/experience/owner-inbox";
export const metadata: Metadata = { title: "Owner inbox", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Owner() {
  const session = await ownerSession();
  return <main id="main" className="shell legal-page" data-private="true"><h1>Owner inbox</h1>{!session ? <><p>This workspace is restricted to Michael’s authorized GitHub account.</p>{authConfigured() ? <form action={async () => { "use server"; await signIn("github", { redirectTo: "/owner" }); }}><button className="button button-copper">Sign in with GitHub</button></form> : <p>Owner sign-in is awaiting configuration.</p>}</> : <><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="button button-light">Sign out</button></form><OwnerInbox /></>}</main>;
}
