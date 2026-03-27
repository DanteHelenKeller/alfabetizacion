"use client";
import React, { useCallback, useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useConfig } from "@/lib/config-context";
import { hablar } from "@/lib/speech";
import { sonidoCorrecto, sonidoIncorrecto, sonidoPop } from "@/lib/sounds";

// ─── Datos ────────────────────────────────────────────────────────

interface Palabra {
  texto: string;
  emoji: string;
}

const NIVELES: { id: string; label: string; letras: string; color: string; palabras: Palabra[] }[] = [
  {
    id: "n1",
    label: "Nivel 1",
    letras: "2–3 letras",
    color: "#55EFC4",
    palabras: [
      { texto: "OJO",  emoji: "👁️" },
      { texto: "SOL",  emoji: "☀️" },
      { texto: "MAR",  emoji: "🌊" },
      { texto: "PAN",  emoji: "🍞" },
      { texto: "PIE",  emoji: "🦶" },
      { texto: "OSO",  emoji: "🐻" },
      { texto: "RÍO",  emoji: "🏞️" },
      { texto: "AVE",  emoji: "🐦" },
      { texto: "UVA",  emoji: "🍇" },
      { texto: "PEZ",  emoji: "🐟" },
      { texto: "TEA",  emoji: "🕯️" },
      { texto: "NAO",  emoji: "⛵" },
    ],
  },
  {
    id: "n2",
    label: "Nivel 2",
    letras: "4 letras",
    color: "#FDCB6E",
    palabras: [
      { texto: "GATO",  emoji: "🐱" },
      { texto: "PATO",  emoji: "🦆" },
      { texto: "CASA",  emoji: "🏠" },
      { texto: "LUNA",  emoji: "🌙" },
      { texto: "MANO",  emoji: "✋" },
      { texto: "BOCA",  emoji: "👄" },
      { texto: "ROJO",  emoji: "🔴" },
      { texto: "LEÑO",  emoji: "🪵" },
      { texto: "NUBE",  emoji: "☁️" },
      { texto: "MESA",  emoji: "🪑" },
      { texto: "DEDO",  emoji: "☝️" },
      { texto: "POZO",  emoji: "🕳️" },
      { texto: "FOCA",  emoji: "🦭" },
      { texto: "TORO",  emoji: "🐂" },
      { texto: "ROSA",  emoji: "🌹" },
    ],
  },
  {
    id: "n3",
    label: "Nivel 3",
    letras: "5–6 letras",
    color: "#FF6B6B",
    palabras: [
      { texto: "PERRO",   emoji: "🐶" },
      { texto: "SAPO",    emoji: "🐸" },
      { texto: "BURRO",   emoji: "🫏" },
      { texto: "PLAYA",   emoji: "🏖️" },
      { texto: "TIGRE",   emoji: "🐯" },
      { texto: "ÁRBOL",   emoji: "🌳" },
      { texto: "CABRA",   emoji: "🐐" },
      { texto: "BRUJA",   emoji: "🧙" },
      { texto: "FUEGO",   emoji: "🔥" },
      { texto: "TROMPO",  emoji: "🪀" },
      { texto: "FLECHA",  emoji: "🏹" },
      { texto: "GLOBO",   emoji: "🎈" },
      { texto: "NIEVE",   emoji: "❄️" },
      { texto: "COHETE",  emoji: "🚀" },
      { texto: "BALLENA", emoji: "🐋" },
    ],
  },
];

type Modo = "explorar" | "juego";

