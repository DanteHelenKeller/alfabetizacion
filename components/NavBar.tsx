"use client";
import React from "react";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav
      aria-label="Navegación principal"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(13,13,26,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0.75rem 1rem",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link
          href="/"
          className="font-black text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 rounded"
          style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}
          aria-label="Ir al inicio"
        >
          ← Inicio
        </Link>
      </div>
    </nav>
  );
}
