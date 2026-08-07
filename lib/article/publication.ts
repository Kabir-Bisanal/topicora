export type PublicationStateInput = {
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
};

export function isCurrentlyPublished(
  article: PublicationStateInput,
  now = new Date(),
) {
  return (
    article.status === "published" &&
    Boolean(article.publishedAt) &&
    new Date(article.publishedAt!).getTime() <= now.getTime()
  );
}