interface GameState {
  palabra: Palabra;
  nivelColor: string;
  opciones: Palabra[];
  respondido: boolean;
  seleccionada: string | null;
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generarRonda(
  cantOpciones: 2 | 4,
  nivelId: string | null,
  excluir?: string
): GameState {
  const nivel = nivelId
    ? NIVELES.find((n) => n.id === nivelId) ?? NIVELES[0]
    : NIVELES[Math.floor(Math.random() * NIVELES.length)];

  const pool = excluir
    ? nivel.palabras.filter((p) => p.texto !== excluir)
    : nivel.palabras;

  const objetivo = pool[Math.floor(Math.random() * pool.length)];

  // Distractores: del mismo nivel + otros niveles para variedad
  const todasPalabras = NIVELES.flatMap((n) => n.palabras).filter(
    (p) => p.texto !== objetivo.texto
  );
  const distractores = shuffled(todasPalabras).slice(0, cantOpciones - 1);

  return {
    palabra: objetivo,
    nivelColor: nivel.color,
    opciones: shuffled([objetivo, ...distractores]),
    respondido: false,
    seleccionada: null,
  };
}

// Resalta las letras de la sílaba inicial en la palabra
function resaltarInicio(palabra: string, color: string) {
  if (palabra.length <= 2) return <span style={{ color }}>{palabra}</span>;
  return (
    <>
      <span style={{ color }}>{palabra.slice(0, 2)}</span>
      <span style={{ color: "rgba(255,255,255,0.85)" }}>{palabra.slice(2)}</span>
    </>
  );
}

// ─── Componente ───────────────────────────────────────────────────
export default function PalabrasPage() {
  const { config } = useConfig();
  const [modo, setModo] = useState<Modo>("explorar");
  const [nivelIdx, setNivelIdx] = useState(0);
  const [palabraIdx, setPalabraIdx] = useState(0);
  const [hablando, setHablando] = useState(false);
  const [animando, setAnimando] = useState(false);

  // Juego
  const [nivelJuegoId, setNivelJuegoId] = useState<string | null>(null);
  const [game, setGame] = useState<GameState>(() =>
    generarRonda(config.cantOpciones, null)
  );
  const [aciertos, setAciertos] = useState(0);
  const [rondas, setRondas] = useState(0);
  const [feedback, setFeedback] = useState<"correcto" | "incorrecto" | null>(null);

  const nivelActual = NIVELES[nivelIdx];
  const palabraActual = nivelActual.palabras[palabraIdx];
  const color = nivelActual.color;

  // ── Hablar palabra ────────────────────────────────────────────
  const hablarPalabra = useCallback(
    (palabra: Palabra) => {
      setHablando(true);
      // Deletrea la palabra y luego la dice completa
      const letras = palabra.texto.split("").join("... ");
      const texto = `${palabra.texto}... ${letras}... ${palabra.texto}`;
      hablar(texto, config.velocidadVoz, () => setHablando(false));
    },
    [config.velocidadVoz]
  );

  useEffect(() => {
    if (modo === "explorar") hablarPalabra(palabraActual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palabraActual, modo]);

  // ── Navegar palabras ──────────────────────────────────────────
  const irPalabra = useCallback(
    (dir: -1 | 1) => {
      setAnimando(true);
      setTimeout(() => setAnimando(false), 250);
      sonidoPop();
      setPalabraIdx((i) => {
        const next = i + dir;
        if (next < 0) {
          const prevNivel = (nivelIdx - 1 + NIVELES.length) % NIVELES.length;
          setNivelIdx(prevNivel);
          setPalabraIdx(NIVELES[prevNivel].palabras.length - 1);
          return 0;
        }
        if (next >= nivelActual.palabras.length) {
          setNivelIdx((n) => (n + 1) % NIVELES.length);
          return 0;
        }
        return next;
      });
    },
    [nivelIdx, nivelActual.palabras.length]
  );

  // ── Teclado ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modo !== "explorar") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") irPalabra(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") irPalabra(-1);
      if (e.key === " " || e.key === "Enter") hablarPalabra(palabraActual);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modo, irPalabra, hablarPalabra, palabraActual]);

  // ── Nueva ronda ───────────────────────────────────────────────
  const nuevaRonda = useCallback(
    (ultimaTexto?: string) => {
      setTimeout(() => {
        const nueva = generarRonda(config.cantOpciones, nivelJuegoId, ultimaTexto);
        setGame(nueva);
        setFeedback(null);
        hablar(
          `¿Qué imagen es? ... ${nueva.palabra.texto}`,
          config.velocidadVoz
        );
      }, config.autoAvanzar ? 1400 : 0);
    },
    [config, nivelJuegoId]
  );

