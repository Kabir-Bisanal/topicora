import { defaultSchema } from "rehype-sanitize";

export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), ["className"]],
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
  },
};

export function stripsExecutableHtml(markdown: string) {
  return !/<(?:script|iframe|object|embed|form|style)\b/i.test(markdown);
}
