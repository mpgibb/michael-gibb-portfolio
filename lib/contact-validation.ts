import { z } from "zod";

export const contactTopics = ["Leadership opportunity", "Analytics or AI project", "Research collaboration", "Other"] as const;
// Control characters are deliberately rejected at the trust boundary.
/* eslint-disable no-control-regex */
const singleLine = (maximum: number) => z.string().trim().max(maximum).refine(value => !/[\r\n\u0000-\u001f\u007f]/.test(value), "Use one line of text.");
export const contactFieldsSchema = z.object({
  name: singleLine(100).pipe(z.string().min(2, "Enter your full name.")),
  email: singleLine(254).pipe(z.string().email("Enter a valid email address.")),
  company: singleLine(160),
  phone: singleLine(40),
  topic: z.enum(["", ...contactTopics]),
  message: z.string().trim().min(10, "Please enter at least 10 characters.").max(5000, "Keep the message to 5,000 characters.").refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), "Remove unsupported control characters."),
});
export const contactRequestSchema = contactFieldsSchema.extend({ website: z.string().max(200), requestId: z.string().uuid() }).strict();
export type ContactFields = z.infer<typeof contactFieldsSchema>;
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;
export function fieldErrors(error: z.ZodError): ContactErrors {
  return Object.fromEntries(error.issues.filter(issue => issue.path[0] in contactFieldsSchema.shape).map(issue => [issue.path[0], issue.message]));
}
