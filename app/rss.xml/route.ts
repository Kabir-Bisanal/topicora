import { getPublishedArticles } from "@/lib/db/articles";
import { absoluteUrl } from "@/lib/seo/metadata";

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);

export const revalidate = 300;

export async function GET() {
  const { articles } = await getPublishedArticles({ pageSize: 30 });
  const items = articles.slice(0, 30).map((article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(absoluteUrl(`/articles/${article.slug}`))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(`/articles/${article.slug}`))}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <category>${escapeXml(article.category.name)}</category>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Topicora</title>
    <link>${absoluteUrl()}</link>
    <description>Useful ideas, wherever curiosity leads.</description>
    <language>en-IN</language>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
