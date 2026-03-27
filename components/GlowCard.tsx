"use client";
import React from "react";

export interface GlowCardProps {
  color: string;
  emoji?: string;
  badge?: string;
  title: string;
  description?: string;
  chips?: string[];
  footerLabel?: string;
  actionLabel?: string;
  onClick?: () => void;
  onFocus?: () => void;
  ariaLabel?: string;
  monoChips?: boolean;
  animDelay?: number;
  className?: string;
}

export default function GlowCard({
  color, emoji, badge, title, description, chips = [],
  footerLabel, actionLabel = "Abrir", onClick, onFocus,
  ariaLabel, monoChips = false, animDelay = 0, className = "",
}: GlowCardProps) {
  return (
    <button
      onClick={onClick}
      onFocus={onFocus}
      aria-label={ariaLabel ?? title}
      className={`card-in group text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${className}`}
      style={{
        aspectRatio: "1 / 1",
        width: "100%",
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "rgba(20, 20, 30, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "2px solid rgba(255,255,255,0.13)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.55)",
        animationDelay: `${animDelay}s`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-4px) scale(1.012)";
        el.style.borderColor = `${color}70`;
        el.style.backgroundColor = "rgba(24, 24, 36, 0.9)";
        el.style.boxShadow = [
          `0 0 0 1px ${color}25 inset`,
          `0 12px 40px rgba(0,0,0,0.65)`,
          `0 0 60px ${color}15`,
        ].join(", ");
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0) scale(1)";
        el.style.borderColor = "rgba(255,255,255,0.13)";
        el.style.backgroundColor = "rgba(20, 20, 30, 0.75)";
        el.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.55)";
      }}
    >
      {/* Highlight de vidrio superior */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, borderRadius: "20px", pointerEvents: "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)",
      }} />

      {/* Resplandor de color en la base */}
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", pointerEvents: "none",
        background: `radial-gradient(ellipse 90% 70% at 50% 110%, ${color}28 0%, transparent 70%)`,
      }} />

      {/* Contenido */}
      <div style={{
        position: "relative", height: "100%",
        display: "flex", flexDirection: "column",
        padding: "1.4rem 1.4rem 1.2rem",
      }}>
        {/* Fila superior: emoji + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "auto" }}>
          {emoji && (
            <span aria-hidden="true"
              className="transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
              style={{ fontSize: "3rem", lineHeight: 1, filter: `drop-shadow(0 6px 16px ${color}70)` }}>
              {emoji}
            </span>
          )}
          {badge && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.04em",
              padding: "0.3rem 0.65rem", borderRadius: "8px", whiteSpace: "nowrap",
              backgroundColor: `${color}20`, color, border: `1.5px solid ${color}40`,
            }}>
              {badge}
            </span>
          )}
        </div>

        {/* Chips */}
        {chips.length > 0 && (
          <div aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "0.75rem 0" }}>
            {chips.map((chip, i) => (
              <span key={i} style={{
                fontSize: "0.7rem", fontWeight: 700,
                padding: "0.28rem 0.65rem", borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                fontFamily: monoChips ? "'Courier New', monospace" : "inherit",
              }}>
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Bloque inferior */}
        <div style={{ marginTop: "auto" }}>
          <h3 style={{
            color: "#fff", fontSize: "1.05rem", fontWeight: 900,
            letterSpacing: "-0.02em", lineHeight: 1.2,
            marginBottom: description ? "0.3rem" : "0.75rem",
          }}>
            {title}
          </h3>
          {description && (
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.45, marginBottom: "0.75rem" }}>
              {description}
            </p>
          )}
          {(footerLabel || actionLabel) && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: "0.65rem", borderTop: "1px solid rgba(255,255,255,0.07)",
            }}>
              {footerLabel && (
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.18)" }}>
                  {footerLabel}
                </span>
              )}
              {actionLabel && (
                <span style={{
                  fontSize: "0.75rem", fontWeight: 900, color,
                  display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto",
                  transition: "gap 0.15s ease",
                }}>
                  {actionLabel} <span>↗</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
