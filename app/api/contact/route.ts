import { saveContactMessage } from "@/lib/db/form-submissions";
import { sendContactNotification } from "@/lib/email/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSameOrigin, requestFingerprint } from "@/lib/security/request";
import { contactSchema, submittedAtHumanSpeed } from "@/lib/validation/public-forms";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ message: "Request rejected." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) return Response.json({ message: "Message is too large." }, { status: 413 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ message: "Complete the required fields." }, { status: 400 });
  if (body.website) return Response.json({ message: "Thanks. Your message has been received." });
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success || !submittedAtHumanSpeed(parsed.data.startedAt)) return Response.json({ message: "Check each field and try again." }, { status: 400 });
  const allowed = await checkRateLimit("contact", requestFingerprint(request), 5, 3600);
  if (!allowed) return Response.json({ message: "Please wait before sending another message." }, { status: 429 });
  const payload = { name: parsed.data.name, email: parsed.data.email, reason: parsed.data.reason, articleUrl: parsed.data.articleUrl, subject: parsed.data.subject, message: parsed.data.message };
  const stored = await saveContactMessage(payload);
  if (!stored.stored) return Response.json({ message: "The message could not be saved. Please try again shortly." }, { status: 503 });
  const email = await sendContactNotification(payload);
  if (!email.sent) return Response.json({ message: "Thanks—we saved your message. Email delivery is not configured, but the editorial inbox can still see it." });
  return Response.json({ message: "Thanks. Your message was saved and sent to the Topicora team." });
}
