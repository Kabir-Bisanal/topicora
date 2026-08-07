import { ImageResponse } from "next/og";

export const alt = "Topicora — Useful ideas, wherever curiosity leads.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        padding: "72px 78px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: "Arial, sans-serif",
          fontSize: 38,
          fontWeight: 800,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            background: "#315b54",
            color: "white",
            fontSize: 30,
          }}
        >
          T
        </div>
        Topicora
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: 1020,
          fontFamily: "Georgia, serif",
          fontSize: 84,
          lineHeight: 0.98,
          letterSpacing: -3,
        }}
      >
        Useful ideas, wherever curiosity leads.
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: "Arial, sans-serif",
          fontSize: 25,
          color: "#66645f",
        }}
      >
        <span>Technology</span>
        <span>·</span>
        <span>Money</span>
        <span>·</span>
        <span>Culture</span>
        <span>·</span>
        <span>Everyday life</span>
      </div>
    </div>,
    size,
  );
}
