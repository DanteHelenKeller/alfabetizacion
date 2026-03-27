"use client";
import React, { useCallback, useRef, useState } from "react";
import { useConfig } from "@/lib/config-context";
import { hablar } from "@/lib/speech";

interface SpeechButtonProps {
  texto: string;
  /** Tamaño del botón: "sm" | "md" | "lg". Default: "md" */
  size?: "sm" | "md" | "lg";
  /** Color de acento en hex. Default: "#4ECDC4" */
  color?: string;
  /** Label para lectores de pantalla */
  ariaLabel?: string;
  /** Callback cuando termina de hablar */
  onEnd?: () => void;
  className?: string;
}

const SIZE_MAP = {
  sm: { padding: "0.4rem 0.8rem", fontSize: "1rem", iconSize: "1.1rem" },
  md: { padding: "0.6rem 1.2rem", fontSize: "1.25rem", iconSize: "1.4rem" },
  lg: { padding: "0.9rem 1.8rem", fontSize: "1.6rem", iconSize: "1.8rem" },
};

export default function SpeechButton({
  texto,
  size = "md",
  color = "#4ECDC4",
  ariaLabel,
  onEnd,
  className = "",
}: SpeechButtonProps) {
  const { config } = useConfig();
  const [hablando, setHablando] = useState(false);
  const s = SIZE_MAP[size];

  const handleClick = useCallback(() => {
    if (hablando) {
      window.speechSynthesis.cancel();
      setHablando(false);
      return;
    }

    setHablando(true);
    hablar(texto, config.velocidadVoz, () => {
      setHablando(false);
      onEnd?.();
    });
  }, [texto, config.velocidadVoz, hablando, onEnd]);

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel ?? `Escuchar: ${texto}`}
      aria-pressed={hablando}
      className={`rounded-2xl font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${className}`}
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        backgroundColor: hablando ? `${color}22` : `${color}15`,
        border: `2px solid ${hablando ? color : `${color}50`}`,
        color: color,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        transform: hablando ? "scale(0.97)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!hablando)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}22`;
      }}
      onMouseLeave={(e) => {
        if (!hablando)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}15`;
      }}
    >
      <span style={{ fontSize: s.iconSize }} aria-hidden="true">
        {hablando ? "⏹️" : "🔊"}
      </span>
      <span>{hablando ? "Detener" : "Escuchar"}</span>
    </button>
  );
}
