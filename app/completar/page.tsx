"use client";
import React, { useCallback, useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useConfig } from "@/lib/config-context";
import { hablar } from "@/lib/speech";
import { sonidoCorrecto, sonidoIncorrecto, sonidoPop } from "@/lib/sounds";

// ─── Datos ────────────────────────────────────────────────────────

interface Ejercicio {
  palabra: string;
  emoji: string;
}

const EJERCICIOS: { dificultad: string; label: string; color: string; items: Ejercicio[] }[] = [
  {
    dificultad: "facil",
    label: "Fácil",
    color: "#55EFC4",
    items: [
      { palabra: "GATO",  emoji: "🐱" }, { palabra: "PATO",  emoji: "🦆" },
      { palabra: "CASA",  emoji: "🏠" }, { palabra: "LUNA",  emoji: "🌙" },
      { palabra: "MANO",  emoji: "✋" }, { palabra: "BOCA",  emoji: "👄" },
      { palabra: "NUBE",  emoji: "☁️" }, { palabra: "MESA",  emoji: "🪑" },
      { palabra: "DEDO",  emoji: "☝️" }, { palabra: "FOCA",  emoji: "🦭" },
      { palabra: "TORO",  emoji: "🐂" }, { palabra: "ROSA",  emoji: "🌹" },
      { palabra: "SOL",   emoji: "☀️" }, { palabra: "MAR",   emoji: "🌊" },
      { palabra: "PAN",   emoji: "🍞" },
    ],
  },
  {
    dificultad: "medio",
    label: "Medio",
    color: "#FDCB6E",
    items: [
      { palabra: "PERRO",  emoji: "🐶" }, { palabra: "TIGRE",  emoji: "🐯" },
      { palabra: "ARBOL",  emoji: "🌳" }, { palabra: "PLAYA",  emoji: "🏖️" },
      { palabra: "FUEGO",  emoji: "🔥" }, { palabra: "GLOBO",  emoji: "🎈" },
      { palabra: "NIEVE",  emoji: "❄️" }, { palabra: "BURRO",  emoji: "🫏" },
      { palabra: "SAPO",   emoji: "🐸" }, { palabra: "CABRA",  emoji: "🐐" },
      { palabra: "BRUJA",  emoji: "🧙" }, { palabra: "TROMPO", emoji: "🪀" },
    ],
  },
  {
    dificultad: "dificil",
    label: "Difícil",
    color: "#FF6B6B",
    items: [
      { palabra: "BALLENA",  emoji: "🐋" }, { palabra: "COHETE",   emoji: "🚀" },
      { palabra: "MARIPOSA", emoji: "🦋" }, { palabra: "ELEFANTE", emoji: "🐘" },
      { palabra: "JIRAFA",   emoji: "🦒" }, { palabra: "GUITARRA", emoji: "🎸" },
      { palabra: "MONTANA",  emoji: "⛰️" }, { palabra: "PALMERA",  emoji: "🌴" },
      { palabra: "TORTUGA",  emoji: "🐢" }, { palabra: "ESTRELLA", emoji: "⭐" },
      { palabra: "PINGUINO", emoji: "🐧" }, { palabra: "CASCADA",  emoji: "💧" },
    ],
  },
];

