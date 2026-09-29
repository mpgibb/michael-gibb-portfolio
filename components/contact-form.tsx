"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { contactFieldsSchema, contactTopics, fieldErrors, type ContactErrors, type ContactFields } from "@/lib/contact-validation";

const empty: ContactFields = { name: "", email: "", company: "", phone: "", topic: "", message: "" };
export function ContactForm({ available }: { available: boolean }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "accepted" | "failed">("idle");
  const [notice, setNotice] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const sending = useRef(false);
  const delivery = useRef({ payload: "", id: "" });
  const update = (name: keyof ContactFields, value: string) => { setValues(previous => ({ ...previous, [name]: value })); setErrors(previous => ({ ...previous, [name]: undefined })); if (state === "accepted") { setState("idle"); setNotice(""); } };
  const failFields = (next: ContactErrors) => { setErrors(next); const first = Object.keys(next)[0]; if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || sending.current) return;
    const parsed = contactFieldsSchema.safeParse(values);
    if (!parsed.success) { failFields(fieldErrors(parsed.error)); setNotice("Check the highlighted fields."); setState("failed"); return; }
    const payload = JSON.stringify(parsed.data);
    if (delivery.current.payload !== payload) delivery.current = { payload, id: crypto.randomUUID() };
    sending.current = true; setState("sending"); setNotice("Sending your message…"); setErrors({});
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, website: new FormData(event.currentTarget).get("website") ?? "", requestId: delivery.current.id }), signal: AbortSignal.timeout(25000) });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) {
        if (result.fields) failFields(result.fields);
        setState("failed"); setNotice(typeof result.error === "string" ? result.error : "Your message was not confirmed sent. Please try again; your entries are still here.");
      } else { setState("accepted"); setNotice("Thank you. Your message has been accepted for delivery. Michael will respond using the contact details you provided."); }
    } catch { setState("failed"); setNotice("Your message was not confirmed sent. Please try again; your entries are still here."); }
    finally { sending.current = false; }
  }
  const textField = (key: "name" | "email" | "company" | "phone", label: string, autoComplete: string, required = false) => <div className="contact-field"><label htmlFor={`contact-${key}`}>{label}{required && <span> (required)</span>}</label><input id={`contact-${key}`} name={key} type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} autoComplete={autoComplete} required={required} maxLength={{ name: 100, email: 254, company: 160, phone: 40 }[key]} value={values[key]} onChange={event => update(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `contact-${key}-error` : undefined} disabled={!available || state === "sending"} />{errors[key] && <p id={`contact-${key}-error`} className="field-error">{errors[key]}</p>}</div>;
  return <form ref={form} className="contact-form" onSubmit={submit} noValidate aria-label="Contact Michael" aria-busy={state === "sending"}>
    {!available && <p className="contact-availability" role="status">The contact form is temporarily unavailable. Please <a href="https://www.linkedin.com/in/mp-gibb/">connect on LinkedIn</a>.</p>}
    <div className="contact-fields">{textField("name", "Full name", "name", true)}{textField("email", "Email address", "email", true)}{textField("company", "Company / organization", "organization")}{textField("phone", "Phone number", "tel")}</div>
    <div className="contact-field"><label htmlFor="contact-topic">What would you like to discuss? <span>(optional)</span></label><select id="contact-topic" name="topic" value={values.topic} onChange={event => update("topic", event.target.value)} disabled={!available || state === "sending"}><option value="">Select a topic</option>{contactTopics.map(topic => <option key={topic}>{topic}</option>)}</select></div>
    <div className="contact-field"><label htmlFor="contact-message">Message <span>(required)</span></label><textarea id="contact-message" name="message" rows={5} required minLength={10} maxLength={5000} placeholder="Tell me what you’re looking for." value={values.message} onChange={event => update("message", event.target.value)} disabled={!available || state === "sending"} aria-invalid={!!errors.message} aria-describedby={errors.message ? "contact-message-error" : undefined} />{errors.message && <p id="contact-message-error" className="field-error">{errors.message}</p>}</div>
    <div className="contact-trap" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" autoComplete="off" tabIndex={-1} /></div>
    <div className="contact-submit"><button className="button-light button-primary" type="submit" disabled={!available || state === "sending" || state === "accepted"}>{state === "sending" ? "Sending…" : state === "accepted" ? "Message accepted" : "Send message"}</button><p>Your details are used to respond to this inquiry. <Link href="/privacy">Privacy</Link></p></div>
    <p className={`contact-status ${state === "failed" ? "contact-status-error" : ""}`} role="status" aria-live="polite" aria-atomic="true">{notice}</p>
    <noscript><p>Enable JavaScript to submit this form, or <a href="https://www.linkedin.com/in/mp-gibb/">connect on LinkedIn</a>.</p></noscript>
  </form>;
}
