"use client";
import React from "react";

const FOOTER_DATA = {
  escuela: "Esc. N° 2-006 Helen Keller",
  docente: "Silvia Alejandra Suchowolski",

  desarrollador: "Dante Ezequiel Basilici",
  redes: [
    { nombre: "Portfolio", url: "https://dantebasilici.netlify.app" },
    { nombre: "GitHub", url: "https://github.com/dantebasilici" },
    {
      nombre: "LinkedIn",
      url: "https://www.linkedin.com/in/dante-ezequiel-basilici/",
    },
  ],
  logoPath: "/logo-escuela.png",
};

export default function Footer() {
  return (
    <footer
      className="px-4 py-10"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        maxWidth: "900px",
        margin: "0 auto",
      }}
      aria-label="Información de la institución y créditos"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FOOTER_DATA.logoPath}
          alt={`Logo de ${FOOTER_DATA.escuela}`}
          width={52}
          height={52}
          style={{ mixBlendMode: "screen", objectFit: "contain", flexShrink: 0 }}
        />

        {/* Créditos institucionales */}
        <div className="flex-1">
          <p
            className="font-black text-sm mb-0.5"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {FOOTER_DATA.escuela}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span className="font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
              Docente:
            </span>{" "}
            {FOOTER_DATA.docente}
          </p>
         
        </div>

        {/* Desarrollador + redes */}
        <div className="text-right">
          <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
            Desarrollado por{" "}
            <span
              className="font-bold"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {FOOTER_DATA.desarrollador}
            </span>
          </p>
          <div className="flex gap-3 justify-end">
            {FOOTER_DATA.redes.map((red) => (
              <a
                key={red.nombre}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded"
                style={{ color: "rgba(255,255,255,0.3)" }}
                aria-label={`${red.nombre} de ${FOOTER_DATA.desarrollador}, se abre en nueva pestaña`}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.3)";
                }}
              >
                {red.nombre} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
