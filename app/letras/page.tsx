"use client";
import React, { useCallback, useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useConfig } from "@/lib/config-context";
import { hablar } from "@/lib/speech";
import { sonidoCorrecto, sonidoIncorrecto, sonidoPop } from "@/lib/sounds";

// ─── Abecedario argentino ──────────────────────────────────────────
const LETRAS = [
  "A","B","C","D","E","F","G","H","I","J","K","L","LL",
  "M","N","Ñ","O","P","Q","R","S","T","U","V","W","X","Y","Z",
];

const EJEMPLO: Record<string, string> = {
  A:"ABEJA", B:"BURRO", C:"CASA", D:"DEDO", E:"ELEFANTE",
  F:"FOCA", G:"GATO", H:"HOJA", I:"IGLÚ", J:"JIRAFA",
  K:"KOALA", L:"LUNA", LL:"LLAVE", M:"MARIPOSA", N:"NUBE",
  Ñ:"ÑANDÚ", O:"OSO", P:"PATO", Q:"QUESO", R:"RANA",
  S:"SOL", T:"TORO", U:"UVA", V:"VACA", W:"WAFFLE",
  X:"XILÓFONO", Y:"YOYO", Z:"ZAPATO",
};

const EMOJI: Record<string, string> = {
  A:"🐝", B:"🫏", C:"🏠", D:"👆", E:"🐘",
  F:"🦭", G:"🐱", H:"🍃", I:"🏔️", J:"🦒",
  K:"🐨", L:"🌙", LL:"🔑", M:"🦋", N:"☁️",
  Ñ:"🦜", O:"🐻", P:"🦆", Q:"🧀", R:"🐸",
  S:"☀️", T:"🐂", U:"🍇", V:"🐄", W:"🧇",
  X:"🎵", Y:"🪀", Z:"👟",
};

type Modo = "explorar" | "juego";

interface GameState {
  letraObjetivo: string;
  opciones: string[];
  respondido: boolean;
  seleccionada: string | null;
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generarRonda(cantOpciones: 2 | 4, excluir?: string): GameState {
  const pool = excluir ? LETRAS.filter((l) => l !== excluir) : LETRAS;
  const objetivo = pool[Math.floor(Math.random() * pool.length)];
  const distractores = shuffled(LETRAS.filter((l) => l !== objetivo)).slice(0, cantOpciones - 1);
  return {
    letraObjetivo: objetivo,
    opciones: shuffled([objetivo, ...distractores]),
    respondido: false,
    seleccionada: null,
  };
}

// ─── Componente ────────────────────────────────────────────────────
export default function LetrasPage() {
  const { config } = useConfig();
  const [modo, setModo] = useState<Modo>("explorar");
  const [indice, setIndice] = useState(0);
  const [hablando, setHablando] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [game, setGame] = useState<GameState>(() => generarRonda(config.cantOpciones));
  const [aciertos, setAciertos] = useState(0);
  const [rondas, setRondas] = useState(0);
  const [feedback, setFeedback] = useState<"correcto" | "incorrecto" | null>(null);

  const letraActual = LETRAS[indice];

  // ── Fix 1: voz "A... de... Abeja" ──
  const hablarLetra = useCallback((letra: string) => {
    setHablando(true);
    const texto = EJEMPLO[letra]
      ? `${letra}... de... ${EJEMPLO[letra]}`
      : `La letra ${letra}`;
    hablar(texto, config.velocidadVoz, () => setHablando(false));
  }, [config.velocidadVoz]);

  useEffect(() => {
    if (modo === "explorar") hablarLetra(letraActual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letraActual, modo]);

  const ir = useCallback((dir: -1 | 1) => {
    setAnimando(true);
    setTimeout(() => setAnimando(false), 250);
    setIndice((i) => (i + dir + LETRAS.length) % LETRAS.length);
    sonidoPop();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modo !== "explorar") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") ir(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") ir(-1);
      if (e.key === " " || e.key === "Enter") hablarLetra(letraActual);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modo, ir, hablarLetra, letraActual]);

