import { ImageResponse } from "next/og";

import { getArticleBySlug } from "@/lib/db/articles";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ArticleOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const title = article?.title ?? "Topicora";
  const category = article?.category.name ?? "Useful ideas";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f8f5ee",
        color: "#191919",
        padding: "68px 76px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: "Arial, sans-serif",
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "#315b54",
            display: "flex",
            color: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          T
        </div>
        Topicora
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            color: "#315b54",
            fontFamily: "Arial, sans-serif",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {category}
        </div>
        <div
          style={{
            fontSize: title.length > 72 ? 56 : 68,
            lineHeight: 1.04,
            letterSpacing: -2,
            maxWidth: 1020,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 25,
          color: "#66645f",
        }}
      >
        Useful ideas, wherever curiosity leads.
      </div>
    </div>,
    size,
  );
}
