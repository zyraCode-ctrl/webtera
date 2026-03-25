"use client";

import Link from "next/link";

export function PostCard({
  id,
  title,
  preview,
  igLink,
  downloadLink,
}: {
  id: string;
  title: string;
  preview: string;
  igLink?: string;
  downloadLink?: string;
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

      {/* Post number badge */}
      <div
        style={{
          display: "inline-block",
          background: "rgba(99,102,241,0.2)",
          border: "1px solid rgba(99,102,241,0.4)",
          borderRadius: "20px",
          padding: "2px 10px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#a5b4fc",
          letterSpacing: "0.05em",
          marginBottom: "10px",
        }}
      >
        POST #{id}
      </div>

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

      {/* 3 Action Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
        }}
      >
        {/* Full Video Button */}
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
          <span>Full Video</span>
        </Link>

        {/* Instagram Button */}
        {igLink ? (
          <a
            href={igLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "linear-gradient(135deg, #e1306c, #fd1d1d, #f77737)",
              borderRadius: "12px",
              padding: "10px 6px",
              color: "#fff",
              textDecoration: "none",
              fontSize: "11px",
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(225,48,108,0.35)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "18px" }}>📸</span>
            <span>Instagram</span>
          </a>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "10px 6px",
              color: "#475569",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: "18px" }}>📸</span>
            <span>Instagram</span>
          </div>
        )}

        {/* Download Button */}
        <Link
          href={`/out/${encodeURIComponent(id)}?from=download`}
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
          <span>Download</span>
        </Link>
      </div>
    </div>
  );
}
