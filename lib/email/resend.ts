import "server-only";

import { Resend } from "resend";

import { getServerEnv } from "@/lib/env/server";

function client() {
  const env = getServerEnv();
  return env.RESEND_API_KEY
    ? { resend: new Resend(env.RESEND_API_KEY), env }
    : null;
}

export async function sendNewsletterConfirmation(
  email: string,
  confirmationUrl: string,
) {
  const configured = client();
  if (!configured)
    return { sent: false as const, reason: "not-configured" as const };
  const { error } = await configured.resend.emails.send({
    from: configured.env.EMAIL_FROM,
    to: email,
    subject: "Confirm your Topicora subscription",
    text: `Confirm your Topicora newsletter subscription by opening this link:\n\n${confirmationUrl}\n\nIf you did not request this, you can ignore this email.`,
  });
  return error
    ? { sent: false as const, reason: "delivery-failed" as const }
    : { sent: true as const };
}

export async function sendContactNotification(message: {
  name: string;
  email: string;
  reason: string;
  subject: string;
  message: string;
  articleUrl: string | null;
}) {
  const configured = client();
  if (!configured?.env.CONTACT_TO_EMAIL)
    return { sent: false as const, reason: "not-configured" as const };
  const { error } = await configured.resend.emails.send({
    from: configured.env.EMAIL_FROM,
    to: configured.env.CONTACT_TO_EMAIL,
    replyTo: message.email,
    subject: `[Topicora ${message.reason}] ${message.subject}`,
    text: `From: ${message.name} <${message.email}>\nReason: ${message.reason}\nArticle: ${message.articleUrl ?? "Not supplied"}\n\n${message.message}`,
  });
  return error
    ? { sent: false as const, reason: "delivery-failed" as const }
    : { sent: true as const };
}
