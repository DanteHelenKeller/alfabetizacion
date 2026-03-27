"use client";
import React, { useState, useEffect, useCallback } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useConfig } from "@/lib/config-context";
import { hablar } from "@/lib/speech";
import { sonidoCorrecto, sonidoIncorrecto, sonidoPop } from "@/lib/sounds";

// ─── Datos de Ejercicios ───────────────────────────────────────────
const EJERCICIOS = [
  { palabra: "GATO", silabas: ["GA", "TO"], emoji: "🐱" },
  { palabra: "PATO", silabas: ["PA", "TO"], emoji: "🦆" },
  { palabra: "CASA", silabas: ["CA", "SA"], emoji: "🏠" },
  { palabra: "PELOTA", silabas: ["PE", "LO", "TA"], emoji: "⚽" },
  { palabra: "TOMATE", silabas: ["TO", "MA", "TE"], emoji: "🍅" },
  { palabra: "MUÑECA", silabas: ["MU", "ÑE", "CA"], emoji: "🪆" },
  { palabra: "ESTRELLA", silabas: ["ES", "TRE", "LLA"], emoji: "⭐" },
  { palabra: "MANZANA", silabas: ["MAN", "ZA", "NA"], emoji: "🍎" },
];

export default function ArmarPalabrasPage() {
  const { config } = useConfig();
  const [index, setIndex] = useState(0);
  const [sueltas, setSueltas] = useState<string[]>([]);
  const [armadas, setArmadas] = useState<string[]>([]);
  const [respondido, setRespondido] = useState(false);
  const [error, setError] = useState(false);

  const ejercicio = EJERCICIOS[index];

  // Mezclar sílabas
  const iniciarJuego = useCallback(() => {
    const item = EJERCICIOS[index];
    setSueltas([...item.silabas].sort(() => Math.random() - 0.5));
    setArmadas([]);
    setRespondido(false);
    setError(false);
    hablar(`Armá la palabra ${item.palabra}`, config.velocidadVoz);
  }, [index, config.velocidadVoz]);

  useEffect(() => {
    iniciarJuego();
  }, [iniciarJuego]);

  // Lógica de click en sílaba
  const seleccionarSilaba = (silaba: string, i: number) => {
    if (respondido) return;
    sonidoPop();
    
    const nuevaArmada = [...armadas, silaba];
    const nuevasSueltas = sueltas.filter((_, idx) => idx !== i);
    
    setArmadas(nuevaArmada);
    setSueltas(nuevasSueltas);

    // ¿Terminó de armar?
    if (nuevasSueltas.length === 0) {
      const palabraFinal = nuevaArmada.join("");
      if (palabraFinal === ejercicio.palabra) {
        setRespondido(true);
        sonidoCorrecto();
        hablar(`¡Excelente! ${ejercicio.palabra}`, config.velocidadVoz);
        if (config.autoAvanzar) {
          setTimeout(() => {
            setIndex((prev) => (prev + 1) % EJERCICIOS.length);
          }, 2000);
        }
      } else {
        setError(true);
        sonidoIncorrecto();
        hablar("Ese orden no es correcto, intentalo de nuevo", config.velocidadVoz);
        setTimeout(() => {
          iniciarJuego(); // Reiniciar esta palabra
        }, 2000);
      }
    }
  };

  // ─── Estilos (siguiendo tu patrón) ───────────────────────────────
  const cardStyle: React.CSSProperties = {
    backgroundColor: "rgba(20,20,30,0.8)",
    backdropFilter: "blur(16px)",
    border: "2px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D1A", color: "#fff" }}>
      <NavBar />
      
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, textAlign: "center", marginBottom: "2rem" }}>
          🧩 Armar Palabras
        </h1>

        <div style={{ ...cardStyle, borderColor: respondido ? "#55EFC4" : error ? "#FF6B6B" : "rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>{ejercicio.emoji}</div>
          
          {/* Espacio donde se van armando */}
          <div style={{ 
            display: "flex", justifyContent: "center", gap: "10px", 
            minHeight: "80px", marginBottom: "2rem", padding: "1rem",
            backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "15px",
            border: "2px dashed rgba(255,255,255,0.1)"
          }}>
            {armadas.map((s, i) => (
              <div key={i} style={{
                padding: "1rem 1.5rem", backgroundColor: "#FD79A8", color: "#000",
                borderRadius: "12px", fontSize: "2rem", fontWeight: 900,
                animation: "card-in 0.3s ease forwards"
              }}>
                {s}
              </div>
            ))}
          </div>

          {/* Sílabas sueltas para elegir */}
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Toca las sílabas en orden:
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
            {sueltas.map((s, i) => (
              <button
                key={i}
                onClick={() => seleccionarSilaba(s, i)}
                className="opcion-btn"
                style={{
                  padding: "1rem 2rem", fontSize: "2rem", fontWeight: 900,
                  borderRadius: "16px", border: "3px solid #FD79A8",
                  backgroundColor: "rgba(253, 121, 168, 0.1)", color: "#FD79A8",
                  cursor: "pointer"
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {respondido && !config.autoAvanzar && (
            <button 
              onClick={() => setIndex((prev) => (prev + 1) % EJERCICIOS.length)}
              style={{
                marginTop: "2rem", padding: "1rem 2rem", borderRadius: "12px",
                backgroundColor: "#fff", color: "#000", fontWeight: "black", border: "none"
              }}
            >
              ¡Siguiente palabra!
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}