"use client";

import Link from "next/link";

const HD_LINK =
  "https://glamournakedemployee.com/kbzj5m7n?key=3015ea85fcd181f0a2e0182ffff40304";

export function PostCard({
  id,
  title,
  preview,
}: {
  id: string;
  title: string;
  preview: string;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow accent */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "120px",
          height: "120px",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontWeight: 700,
          fontSize: "15px",
          color: "#f1f5f9",
          marginBottom: "8px",
          lineHeight: "1.4",
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontSize: "13px",
          color: "#94a3b8",
          lineHeight: "1.6",
          marginBottom: "18px",
        }}
      >
        {preview}
      </p>

      {/* 2 Action Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
      {/* View Button */}
        <Link
          href={`/out/${encodeURIComponent(id)}?from=video`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            borderRadius: "12px",
            padding: "10px 6px",
            color: "#fff",
            textDecoration: "none",
            fontSize: "11px",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(99,102,241,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)";
          }}
        >
          <span style={{ fontSize: "18px" }}>▶️</span>
          <span>VIEW</span>
        </Link>

        {/* View in HD Button */}
        <a
          href={HD_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "12px",
            padding: "10px 6px",
            color: "#fff",
            textDecoration: "none",
            fontSize: "11px",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "18px" }}>⬇️</span>
          <span>View in HD</span>
        </a>
      </div>
    </div>
  );
}