const ABECEDARIO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Ronda {
  ejercicio: Ejercicio;
  color: string;
  hueco: number;
  letraCorrecta: string;
  opciones: string[];
  respondido: boolean;
  seleccionada: string | null;
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generarRonda(cantOpciones: 2 | 4, dificultad: string, excluirPalabra?: string): Ronda {
  const nivel = EJERCICIOS.find((e) => e.dificultad === dificultad) ?? EJERCICIOS[0];
  const pool = excluirPalabra ? nivel.items.filter((i) => i.palabra !== excluirPalabra) : nivel.items;
  const ejercicio = pool[Math.floor(Math.random() * pool.length)];
  const hueco = 1 + Math.floor(Math.random() * (ejercicio.palabra.length - 1));
  const letraCorrecta = ejercicio.palabra[hueco];
  const distractores = shuffled(ABECEDARIO.filter((l) => l !== letraCorrecta)).slice(0, cantOpciones - 1);
  return {
    ejercicio, color: nivel.color, hueco, letraCorrecta,
    opciones: shuffled([letraCorrecta, ...distractores]),
    respondido: false, seleccionada: null,
  };
}

// ─── Componente ───────────────────────────────────────────────────
export default function CompletarPage() {
  const { config } = useConfig();
  const [dificultad, setDificultad] = useState("facil");
  const [ronda, setRonda] = useState<Ronda>(() => generarRonda(config.cantOpciones, "facil"));
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<"correcto" | "incorrecto" | null>(null);
  const [animandoHueco, setAnimandoHueco] = useState(false);

  const color = ronda.color;
  const palabra = ronda.ejercicio.palabra;

  // ── Leer la palabra con pausa en el hueco ─────────────────────
  const leerPalabra = useCallback((r: Ronda) => {
    const partes = r.ejercicio.palabra.split("").map((l, i) => i === r.hueco ? "..." : l);
    hablar(partes.join(" "), config.velocidadVoz);
  }, [config.velocidadVoz]);

  useEffect(() => {
    setTimeout(() => leerPalabra(ronda), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ronda.ejercicio.palabra, ronda.hueco]);

  // ── Nueva ronda ───────────────────────────────────────────────
  const nuevaRonda = useCallback((ultimaPalabra?: string) => {
    setTimeout(() => {
      const nueva = generarRonda(config.cantOpciones, dificultad, ultimaPalabra);
      setRonda(nueva);
      setFeedback(null);
    }, config.autoAvanzar ? 1400 : 0);
  }, [config, dificultad]);

  // Reiniciar al cambiar dificultad
  useEffect(() => {
    const nueva = generarRonda(config.cantOpciones, dificultad);
    setRonda(nueva); setFeedback(null);
    setAciertos(0); setErrores(0); setTotal(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dificultad]);

  // ── Responder ─────────────────────────────────────────────────
  const responder = useCallback((letra: string) => {
    if (ronda.respondido) return;
    const correcto = letra === ronda.letraCorrecta;
    setAnimandoHueco(true);
    setTimeout(() => setAnimandoHueco(false), 400);
    setRonda((r) => ({ ...r, respondido: true, seleccionada: letra }));
    setFeedback(correcto ? "correcto" : "incorrecto");
    setTotal((t) => t + 1);

    if (correcto) {
      setAciertos((a) => a + 1);
      sonidoCorrecto();
      hablar(`¡Muy bien! ${ronda.ejercicio.palabra}`, config.velocidadVoz, () => {
        if (config.autoAvanzar) nuevaRonda(ronda.ejercicio.palabra);
      });
    } else {
      setErrores((e) => e + 1);
      sonidoIncorrecto();
      hablar(`No es esa. Era la ${ronda.letraCorrecta}. ${ronda.ejercicio.palabra}`, config.velocidadVoz, () => {
        if (config.autoAvanzar) nuevaRonda(ronda.ejercicio.palabra);
      });
    }
  }, [ronda, config, nuevaRonda]);

  // ── Teclado ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (ronda.respondido) return;
      const letra = e.key.toUpperCase();
      if (ronda.opciones.includes(letra)) responder(letra);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ronda, responder]);

  // ─── Estilos compartidos ──────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    backgroundColor: "rgba(20,20,30,0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "2px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 40px rgba(0,0,0,0.5)",
  };

  const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;
  const barraColor = porcentaje >= 70 ? "#55EFC4" : porcentaje >= 40 ? "#FDCB6E" : "#FF6B6B";

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D1A", color: "#fff" }}>
      <NavBar />

      <main id="contenido-principal"
        style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1rem 4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.2rem" }}>
              ✏️ Completar la Palabra
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>
              Elegí la letra que falta
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <ScorePill label="✓" valor={aciertos} color="#55EFC4" />
            <ScorePill label="✗" valor={errores} color="#FF6B6B" />
            <ScorePill label="Total" valor={total} color="rgba(255,255,255,0.4)" />
          </div>
        </div>

        {/* Selector de dificultad */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "2rem", flexWrap: "wrap" }}>
          {EJERCICIOS.map((e) => (
            <button key={e.dificultad}
              onClick={() => { setDificultad(e.dificultad); sonidoPop(); }}
              aria-pressed={dificultad === e.dificultad}
              style={{
                padding: "0.45rem 1.1rem", borderRadius: "10px",
                border: `1.5px solid ${dificultad === e.dificultad ? e.color : "rgba(255,255,255,0.1)"}`,
                backgroundColor: dificultad === e.dificultad ? `${e.color}20` : "rgba(255,255,255,0.04)",
                color: dificultad === e.dificultad ? e.color : "rgba(255,255,255,0.4)",
                fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", transition: "all 0.12s ease",
              }}>
              {e.label}
            </button>
          ))}
        </div>

        {/* ── Tarjeta principal ── */}
        <div style={{ ...cardStyle, padding: "2.5rem 2rem", marginBottom: "1.5rem",
          textAlign: "center", borderColor: `${color}30` }} aria-live="polite">

          {/* Emoji */}
          <div aria-hidden="true" style={{
            fontSize: "5rem", lineHeight: 1, marginBottom: "1.5rem",
            filter: `drop-shadow(0 8px 24px ${color}50)`,
          }}>
            {ronda.ejercicio.emoji}
          </div>

          {/* Casillas de la palabra */}
          <div role="group"
            aria-label={`Completar: ${palabra.split("").map((l, i) => i === ronda.hueco ? "blanco" : l).join(" ")}`}
            style={{ display: "flex", justifyContent: "center", gap: "8px",
              flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {palabra.split("").map((letra, i) => {
              const esHueco = i === ronda.hueco;
              const rellena = ronda.respondido && esHueco;
              const letraEnHueco = rellena ? ronda.seleccionada! : "";
              const esCorrecta = rellena && ronda.seleccionada === ronda.letraCorrecta;
              return (
                <div key={i} style={{
                  width: esHueco ? "clamp(52px,12vw,72px)" : "clamp(44px,10vw,62px)",
                  height: esHueco ? "clamp(52px,12vw,72px)" : "clamp(44px,10vw,62px)",
                  borderRadius: "14px",
                  border: esHueco
                    ? `3px solid ${rellena ? (esCorrecta ? "#55EFC4" : "#FF6B6B") : color}`
                    : "2px solid rgba(255,255,255,0.12)",
                  backgroundColor: esHueco
                    ? rellena
                      ? esCorrecta ? "rgba(85,239,196,0.15)" : "rgba(255,107,107,0.15)"
                      : `${color}15`
                    : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: esHueco ? "clamp(1.6rem,5vw,2.5rem)" : "clamp(1.4rem,4.5vw,2.2rem)",
                  fontWeight: 900,
                  color: esHueco
                    ? rellena ? (esCorrecta ? "#55EFC4" : "#FF6B6B") : color
                    : "rgba(255,255,255,0.8)",
                  transition: "all 0.25s ease",
                  transform: esHueco && animandoHueco ? "scale(1.15)" : "scale(1)",
                  boxShadow: esHueco && !rellena ? `0 0 20px ${color}30, 0 0 0 3px ${color}15` : "none",
                }}>
                  {esHueco ? (letraEnHueco || "?") : letra}
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          <div aria-live="assertive" style={{ minHeight: "1.8rem", marginBottom: "1rem" }}>
            {feedback === "correcto" && (
              <span style={{ color: "#55EFC4", fontWeight: 900, fontSize: "1.1rem" }}>
                ✓ ¡Muy bien! — {palabra}
              </span>
            )}
            {feedback === "incorrecto" && (
              <span style={{ color: "#FF6B6B", fontWeight: 900, fontSize: "1.1rem" }}>
                ✗ Era la {ronda.letraCorrecta} — {palabra}
              </span>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => leerPalabra(ronda)} aria-label="Escuchar palabra"
              style={{
                padding: "0.5rem 1.2rem", borderRadius: "12px",
                border: `1.5px solid ${color}40`, backgroundColor: `${color}10`,
                color, fontSize: "0.85rem", fontWeight: 800, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
              🔊 Escuchar
            </button>
            {ronda.respondido && !config.autoAvanzar && (
              <button onClick={() => nuevaRonda(ronda.ejercicio.palabra)} aria-label="Siguiente"
                style={{
                  padding: "0.5rem 1.4rem", borderRadius: "12px",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#fff", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer",
                }}>
                Siguiente →
              </button>
            )}
          </div>
        </div>

        {/* ── Opciones de letras ── */}
        <div style={{ ...cardStyle, padding: "1.5rem" }}>
          <p style={{
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
            marginBottom: "1rem", textAlign: "center",
          }}>
            ¿Cuál es la letra que falta?
          </p>

          <div role="grid" aria-label="Opciones de letras"
            style={{ display: "grid", gridTemplateColumns: `repeat(${config.cantOpciones}, 1fr)`, gap: "12px" }}>
            {ronda.opciones.map((letra) => {
              const esCorrecta = letra === ronda.letraCorrecta;
              const esSeleccionada = letra === ronda.seleccionada;
              let bg = "rgba(255,255,255,0.05)";
              let border = "rgba(255,255,255,0.12)";
              let clr = "#fff";
              if (ronda.respondido) {
                if (esCorrecta)    { bg = "rgba(85,239,196,0.15)"; border = "#55EFC4"; clr = "#55EFC4"; }
                else if (esSeleccionada) { bg = "rgba(255,107,107,0.15)"; border = "#FF6B6B"; clr = "#FF6B6B"; }
              }
              return (
                <button key={letra} role="gridcell"
                  onClick={() => responder(letra)}
                  aria-label={`Letra ${letra}`}
                  aria-disabled={ronda.respondido}
                  disabled={ronda.respondido}
                  style={{
                    padding: "1.4rem 0.5rem", borderRadius: "16px",
                    border: `2px solid ${border}`,
                    backgroundColor: bg, color: clr,
                    fontSize: "clamp(2rem,7vw,3rem)", fontWeight: 900,
                    cursor: ronda.respondido ? "default" : "pointer",
                    transition: "all 0.15s ease",
                    backdropFilter: "blur(8px)", textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (!ronda.respondido) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = `${color}20`;
                      el.style.borderColor = `${color}60`;
                      el.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!ronda.respondido) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = bg;
                      el.style.borderColor = border;
                      el.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {letra}
                </button>
              );
            })}
          </div>

          <p style={{
            textAlign: "center", marginTop: "1rem",
            fontSize: "0.65rem", color: "rgba(255,255,255,0.18)", fontWeight: 600,
          }}>
            También podés tipear la letra con el teclado
          </p>
        </div>

        {/* Barra de progreso de sesión */}
        {total > 0 && (
          <div style={{
            marginTop: "1.5rem", padding: "1rem 1.5rem", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)",
            backgroundColor: "rgba(255,255,255,0.03)",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>
              Sesión
            </span>
            <div style={{ flex: 1, height: "6px", borderRadius: "3px", backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div style={{
                height: "100%", borderRadius: "3px",
                width: `${porcentaje}%`, backgroundColor: barraColor,
                transition: "width 0.4s ease, background-color 0.4s ease",
              }} />
            </div>
            <span style={{ fontSize: "0.78rem", fontWeight: 900, color: barraColor }}>
              {porcentaje}%
            </span>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ScorePill({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div style={{
      padding: "0.35rem 0.85rem", borderRadius: "10px",
      border: "1.5px solid rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.04)",
      display: "flex", gap: "5px", alignItems: "center",
    }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>{label}</span>
      <span style={{ fontSize: "1rem", fontWeight: 900, color }}>{valor}</span>
    </div>
  );
}