  const nuevaRonda = useCallback((ultimaLetra?: string) => {
    setTimeout(() => {
      const nueva = generarRonda(config.cantOpciones, ultimaLetra);
      setGame(nueva);
      setFeedback(null);
      // "¿Cuál es esta letra? ... B... de... Burro"
      hablar(
        `¿Cuál es esta letra? ... ${nueva.letraObjetivo}... de... ${EJEMPLO[nueva.letraObjetivo]}`,
        config.velocidadVoz
      );
    }, config.autoAvanzar ? 1300 : 0);
  }, [config]);

  useEffect(() => {
    if (modo === "juego") {
      setAciertos(0);
      setRondas(0);
      const primera = generarRonda(config.cantOpciones);
      setGame(primera);
      setFeedback(null);
      setTimeout(() => {
        hablar(
          `¿Cuál es esta letra? ... ${primera.letraObjetivo}... de... ${EJEMPLO[primera.letraObjetivo]}`,
          config.velocidadVoz
        );
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  const responder = useCallback((letra: string) => {
    if (game.respondido) return;
    const correcto = letra === game.letraObjetivo;
    setGame((g) => ({ ...g, respondido: true, seleccionada: letra }));
    setFeedback(correcto ? "correcto" : "incorrecto");
    setRondas((r) => r + 1);
    if (correcto) {
      setAciertos((a) => a + 1);
      sonidoCorrecto();
      hablar(`¡Muy bien! ${letra}... de... ${EJEMPLO[letra]}`, config.velocidadVoz, () => {
        if (config.autoAvanzar) nuevaRonda(letra);
      });
    } else {
      sonidoIncorrecto();
      hablar(
        `No es esa. Era la ${game.letraObjetivo}... de... ${EJEMPLO[game.letraObjetivo]}`,
        config.velocidadVoz,
        () => { if (config.autoAvanzar) nuevaRonda(game.letraObjetivo); }
      );
    }
  }, [game, config, nuevaRonda]);

  // ─── CARD VIDRIO — compartida entre modos ─────────────────────────
  const cardStyle: React.CSSProperties = {
    backgroundColor: "rgba(20,20,30,0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "2px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 40px rgba(0,0,0,0.5)",
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D1A", color: "#fff" }}>
      <NavBar />

      <main
        id="contenido-principal"
        style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem 4rem" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.2rem" }}>
              🔤 Letras y Sonidos
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>
              Abecedario argentino completo
            </p>
          </div>

          {/* Toggle modo */}
          <div role="group" aria-label="Seleccionar modo" style={{
            display: "flex", gap: "6px", padding: "5px",
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "14px", border: "1.5px solid rgba(255,255,255,0.1)",
          }}>
            {(["explorar", "juego"] as Modo[]).map((m) => (
              <button key={m} onClick={() => setModo(m)} aria-pressed={modo === m}
                style={{
                  padding: "0.45rem 1.1rem", borderRadius: "10px", border: "none",
                  fontSize: "0.8rem", fontWeight: 800, cursor: "pointer",
                  backgroundColor: modo === m ? "#FF6B6B" : "transparent",
                  color: modo === m ? "#fff" : "rgba(255,255,255,0.45)",
                  transition: "all 0.15s ease",
                }}>
                {m === "explorar" ? "Explorar" : "🎮 Escuchá y elegí"}
              </button>
            ))}
          </div>
        </div>

        {/* ══ MODO EXPLORAR ══════════════════════════════════════════════ */}
        {modo === "explorar" && (
          <div>
            {/* Fix 2: layout desktop lado a lado */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "1.5rem",
            }}
            className="letras-grid"
            >
              {/* Columna izquierda: card con la letra */}
              <div style={{ ...cardStyle, padding: "2rem", textAlign: "center",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                opacity: animando ? 0 : 1,
                transform: animando ? "scale(0.96)" : "scale(1)",
              }}>
                {/* Fix 3: emoji grande */}
                <div aria-hidden="true" style={{ fontSize: "5rem", lineHeight: 1, marginBottom: "0.5rem" }}>
                  {EMOJI[letraActual]}
                </div>

                {/* Letra gigante */}
                <div
                  aria-live="assertive"
                  aria-atomic="true"
                  style={{
                    fontSize: "clamp(6rem, 16vw, 9rem)",
                    fontWeight: 900, lineHeight: 1,
                    color: "#FF6B6B",
                    textShadow: "0 0 80px rgba(255,107,107,0.35)",
                    marginBottom: "0.4rem",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {letraActual}
                </div>

                {/* Mayúscula · minúscula */}
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
                  {letraActual.toUpperCase()} · {letraActual.toLowerCase()}
                </div>

                {/* Palabra ejemplo */}
                <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
                  {EJEMPLO[letraActual]}
                </div>

                {/* Botón escuchar */}
                <button
                  onClick={() => hablarLetra(letraActual)}
                  aria-label={`Escuchar: ${letraActual} de ${EJEMPLO[letraActual]}`}
                  style={{
                    padding: "0.7rem 1.6rem", borderRadius: "14px",
                    border: `2px solid ${hablando ? "#FF6B6B" : "rgba(255,107,107,0.4)"}`,
                    backgroundColor: hablando ? "rgba(255,107,107,0.2)" : "rgba(255,107,107,0.1)",
                    color: "#FF6B6B", fontSize: "0.95rem", fontWeight: 900, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{hablando ? "⏹️" : "🔊"}</span>
                  {hablando ? "Detener" : "Escuchar"}
                </button>
              </div>

              {/* Columna derecha: navegación + abecedario */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Flechas */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <button onClick={() => ir(-1)} aria-label="Letra anterior" style={navBtnStyle}>←</button>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", fontWeight: 700 }}>
                    {indice + 1} / {LETRAS.length}
                  </span>
                  <button onClick={() => ir(1)} aria-label="Letra siguiente" style={navBtnStyle}>→</button>
                </div>

                {/* Tira del abecedario */}
                <div style={{ ...cardStyle, padding: "1.2rem", flex: 1 }}>
                  <div
                    role="list"
                    aria-label="Abecedario completo"
                    style={{ display: "flex", flexWrap: "wrap", gap: "7px", justifyContent: "center" }}
                  >
                    {LETRAS.map((l, i) => (
                      <button
                        key={l}
                        role="listitem"
                        onClick={() => { setIndice(i); sonidoPop(); }}
                        aria-label={`Ir a la letra ${l}`}
                        aria-current={i === indice ? "true" : undefined}
                        style={{
                          width: "40px", height: "40px", borderRadius: "10px",
                          border: i === indice ? "2px solid #FF6B6B" : "1.5px solid rgba(255,255,255,0.1)",
                          backgroundColor: i === indice ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.04)",
                          color: i === indice ? "#FF6B6B" : "rgba(255,255,255,0.5)",
                          fontSize: l.length > 1 ? "0.62rem" : "0.9rem",
                          fontWeight: 900, cursor: "pointer", transition: "all 0.12s ease",
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CSS responsive: en mobile vuelve a columna única */}
            <style>{`
              @media (max-width: 600px) {
                .letras-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* ══ MODO JUEGO ════════════════════════════════════════════════ */}
        {modo === "juego" && (
          <div>
            {/* Score */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", justifyContent: "flex-end" }}>
              <ScorePill label="Aciertos" valor={aciertos} color="#55EFC4" />
              <ScorePill label="Rondas" valor={rondas} color="rgba(255,255,255,0.4)" />
            </div>

            {/* Fix 2: layout desktop — pregunta izq, opciones der */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              alignItems: "start",
            }}
            className="juego-grid"
            >
              {/* Izquierda: tarjeta con la letra y feedback */}
              <div style={{ ...cardStyle, padding: "2rem", textAlign: "center" }} aria-live="polite">
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>
                  ¿Cuál es esta letra?
                </p>

                {/* Fix 3: emoji grande */}
                <div aria-hidden="true" style={{ fontSize: "4.5rem", lineHeight: 1, marginBottom: "0.5rem" }}>
                  {EMOJI[game.letraObjetivo]}
                </div>

                {/* Letra grande */}
                <div style={{
                  fontSize: "clamp(5rem, 14vw, 8rem)",
                  fontWeight: 900, lineHeight: 1,
                  color: feedback === "correcto" ? "#55EFC4"
                    : feedback === "incorrecto" ? "#FF6B6B"
                    : "#FDCB6E",
                  textShadow: "0 0 60px rgba(253,203,110,0.25)",
                  marginBottom: "1rem",
                  letterSpacing: "-0.04em",
                  transition: "color 0.3s ease",
                }}>
                  {game.letraObjetivo}
                </div>

                {/* Feedback */}
                <div aria-live="assertive" style={{ minHeight: "1.8rem" }}>
                  {feedback === "correcto" && (
                    <span style={{ color: "#55EFC4", fontWeight: 900, fontSize: "1.1rem" }}>✓ ¡Muy bien!</span>
                  )}
                  {feedback === "incorrecto" && (
                    <span style={{ color: "#FF6B6B", fontWeight: 900, fontSize: "1.1rem" }}>
                      ✗ Era la {game.letraObjetivo}
                    </span>
                  )}
                </div>

                {/* Repetir audio */}
                <button
                  onClick={() => hablar(
                    `${game.letraObjetivo}... de... ${EJEMPLO[game.letraObjetivo]}`,
                    config.velocidadVoz
                  )}
                  aria-label="Escuchar letra de nuevo"
                  style={{
                    marginTop: "1rem", padding: "0.5rem 1.2rem", borderRadius: "12px",
                    border: "1.5px solid rgba(255,203,110,0.3)",
                    backgroundColor: "rgba(253,203,110,0.08)",
                    color: "#FDCB6E", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                >
                  🔊 Repetir
                </button>
              </div>

              {/* Derecha: opciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontWeight: 700, textAlign: "center" }}>
                  Elegí la letra
                </p>
                <div
                  role="grid"
                  aria-label="Opciones de respuesta"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {game.opciones.map((opcion) => {
                    const esCorrecta = opcion === game.letraObjetivo;
                    const esSeleccionada = opcion === game.seleccionada;
                    let bg = "rgba(255,255,255,0.05)";
                    let border = "rgba(255,255,255,0.12)";
                    let color = "#fff";
                    if (game.respondido) {
                      if (esCorrecta) { bg = "rgba(85,239,196,0.15)"; border = "#55EFC4"; color = "#55EFC4"; }
                      else if (esSeleccionada) { bg = "rgba(255,107,107,0.15)"; border = "#FF6B6B"; color = "#FF6B6B"; }
                    }
                    return (
                      <button
                        key={opcion}
                        role="gridcell"
                        onClick={() => responder(opcion)}
                        aria-label={`Opción: ${opcion} de ${EJEMPLO[opcion]}`}
                        aria-disabled={game.respondido}
                        disabled={game.respondido}
                        style={{
                          padding: "1.2rem 0.5rem",
                          borderRadius: "16px",
                          border: `2px solid ${border}`,
                          backgroundColor: bg,
                          color,
                          fontSize: "clamp(2.2rem, 7vw, 3.2rem)",
                          fontWeight: 900,
                          cursor: game.respondido ? "default" : "pointer",
                          transition: "all 0.15s ease",
                          backdropFilter: "blur(8px)",
                          textAlign: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (!game.respondido)
                            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          if (!game.respondido)
                            (e.currentTarget as HTMLElement).style.backgroundColor = bg;
                        }}
                      >
                        {opcion}
                      </button>
                    );
                  })}
                </div>

                {/* Botón siguiente manual */}
                {game.respondido && !config.autoAvanzar && (
                  <button
                    onClick={() => nuevaRonda(game.letraObjetivo)}
                    aria-label="Siguiente letra"
                    style={{
                      padding: "0.8rem", borderRadius: "14px", width: "100%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "#fff", fontSize: "1rem", fontWeight: 900, cursor: "pointer",
                      marginTop: "4px",
                    }}
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            </div>

            <style>{`
              @media (max-width: 600px) {
                .juego-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: "48px", height: "48px", borderRadius: "12px",
  border: "2px solid rgba(255,255,255,0.12)",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "#fff", fontSize: "1.2rem", cursor: "pointer", fontWeight: 900,
  backdropFilter: "blur(8px)", transition: "all 0.15s ease",
  display: "flex", alignItems: "center", justifyContent: "center",
};

function ScorePill({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div style={{
      padding: "0.4rem 1rem", borderRadius: "10px",
      border: "1.5px solid rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.04)",
      display: "flex", gap: "6px", alignItems: "center",
    }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>{label}</span>
      <span style={{ fontSize: "1rem", fontWeight: 900, color }}>{valor}</span>
    </div>
  );
}