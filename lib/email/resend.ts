import "server-only";

import { Resend } from "resend";

import { getServerEnv } from "@/lib/env/server";

function client() {
  const env = getServerEnv();
  return env.RESEND_API_KEY
    ? { resend: new Resend(env.RESEND_API_KEY), env }
    : null;
}

export function isCampaignEmailConfigured() {
  return Boolean(client());
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

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function campaignHtml(content: string, preferencesUrl: string) {
  const body = content
    .split(/\n{2,}/)
    .map((section) => {
      const safe = escapeHtml(section).replaceAll("\n", "<br>");
      if (safe.startsWith("## "))
        return `<h2 style="font-family:Georgia,serif;margin:32px 0 12px">${safe.slice(3)}</h2>`;
      return `<p style="font:16px/1.7 Arial,sans-serif;margin:0 0 18px">${safe}</p>`;
    })
    .join("");
  return `<div style="max-width:640px;margin:0 auto;padding:32px 20px;color:#18181b"><div style="font:bold 22px Georgia,serif;margin-bottom:28px">Topicora</div>${body}<hr style="border:0;border-top:1px solid #ddd;margin:36px 0 20px"><p style="font:12px/1.6 Arial,sans-serif;color:#666">You received this because you confirmed a Topicora subscription. <a href="${escapeHtml(preferencesUrl)}">Update preferences or unsubscribe</a>.</p></div>`;
}

export async function sendNewsletterCampaign(input: {
  email: string;
  subject: string;
  preheader: string | null;
  contentMarkdown: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
}) {
  const configured = client();
  if (!configured)
    return { sent: false as const, reason: "not-configured" as const };
  const { data, error } = await configured.resend.emails.send({
    from: configured.env.EMAIL_FROM,
    to: input.email,
    subject: input.subject,
    text: `${input.preheader ? `${input.preheader}\n\n` : ""}${input.contentMarkdown}\n\nManage your preferences or unsubscribe: ${input.preferencesUrl}`,
    html: campaignHtml(input.contentMarkdown, input.preferencesUrl),
    headers: {
      "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  return error
    ? {
        sent: false as const,
        reason: "delivery-failed" as const,
        error: error.message,
      }
    : { sent: true as const, id: data?.id ?? null };
}
