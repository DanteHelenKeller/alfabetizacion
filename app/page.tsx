"use client";
import React, { useEffect, useState } from "react";
import GlowCard from "@/components/GlowCard";
import Footer from "@/components/Footer";

// ─── Datos de módulos ──────────────────────────────────────────────
const MODULES = [
  {
    href: "/letras",
    color: "#FF6B6B",
    emoji: "🔤",
    badge: "Módulo 1",
    title: "Letras y Sonidos",
    description: "Explorá cada letra del abecedario con audio en español",
    chips: ["A → Z", "LL", "Ñ", "CH"],
    footerLabel: "27 letras",
    actionLabel: "Explorar",
    ariaLabel: "Módulo Letras y Sonidos. Aprendé el abecedario con audio.",
  },
  {
    href: "/silabas",
    color: "#4ECDC4",
    emoji: "🖊️",
    badge: "Módulo 2",
    title: "Sílabas",
    description: "Formá y escuchá sílabas simples y combinadas",
    chips: ["MA ME MI", "SA SE SI", "Grupos"],
    footerLabel: "Progresivo",
    actionLabel: "Practicar",
    ariaLabel: "Módulo Sílabas. Aprendé sílabas simples y complejas con audio.",
  },
  {
    href: "/palabras",
    color: "#FFE66D",
    emoji: "📖",
    badge: "Módulo 3",
    title: "Palabras",
    description: "Palabras ilustradas con emoji, de 2 a 4+ letras",
    chips: ["🐱 GATO", "☀️ SOL", "🏠 CASA"],
    footerLabel: "3 niveles",
    actionLabel: "Descubrir",
    ariaLabel: "Módulo Palabras. Aprendé palabras ilustradas con imágenes y audio.",
  },
  {
    href: "/completar",
    color: "#A29BFE",
    emoji: "✏️",
    badge: "Módulo 4",
    title: "Completar la Palabra",
    description: "Elegí la letra que falta en cada palabra",
    chips: ["G_TO", "C_SA", "3-4 opciones"],
    footerLabel: "Interactivo",
    actionLabel: "Jugar",
    ariaLabel: "Módulo Completar la Palabra. Elegí la letra faltante entre opciones.",
  },
  {
    href: "/armar",
    color: "#FD79A8",
    emoji: "🧩",
    badge: "Módulo 5",
    title: "Armar Palabras",
    description: "Ordená las sílabas para formar la palabra correcta",
    chips: ["Sílabas", "Drag & drop", "Clic"],
    footerLabel: "Construcción",
    actionLabel: "Armar",
    ariaLabel: "Módulo Armar Palabras. Ordená sílabas para construir palabras.",
  },
  {
    href: "/oraciones",
    color: "#55EFC4",
    emoji: "📚",
    badge: "Módulo 6",
    title: "Lectura de Oraciones",
    description: "Oraciones cortas con resaltado palabra por palabra",
    chips: ["Texto XXL", "Velocidad", "Audio"],
    footerLabel: "Configurable",
    actionLabel: "Leer",
    ariaLabel: "Módulo Lectura de Oraciones. Leé oraciones simples con audio y resaltado.",
  },
  {
    href: "/juego",
    color: "#FDCB6E",
    emoji: "🎮",
    badge: "Módulo 7",
    title: "¿Qué dice acá?",
    description: "Mirá la imagen y elegí el nombre correcto",
    chips: ["Emoji", "3-4 opciones", "Score"],
    footerLabel: "Reconocimiento",
    actionLabel: "¡A jugar!",
    ariaLabel: "Módulo ¿Qué dice acá? Reconocé palabras a partir de imágenes.",
  },
  {
    href: "/configuracion",
    color: "#B2BEC3",
    emoji: "⚙️",
    badge: "Docente",
    title: "Configuración",
    description: "Ajustá tamaño, velocidad de voz y otras opciones",
    chips: ["Voz", "Tamaño", "Opciones"],
    footerLabel: "Guardado local",
    actionLabel: "Configurar",
    ariaLabel: "Configuración de la app. Ajustá opciones para la docente.",
  },
];

// ─── Componente ────────────────────────────────────────────────────
export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Skip link accesibilidad */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:font-black focus:rounded-lg focus:text-sm"
      >
        Saltar al contenido
      </a>

      <div
        className="min-h-screen"
        style={{ backgroundColor: "#0D0D1A", color: "#fff" }}
      >
        {/* ── Header ── */}
        <header
          className="pt-12 pb-8 px-4 text-center"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          {/* Logo escuela */}
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-escuela.png"
              alt="Escuela N° 2-006 Helen Keller, Mendoza"
              width={72}
              height={72}
              style={{ mixBlendMode: "screen", objectFit: "contain" }}
            />
          </div>

          {/* Nombre de la escuela */}
          <p
            className="text-xs font-bold tracking-widest uppercase mb-6"
            style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }}
          >
            Esc. N° 2-006 Helen Keller — Mendoza
          </p>

          {/* Título principal */}
          <h1
            className="font-black mb-3"
            style={{
              fontSize: "clamp(2rem, 7vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            App de Alfabetización
          </h1>

          {/* Subtítulo */}
          <p
            className="text-base max-w-md mx-auto"
            style={{
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.6,
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
            }}
          >
            Actividades de lectura y escritura para niños de primaria,{" "}
            <span style={{ color: "rgba(255,255,255,0.7)" }}>
              accesibles para todos
            </span>
            .
          </p>

          {/* Chips de accesibilidad */}
          <div
            className="flex flex-wrap justify-center gap-2 mt-5"
            aria-label="Compatible con baja visión, ciegos y videntes"
          >
            {[
              { label: "👁️ Baja visión", color: "#A29BFE" },
              { label: "♿ Accesible NVDA", color: "#55EFC4" },
              { label: "🔊 Audio en español", color: "#FDCB6E" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{
                  backgroundColor: `${chip.color}15`,
                  border: `1px solid ${chip.color}30`,
                  color: chip.color,
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </header>

        {/* ── Grilla de módulos ── */}
        <main
          id="contenido-principal"
          aria-label="Módulos de la aplicación"
          className="px-4 pb-16"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          {/* aria-live para anunciar cambios de contenido */}
          <div aria-live="polite" className="sr-only" id="estado-vivo" />

          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
            role="list"
            aria-label="Lista de módulos disponibles"
          >
            {MODULES.map((mod, i) => (
              <div key={mod.href} role="listitem">
                <GlowCard
                  color={mod.color}
                  emoji={mod.emoji}
                  badge={mod.badge}
                  title={mod.title}
                  description={mod.description}
                  chips={mod.chips}
                  footerLabel={mod.footerLabel}
                  actionLabel={mod.actionLabel}
                  ariaLabel={mod.ariaLabel}
                  animDelay={mounted ? i * 0.06 : 0}
                  onClick={() => {
                    window.location.href = mod.href;
                  }}
                  onFocus={() => {
                    // Anuncia el módulo al enfocar (útil para NVDA)
                    const live = document.getElementById("estado-vivo");
                    if (live) live.textContent = mod.ariaLabel ?? mod.title;
                  }}
                />
              </div>
            ))}
          </div>
        </main>

        {/* ── Footer ── */}
        <Footer />
      </div>
    </>
  );
}
