"use client";

import Link from "next/link";
import { track } from "@/lib/experience/analytics-client";
import { useId } from "react";
import { TurnstileVerification, type VerificationHandle } from "@/components/turnstile-verification";
import { useRef, useState, type FormEvent } from "react";
import { contactFieldsSchema, contactTopics, fieldErrors, type ContactErrors, type ContactFields } from "@/lib/contact-validation";

const empty: ContactFields = { name: "", email: "", company: "", phone: "", topic: "", message: "" };
export function ContactForm({ available, initialValues, origin = "ordinary", projects = [] }: { available: boolean; initialValues?: ContactFields; origin?: "ordinary" | "assistant"; projects?: string[] }) {
  const prefix = useId();
  const started = useRef(false);
  const [values, setValues] = useState(initialValues ?? empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "accepted" | "failed">("idle");
  const [notice, setNotice] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const verification = useRef<VerificationHandle>(null);
  const sending = useRef(false);
  const delivery = useRef({ payload: "", id: "" });
  const update = (name: keyof ContactFields, value: string) => { if (!started.current) { started.current = true; track("contact_start", "contact", { category: origin }); } setValues(previous => ({ ...previous, [name]: value })); setErrors(previous => ({ ...previous, [name]: undefined })); if (state === "accepted") { setState("idle"); setNotice(""); } };
  const failFields = (next: ContactErrors) => { setErrors(next); const first = Object.keys(next)[0]; if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || sending.current) return;
    const parsed = contactFieldsSchema.safeParse(values);
    if (!parsed.success) { track("contact_validation", "contact", { category: "invalid" }); failFields(fieldErrors(parsed.error)); setNotice("Check the highlighted fields."); setState("failed"); return; }
    track("contact_attempt", "contact", { category: origin });
    const payload = JSON.stringify({ ...parsed.data, origin, projects });
    if (delivery.current.payload !== payload) delivery.current = { payload, id: crypto.randomUUID() };
    sending.current = true; setState("sending"); setNotice("Verifying before sending your message…"); setErrors({});
    const website = new FormData(event.currentTarget).get("website") ?? "";
    try {
      const turnstileToken = await verification.current?.verify();
      if (!turnstileToken) throw new Error("verification_unavailable");
      setNotice("Sending your message…");
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, origin, projects, website, requestId: delivery.current.id, turnstileToken }), signal: AbortSignal.timeout(25000) });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) {
        if (result.fields) failFields(result.fields);
        setState("failed"); setNotice(typeof result.error === "string" ? result.error : "Your message was not confirmed sent. Please try again; your entries are still here.");
      } else { setState("accepted"); setNotice("Thank you. Your message has been accepted for delivery. Michael can use the contact details you provided to follow up."); }
    } catch { setState("failed"); setNotice("Verification or delivery could not be confirmed. Please retry; your entries are still here."); }
    finally { sending.current = false; }
  }
  const textField = (key: "name" | "email" | "company" | "phone", label: string, autoComplete: string, required = false) => <div className="contact-field"><label htmlFor={`${prefix}-contact-${key}`}>{label}{required && <span> (required)</span>}</label><input id={`${prefix}-contact-${key}`} name={key} type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} autoComplete={autoComplete} required={required} maxLength={{ name: 100, email: 254, company: 160, phone: 40 }[key]} value={values[key]} onChange={event => update(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${prefix}-contact-${key}-error` : undefined} disabled={!available || state === "sending"} />{errors[key] && <p id={`${prefix}-contact-${key}-error`} className="field-error">{errors[key]}</p>}</div>;
  return <form ref={form} className="contact-form" onSubmit={submit} noValidate aria-label="Contact Michael" aria-busy={state === "sending"}>
    {!available && <p className="contact-availability" role="status">The contact form is temporarily unavailable. Please <a href="https://www.linkedin.com/in/mp-gibb/">connect on LinkedIn</a>.</p>}
    <div className="contact-fields">{textField("name", "Full name", "name", true)}{textField("email", "Email address", "email", true)}{textField("company", "Company / organization", "organization")}{textField("phone", "Phone number", "tel")}</div>
    <div className="contact-field"><label htmlFor={`${prefix}-contact-topic`}>What would you like to discuss? <span>(optional)</span></label><select id={`${prefix}-contact-topic`} name="topic" value={values.topic} onChange={event => update("topic", event.target.value)} disabled={!available || state === "sending"}><option value="">Select a topic</option>{contactTopics.map(topic => <option key={topic}>{topic}</option>)}</select></div>
    <div className="contact-field"><label htmlFor={`${prefix}-contact-message`}>Message <span>(required)</span></label><textarea id={`${prefix}-contact-message`} name="message" rows={5} required minLength={10} maxLength={5000} placeholder="Tell me what you’re looking for." value={values.message} onChange={event => update("message", event.target.value)} disabled={!available || state === "sending"} aria-invalid={!!errors.message} aria-describedby={errors.message ? `${prefix}-contact-message-error` : undefined} />{errors.message && <p id={`${prefix}-contact-message-error`} className="field-error">{errors.message}</p>}</div>
    <div className="contact-trap" aria-hidden="true"><label htmlFor={`${prefix}-contact-website`}>Leave this field empty</label><input id={`${prefix}-contact-website`} name="website" autoComplete="off" tabIndex={-1} /></div>
    <TurnstileVerification ref={verification} action="contact_submit" compact={origin === "assistant"} />
    <div className="contact-submit"><button className="button-light button-primary" type="submit" disabled={!available || state === "accepted"} aria-disabled={state === "sending"}>{state === "sending" ? "Verifying / sending…" : state === "accepted" ? "Message accepted" : state === "failed" ? "Retry verification & send" : origin === "assistant" ? "Send inquiry" : "Send message"}</button><p>Your details are used to respond to this inquiry. <Link href="/privacy">Privacy</Link></p></div>
    <p className={`contact-status ${state === "failed" ? "contact-status-error" : ""}`} role="status" aria-live="polite" aria-atomic="true">{notice}</p>
    <noscript><p>Enable JavaScript to submit this form, or <a href="https://www.linkedin.com/in/mp-gibb/">connect on LinkedIn</a>.</p></noscript>
  </form>;
}