  useEffect(() => {
    if (modo === "juego") {
      setAciertos(0);
      setRondas(0);
      const primera = generarRonda(config.cantOpciones, nivelJuegoId);
      setGame(primera);
      setFeedback(null);
      setTimeout(() => {
        hablar(`¿Cuál es esta palabra? ... ${primera.palabra.texto}`, config.velocidadVoz);
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, nivelJuegoId]);

  // ── Responder ─────────────────────────────────────────────────
  const responder = useCallback(
    (texto: string) => {
      if (game.respondido) return;
      const correcto = texto === game.palabra.texto;
      setGame((g) => ({ ...g, respondido: true, seleccionada: texto }));
      setFeedback(correcto ? "correcto" : "incorrecto");
      setRondas((r) => r + 1);

      if (correcto) {
        setAciertos((a) => a + 1);
        sonidoCorrecto();
        hablar(`¡Muy bien! ${texto}`, config.velocidadVoz, () => {
          if (config.autoAvanzar) nuevaRonda(texto);
        });
      } else {
        sonidoIncorrecto();
        hablar(
          `No es esa. Era ${game.palabra.texto}`,
          config.velocidadVoz,
          () => { if (config.autoAvanzar) nuevaRonda(game.palabra.texto); }
        );
      }
    },
    [game, config, nuevaRonda]
  );

  // ─── Estilos compartidos ──────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    backgroundColor: "rgba(20,20,30,0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "2px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 40px rgba(0,0,0,0.5)",
  };

  const navBtnStyle: React.CSSProperties = {
    width: "48px", height: "48px", borderRadius: "12px",
    border: "2px solid rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff", fontSize: "1.2rem", cursor: "pointer",
    fontWeight: 900, display: "flex", alignItems: "center",
    justifyContent: "center", transition: "all 0.15s ease",
    backdropFilter: "blur(8px)",
  };

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D1A", color: "#fff" }}>
      <NavBar />

      <main
        id="contenido-principal"
        style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem 4rem" }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "2rem", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.2rem" }}>
              📖 Palabras
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>
              De 2 letras hasta palabras más largas
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
                  backgroundColor: modo === m ? "#FDCB6E" : "transparent",
                  color: modo === m ? "#1A1A1A" : "rgba(255,255,255,0.45)",
                  transition: "all 0.15s ease",
                }}>
                {m === "explorar" ? "Explorar" : "🎮 ¿Cuál es la palabra?"}
              </button>
            ))}
          </div>
        </div>

        {/* ══ MODO EXPLORAR ══════════════════════════════════════════ */}
        {modo === "explorar" && (
          <div>
            {/* Selector de nivel */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {NIVELES.map((n, i) => (
                <button key={n.id}
                  onClick={() => { setNivelIdx(i); setPalabraIdx(0); sonidoPop(); }}
                  aria-pressed={i === nivelIdx}
                  style={{
                    padding: "0.4rem 1rem", borderRadius: "10px",
                    border: `1.5px solid ${i === nivelIdx ? n.color : "rgba(255,255,255,0.1)"}`,
                    backgroundColor: i === nivelIdx ? `${n.color}20` : "rgba(255,255,255,0.04)",
                    color: i === nivelIdx ? n.color : "rgba(255,255,255,0.4)",
                    fontSize: "0.78rem", fontWeight: 800, cursor: "pointer",
                    transition: "all 0.12s ease",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
                  }}>
                  <span>{n.label}</span>
                  <span style={{ fontSize: "0.62rem", opacity: 0.7 }}>{n.letras}</span>
                </button>
              ))}
            </div>

            {/* Layout 2 columnas desktop */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
              className="palabras-grid">

              {/* Izquierda — card palabra */}
              <div style={{
                ...cardStyle, padding: "2rem", textAlign: "center",
                borderColor: `${color}30`,
                transition: "opacity 0.25s ease, transform 0.25s ease",
                opacity: animando ? 0 : 1,
                transform: animando ? "scale(0.96)" : "scale(1)",
              }}>
                {/* Emoji grande */}
                <div
                  aria-hidden="true"
                  style={{
                    fontSize: "5.5rem", lineHeight: 1,
                    marginBottom: "1rem",
                    filter: `drop-shadow(0 8px 24px ${color}50)`,
                    transition: "all 0.25s ease",
                  }}
                >
                  {palabraActual.emoji}
                </div>

                {/* Palabra con resaltado */}
                <div
                  aria-live="assertive"
                  aria-atomic="true"
                  style={{
                    fontSize: "clamp(2.5rem, 10vw, 4.5rem)",
                    fontWeight: 900, lineHeight: 1,
                    letterSpacing: "0.06em",
                    marginBottom: "1.2rem",
                    textShadow: `0 0 40px ${color}30`,
                  }}
                >
                  {resaltarInicio(palabraActual.texto, color)}
                </div>

                {/* Cantidad de letras */}
                <div style={{
                  display: "flex", justifyContent: "center", gap: "6px",
                  marginBottom: "1.5rem",
                }}>
                  {palabraActual.texto.split("").map((letra, i) => (
                    <span key={i} style={{
                      width: "32px", height: "32px",
                      borderRadius: "8px",
                      border: `2px solid ${i < 2 ? color : "rgba(255,255,255,0.15)"}`,
                      backgroundColor: i < 2 ? `${color}15` : "rgba(255,255,255,0.04)",
                      color: i < 2 ? color : "rgba(255,255,255,0.6)",
                      fontSize: "0.85rem", fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {letra}
                    </span>
                  ))}
                </div>

                {/* Botón escuchar */}
                <button
                  onClick={() => hablarPalabra(palabraActual)}
                  aria-label={`Escuchar palabra: ${palabraActual.texto}`}
                  style={{
                    padding: "0.7rem 1.6rem", borderRadius: "14px",
                    border: `2px solid ${hablando ? color : `${color}50`}`,
                    backgroundColor: hablando ? `${color}22` : `${color}12`,
                    color, fontSize: "0.95rem", fontWeight: 900, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{hablando ? "⏹️" : "🔊"}</span>
                  {hablando ? "Detener" : "Escuchar"}
                </button>
              </div>

              {/* Derecha — navegación + grilla de palabras del nivel */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Flechas */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <button onClick={() => irPalabra(-1)} aria-label="Palabra anterior" style={navBtnStyle}>←</button>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", fontWeight: 700 }}>
                    {palabraIdx + 1} / {nivelActual.palabras.length}
                  </span>
                  <button onClick={() => irPalabra(1)} aria-label="Palabra siguiente" style={navBtnStyle}>→</button>
                </div>

                {/* Grilla de palabras del nivel */}
                <div style={{ ...cardStyle, padding: "1.2rem", flex: 1 }}>
                  <p style={{
                    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
                    marginBottom: "0.9rem",
                  }}>
                    {nivelActual.label} — {nivelActual.letras}
                  </p>
                  <div
                    role="list"
                    aria-label={`Palabras del ${nivelActual.label}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                      gap: "7px",
                    }}
                  >
                    {nivelActual.palabras.map((p, i) => (
                      <button
                        key={p.texto}
                        role="listitem"
                        onClick={() => { setPalabraIdx(i); sonidoPop(); }}
                        aria-label={`Palabra ${p.texto}`}
                        aria-current={i === palabraIdx ? "true" : undefined}
                        style={{
                          padding: "0.5rem 0.3rem",
                          borderRadius: "10px",
                          border: `1.5px solid ${i === palabraIdx ? color : "rgba(255,255,255,0.08)"}`,
                          backgroundColor: i === palabraIdx ? `${color}18` : "rgba(255,255,255,0.03)",
                          cursor: "pointer",
                          transition: "all 0.12s ease",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", gap: "3px",
                        }}
                      >
                        <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{p.emoji}</span>
                        <span style={{
                          fontSize: "0.6rem", fontWeight: 800,
                          color: i === palabraIdx ? color : "rgba(255,255,255,0.35)",
                          letterSpacing: "0.05em",
                        }}>
                          {p.texto}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @media (max-width: 600px) {
                .palabras-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* ══ MODO JUEGO ═════════════════════════════════════════════ */}
        {modo === "juego" && (
          <div>
            {/* Selector de nivel para el juego */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{
                fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem",
              }}>
                Practicar con
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setNivelJuegoId(null)}
                  aria-pressed={nivelJuegoId === null}
                  style={{
                    padding: "0.35rem 0.85rem", borderRadius: "10px",
                    border: `1.5px solid ${nivelJuegoId === null ? "#FDCB6E" : "rgba(255,255,255,0.1)"}`,
                    backgroundColor: nivelJuegoId === null ? "rgba(253,203,110,0.15)" : "rgba(255,255,255,0.04)",
                    color: nivelJuegoId === null ? "#FDCB6E" : "rgba(255,255,255,0.4)",
                    fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
                    transition: "all 0.12s ease",
                  }}>
                  Todos los niveles
                </button>
                {NIVELES.map((n) => (
                  <button key={n.id}
                    onClick={() => setNivelJuegoId(n.id)}
                    aria-pressed={nivelJuegoId === n.id}
                    style={{
                      padding: "0.35rem 0.85rem", borderRadius: "10px",
                      border: `1.5px solid ${nivelJuegoId === n.id ? n.color : "rgba(255,255,255,0.1)"}`,
                      backgroundColor: nivelJuegoId === n.id ? `${n.color}20` : "rgba(255,255,255,0.04)",
                      color: nivelJuegoId === n.id ? n.color : "rgba(255,255,255,0.4)",
                      fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}>
                    {n.label} · {n.letras}
                  </button>
                ))}
              </div>
            </div>

            {/* Score */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", justifyContent: "flex-end" }}>
              <ScorePill label="Aciertos" valor={aciertos} color="#55EFC4" />
              <ScorePill label="Rondas" valor={rondas} color="rgba(255,255,255,0.4)" />
            </div>

            {/* Layout 2 columnas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}
              className="juego-palabras-grid">

              {/* Izquierda — emoji grande + feedback */}
              <div
                style={{ ...cardStyle, padding: "2rem", textAlign: "center", borderColor: `${game.nivelColor}30` }}
                aria-live="polite"
              >
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontWeight: 700, marginBottom: "1.2rem" }}>
                  ¿Cuál es esta palabra?
                </p>

                {/* Emoji gigante — la pista visual */}
                <div
                  aria-label={`Imagen: ${game.palabra.emoji}`}
                  style={{
                    fontSize: "6rem", lineHeight: 1,
                    marginBottom: "1rem",
                    filter: `drop-shadow(0 8px 28px ${game.nivelColor}40)`,
                  }}
                >
                  {game.palabra.emoji}
                </div>

                {/* Feedback */}
                <div aria-live="assertive" style={{ minHeight: "1.8rem", marginBottom: "0.75rem" }}>
                  {feedback === "correcto" && (
                    <span style={{ color: "#55EFC4", fontWeight: 900, fontSize: "1.1rem" }}>✓ ¡Muy bien!</span>
                  )}
                  {feedback === "incorrecto" && (
                    <span style={{ color: "#FF6B6B", fontWeight: 900, fontSize: "1.1rem" }}>
                      ✗ Era {game.palabra.texto}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => hablar(game.palabra.texto, config.velocidadVoz)}
                  aria-label="Escuchar palabra de nuevo"
                  style={{
                    padding: "0.5rem 1.2rem", borderRadius: "12px",
                    border: `1.5px solid ${game.nivelColor}40`,
                    backgroundColor: `${game.nivelColor}10`,
                    color: game.nivelColor, fontSize: "0.85rem",
                    fontWeight: 800, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                >
                  🔊 Repetir
                </button>
              </div>

              {/* Derecha — opciones (palabras escritas) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontWeight: 700, textAlign: "center" }}>
                  Elegí la palabra
                </p>

                <div role="grid" aria-label="Opciones de respuesta"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {game.opciones.map((op) => {
                    const esCorrecta = op.texto === game.palabra.texto;
                    const esSeleccionada = op.texto === game.seleccionada;
                    let bg = "rgba(255,255,255,0.05)";
                    let border = "rgba(255,255,255,0.12)";
                    let clr = "#fff";
                    if (game.respondido) {
                      if (esCorrecta) { bg = "rgba(85,239,196,0.15)"; border = "#55EFC4"; clr = "#55EFC4"; }
                      else if (esSeleccionada) { bg = "rgba(255,107,107,0.15)"; border = "#FF6B6B"; clr = "#FF6B6B"; }
                    }
                    return (
                      <button
                        key={op.texto}
                        role="gridcell"
                        onClick={() => responder(op.texto)}
                        aria-label={`Opción: ${op.texto}`}
                        aria-disabled={game.respondido}
                        disabled={game.respondido}
                        style={{
                          padding: "1rem 0.5rem",
                          borderRadius: "16px",
                          border: `2px solid ${border}`,
                          backgroundColor: bg, color: clr,
                          fontSize: "clamp(1rem, 3.5vw, 1.4rem)",
                          fontWeight: 900, letterSpacing: "0.06em",
                          cursor: game.respondido ? "default" : "pointer",
                          transition: "all 0.15s ease",
                          backdropFilter: "blur(8px)",
                          textAlign: "center",
                          display: "flex", flexDirection: "column",
                          alignItems: "center", gap: "6px",
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
                        {/* Emoji pequeño como ayuda visual */}
                        <span style={{ fontSize: "1.6rem", opacity: game.respondido ? 1 : 0.4 }}>
                          {op.emoji}
                        </span>
                        {op.texto}
                      </button>
                    );
                  })}
                </div>

                {game.respondido && !config.autoAvanzar && (
                  <button
                    onClick={() => nuevaRonda(game.palabra.texto)}
                    aria-label="Siguiente palabra"
                    style={{
                      padding: "0.8rem", borderRadius: "14px", width: "100%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "#fff", fontSize: "1rem", fontWeight: 900,
                      cursor: "pointer", marginTop: "4px",
                    }}
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            </div>

            <style>{`
              @media (max-width: 600px) {
                .juego-palabras-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ─── ScorePill ────────────────────────────────────────────────────
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