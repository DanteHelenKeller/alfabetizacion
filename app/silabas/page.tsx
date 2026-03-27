"use client";
import React, { useCallback, useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useConfig } from "@/lib/config-context";
import { hablar } from "@/lib/speech";
import { sonidoCorrecto, sonidoIncorrecto, sonidoPop } from "@/lib/sounds";

// ─── Datos ────────────────────────────────────────────────────────

// Grupos de sílabas progresivos
const GRUPOS = [
  {
    id: "ma",
    label: "MA · ME · MI · MO · MU",
    color: "#4ECDC4",
    silabas: ["MA","ME","MI","MO","MU"],
  },
  {
    id: "sa",
    label: "SA · SE · SI · SO · SU",
    color: "#FF6B6B",
    silabas: ["SA","SE","SI","SO","SU"],
  },
  {
    id: "pa",
    label: "PA · PE · PI · PO · PU",
    color: "#FFE66D",
    silabas: ["PA","PE","PI","PO","PU"],
  },
  {
    id: "la",
    label: "LA · LE · LI · LO · LU",
    color: "#A29BFE",
    silabas: ["LA","LE","LI","LO","LU"],
  },
  {
    id: "ca",
    label: "CA · CO · CU · CE · CI",
    color: "#FD79A8",
    silabas: ["CA","CO","CU","CE","CI"],
  },
  {
    id: "ta",
    label: "TA · TE · TI · TO · TU",
    color: "#55EFC4",
    silabas: ["TA","TE","TI","TO","TU"],
  },
  {
    id: "ra",
    label: "RA · RE · RI · RO · RU",
    color: "#FDCB6E",
    silabas: ["RA","RE","RI","RO","RU"],
  },
  {
    id: "na",
    label: "NA · NE · NI · NO · NU",
    color: "#74B9FF",
    silabas: ["NA","NE","NI","NO","NU"],
  },
  {
    id: "ba",
    label: "BA · BE · BI · BO · BU",
    color: "#E17055",
    silabas: ["BA","BE","BI","BO","BU"],
  },
  {
    id: "da",
    label: "DA · DE · DI · DO · DU",
    color: "#00CEC9",
    silabas: ["DA","DE","DI","DO","DU"],
  },
  {
    id: "fa",
    label: "FA · FE · FI · FO · FU",
    color: "#6C5CE7",
    silabas: ["FA","FE","FI","FO","FU"],
  },
  {
    id: "ga",
    label: "GA · GUE · GUI · GO · GU",
    color: "#FFC300",
    silabas: ["GA","GUE","GUI","GO","GU"],
  },
  // Grupos consonánticos
  {
    id: "bla",
    label: "BLA · BLE · BLI · BLO · BLU",
    color: "#FF6B6B",
    silabas: ["BLA","BLE","BLI","BLO","BLU"],
  },
  {
    id: "tra",
    label: "TRA · TRE · TRI · TRO · TRU",
    color: "#4ECDC4",
    silabas: ["TRA","TRE","TRI","TRO","TRU"],
  },
  {
    id: "pra",
    label: "PRA · PRE · PRI · PRO · PRU",
    color: "#A29BFE",
    silabas: ["PRA","PRE","PRI","PRO","PRU"],
  },
];

// Palabras de ejemplo para cada sílaba (para el audio)
const EJEMPLO_SILABA: Record<string, string> = {
  MA:"MAMÁ", ME:"MESA", MI:"MIEL", MO:"MOTO", MU:"MUÑECA",
  SA:"SAPO", SE:"SELLO", SI:"SILLA", SO:"SOL", SU:"SUMA",
  PA:"PAPÁ", PE:"PERA", PI:"PINO", PO:"POLLO", PU:"PUMA",
  LA:"LATA", LE:"LECHE", LI:"LIBRO", LO:"LORO", LU:"LUNA",
  CA:"CAMA", CO:"COCO", CU:"CUNA", CE:"CEBRA", CI:"CINCO",
  TA:"TAPA", TE:"TELA", TI:"TIGRE", TO:"TORO", TU:"TUBO",
  RA:"RANA", RE:"REMO", RI:"RÍO", RO:"ROSA", RU:"RUEDA",
  NA:"NADO", NE:"NENA", NI:"NIÑO", NO:"NOCHE", NU:"NUBE",
  BA:"BARCO", BE:"BEBÉ", BI:"BICI", BO:"BOCA", BU:"BURRO",
  DA:"DATO", DE:"DEDO", DI:"DIENTE", DO:"DOMA", DU:"DUCHA",
  FA:"FARO", FE:"FERIA", FI:"FILA", FO:"FOCA", FU:"FUEGO",
  GA:"GATO", GUE:"GUERRA", GUI:"GUITARRA", GO:"GOMA", GU:"GUSTO",
  BLA:"BLANCO", BLE:"BLEDO", BLI:"BLÍSTER", BLO:"BLOQUE", BLU:"BLUES",
  TRA:"TREN", TRE:"TRES", TRI:"TRIGO", TRO:"TROMPO", TRU:"TRUENO",
  PRA:"PRADO", PRE:"PREMIO", PRI:"PRIMO", PRO:"PROFE", PRU:"PRUEBA",
};

type Modo = "explorar" | "juego";

interface GameState {
  silabaObjetivo: string;
  grupoColor: string;
  opciones: string[];
  respondido: boolean;
  seleccionada: string | null;
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Genera distractores tomando sílabas de otros grupos
function generarRonda(
  cantOpciones: 2 | 4,
  grupoId: string | null,
  excluir?: string
): GameState {
  // Pool de sílabas del grupo activo, o de todos
  const grupoActivo = grupoId
    ? GRUPOS.find((g) => g.id === grupoId)
    : GRUPOS[Math.floor(Math.random() * GRUPOS.length)];

  const grupo = grupoActivo ?? GRUPOS[0];
  const pool = excluir
    ? grupo.silabas.filter((s) => s !== excluir)
    : grupo.silabas;

  const objetivo = pool[Math.floor(Math.random() * pool.length)];

  // Distractores: mezcla de sílabas del mismo grupo y de otros
  const todaSilabas = GRUPOS.flatMap((g) => g.silabas).filter((s) => s !== objetivo);
  const distractores = shuffled(todaSilabas).slice(0, cantOpciones - 1);

  return {
    silabaObjetivo: objetivo,
    grupoColor: grupo.color,
    opciones: shuffled([objetivo, ...distractores]),
    respondido: false,
    seleccionada: null,
  };
}

// ─── Componente ────────────────────────────────────────────────────
export default function SilabasPage() {
  const { config } = useConfig();
  const [modo, setModo] = useState<Modo>("explorar");
  const [grupoIdx, setGrupoIdx] = useState(0);
  const [silabaIdx, setSilabaIdx] = useState(0);
  const [hablando, setHablando] = useState(false);
  const [animando, setAnimando] = useState(false);

  // Juego
  const [grupoJuegoId, setGrupoJuegoId] = useState<string | null>(null); // null = todos los grupos
  const [game, setGame] = useState<GameState>(() =>
    generarRonda(config.cantOpciones, null)
  );
  const [aciertos, setAciertos] = useState(0);
  const [rondas, setRondas] = useState(0);
  const [feedback, setFeedback] = useState<"correcto" | "incorrecto" | null>(null);

  const grupoActual = GRUPOS[grupoIdx];
  const silabaActual = grupoActual.silabas[silabaIdx];
  const color = grupoActual.color;

  // ── Hablar sílaba ──────────────────────────────────────────────
  const hablarSilaba = useCallback(
    (silaba: string) => {
      setHablando(true);
      const ejemplo = EJEMPLO_SILABA[silaba] ?? "";
      const texto = ejemplo
        ? `${silaba}... ${silaba.toLowerCase()}... como en... ${ejemplo}`
        : silaba;
      hablar(texto, config.velocidadVoz, () => setHablando(false));
    },
    [config.velocidadVoz]
  );

  // Auto-habla al cambiar sílaba en modo explorar
  useEffect(() => {
    if (modo === "explorar") hablarSilaba(silabaActual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [silabaActual, modo]);

  // ── Navegar sílabas ────────────────────────────────────────────
  const irSilaba = useCallback(
    (dir: -1 | 1) => {
      setAnimando(true);
      setTimeout(() => setAnimando(false), 250);
      sonidoPop();
      setSilabaIdx((i) => {
        const next = i + dir;
        if (next < 0) {
          // ir al grupo anterior
          setGrupoIdx((g) => {
            const prevG = (g - 1 + GRUPOS.length) % GRUPOS.length;
            setSilabaIdx(GRUPOS[prevG].silabas.length - 1);
            return prevG;
          });
          return 0; // se sobreescribe arriba
        }
        if (next >= grupoActual.silabas.length) {
          // ir al grupo siguiente
          setGrupoIdx((g) => (g + 1) % GRUPOS.length);
          return 0;
        }
        return next;
      });
    },
    [grupoActual.silabas.length]
  );

  // ── Teclado ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modo !== "explorar") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") irSilaba(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") irSilaba(-1);
      if (e.key === " " || e.key === "Enter") hablarSilaba(silabaActual);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modo, irSilaba, hablarSilaba, silabaActual]);

  // ── Nueva ronda de juego ───────────────────────────────────────
  const nuevaRonda = useCallback(
    (ultimaSilaba?: string) => {
      setTimeout(() => {
        const nueva = generarRonda(config.cantOpciones, grupoJuegoId, ultimaSilaba);
        setGame(nueva);
        setFeedback(null);
        const ej = EJEMPLO_SILABA[nueva.silabaObjetivo] ?? "";
        hablar(
          `¿Cuál es esta sílaba? ... ${nueva.silabaObjetivo}... como en... ${ej}`,
          config.velocidadVoz
        );
      }, config.autoAvanzar ? 1300 : 0);
    },
    [config, grupoJuegoId]
  );

  // Al entrar al modo juego
  useEffect(() => {
    if (modo === "juego") {
      setAciertos(0);
      setRondas(0);
      const primera = generarRonda(config.cantOpciones, grupoJuegoId);
      setGame(primera);
      setFeedback(null);
      const ej = EJEMPLO_SILABA[primera.silabaObjetivo] ?? "";
      setTimeout(() => {
        hablar(
          `¿Cuál es esta sílaba? ... ${primera.silabaObjetivo}... como en... ${ej}`,
          config.velocidadVoz
        );
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, grupoJuegoId]);

  // ── Responder ─────────────────────────────────────────────────
  const responder = useCallback(
    (silaba: string) => {
      if (game.respondido) return;
      const correcto = silaba === game.silabaObjetivo;
      setGame((g) => ({ ...g, respondido: true, seleccionada: silaba }));
      setFeedback(correcto ? "correcto" : "incorrecto");
      setRondas((r) => r + 1);

      const ejCorrecto = EJEMPLO_SILABA[game.silabaObjetivo] ?? "";
      if (correcto) {
        setAciertos((a) => a + 1);
        sonidoCorrecto();
        hablar(
          `¡Muy bien! ${silaba}... como en... ${EJEMPLO_SILABA[silaba] ?? silaba}`,
          config.velocidadVoz,
          () => { if (config.autoAvanzar) nuevaRonda(silaba); }
        );
      } else {
        sonidoIncorrecto();
        hablar(
          `No es esa. Era ${game.silabaObjetivo}... como en... ${ejCorrecto}`,
          config.velocidadVoz,
          () => { if (config.autoAvanzar) nuevaRonda(game.silabaObjetivo); }
        );
      }
    },
    [game, config, nuevaRonda]
  );

  // ─── Estilos compartidos ───────────────────────────────────────
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
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "2rem", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.2rem" }}>
              🖊️ Sílabas
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>
              Consonantes simples y grupos consonánticos
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
                  backgroundColor: modo === m ? "#4ECDC4" : "transparent",
                  color: modo === m ? "#fff" : "rgba(255,255,255,0.45)",
                  transition: "all 0.15s ease",
                }}>
                {m === "explorar" ? "Explorar" : "🎮 Escuchá y elegí"}
              </button>
            ))}
          </div>
        </div>

        {/* ══ MODO EXPLORAR ══════════════════════════════════════════ */}
        {modo === "explorar" && (
          <div>
            {/* Selector de grupo */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem" }}>
                Grupos
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                role="list" aria-label="Grupos de sílabas">
                {GRUPOS.map((g, i) => (
                  <button key={g.id} role="listitem"
                    onClick={() => { setGrupoIdx(i); setSilabaIdx(0); sonidoPop(); }}
                    aria-label={`Grupo ${g.label}`}
                    aria-current={i === grupoIdx ? "true" : undefined}
                    style={{
                      padding: "0.35rem 0.75rem", borderRadius: "10px",
                      border: `1.5px solid ${i === grupoIdx ? g.color : "rgba(255,255,255,0.1)"}`,
                      backgroundColor: i === grupoIdx ? `${g.color}20` : "rgba(255,255,255,0.04)",
                      color: i === grupoIdx ? g.color : "rgba(255,255,255,0.4)",
                      fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}>
                    {g.silabas[0]}…
                  </button>
                ))}
              </div>
            </div>

            {/* Layout 2 columnas desktop */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
              className="silabas-grid">

              {/* Columna izquierda — card sílaba */}
              <div style={{
                ...cardStyle, padding: "2rem", textAlign: "center",
                transition: "opacity 0.25s ease, transform 0.25s ease",
                opacity: animando ? 0 : 1,
                transform: animando ? "scale(0.96)" : "scale(1)",
                borderColor: `${color}30`,
              }}>
                {/* Sílaba gigante */}
                <div
                  aria-live="assertive" aria-atomic="true"
                  style={{
                    fontSize: "clamp(5rem, 18vw, 8rem)",
                    fontWeight: 900, lineHeight: 1,
                    color, letterSpacing: "-0.03em",
                    textShadow: `0 0 80px ${color}40`,
                    marginBottom: "0.5rem",
                  }}
                >
                  {silabaActual}
                </div>

                {/* Mayúscula · minúscula */}
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: "1rem" }}>
                  {silabaActual} · {silabaActual.toLowerCase()}
                </div>

                {/* Palabra ejemplo */}
                <div style={{
                  fontSize: "1rem", fontWeight: 800,
                  letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)",
                  marginBottom: "1.5rem",
                }}>
                  Como en:{" "}
                  <span style={{ color }}>
                    {EJEMPLO_SILABA[silabaActual]}
                  </span>
                </div>

                {/* Botón escuchar */}
                <button
                  onClick={() => hablarSilaba(silabaActual)}
                  aria-label={`Escuchar sílaba ${silabaActual}`}
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

              {/* Columna derecha — navegación + sílabas del grupo */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Flechas */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <button onClick={() => irSilaba(-1)} aria-label="Sílaba anterior" style={navBtnStyle}>←</button>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", fontWeight: 700 }}>
                    {silabaIdx + 1} / {grupoActual.silabas.length}
                  </span>
                  <button onClick={() => irSilaba(1)} aria-label="Sílaba siguiente" style={navBtnStyle}>→</button>
                </div>

                {/* Panel de sílabas del grupo activo */}
                <div style={{ ...cardStyle, padding: "1.2rem", flex: 1 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "1rem" }}>
                    {grupoActual.label}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    role="list" aria-label={`Sílabas del grupo ${grupoActual.label}`}>
                    {grupoActual.silabas.map((s, i) => (
                      <button key={s} role="listitem"
                        onClick={() => { setSilabaIdx(i); sonidoPop(); }}
                        aria-label={`Sílaba ${s}, ejemplo: ${EJEMPLO_SILABA[s]}`}
                        aria-current={i === silabaIdx ? "true" : undefined}
                        style={{
                          padding: "0.6rem 1rem", borderRadius: "12px",
                          border: `2px solid ${i === silabaIdx ? color : "rgba(255,255,255,0.1)"}`,
                          backgroundColor: i === silabaIdx ? `${color}20` : "rgba(255,255,255,0.04)",
                          color: i === silabaIdx ? color : "rgba(255,255,255,0.5)",
                          fontSize: "1.1rem", fontWeight: 900, cursor: "pointer",
                          transition: "all 0.12s ease", flex: 1,
                          minWidth: "60px", textAlign: "center",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Palabras ejemplo del grupo */}
                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {grupoActual.silabas.map((s, i) => (
                      <div key={s} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "4px 0",
                        borderBottom: i < grupoActual.silabas.length - 1
                          ? "1px solid rgba(255,255,255,0.05)" : "none",
                      }}>
                        <span style={{
                          fontSize: "0.75rem", fontWeight: 900, minWidth: "40px",
                          color: i === silabaIdx ? color : "rgba(255,255,255,0.3)",
                        }}>{s}</span>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.22)" }}>
                          {EJEMPLO_SILABA[s]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @media (max-width: 600px) {
                .silabas-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        )}

        {/* ══ MODO JUEGO ═════════════════════════════════════════════ */}
        {modo === "juego" && (
          <div>
            {/* Selector de grupo para jugar */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem" }}>
                Practicar con
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <button
                  onClick={() => setGrupoJuegoId(null)}
                  aria-pressed={grupoJuegoId === null}
                  style={{
                    padding: "0.35rem 0.85rem", borderRadius: "10px",
                    border: `1.5px solid ${grupoJuegoId === null ? "#4ECDC4" : "rgba(255,255,255,0.1)"}`,
                    backgroundColor: grupoJuegoId === null ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.04)",
                    color: grupoJuegoId === null ? "#4ECDC4" : "rgba(255,255,255,0.4)",
                    fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
                    transition: "all 0.12s ease",
                  }}>
                  Todos los grupos
                </button>
                {GRUPOS.map((g) => (
                  <button key={g.id}
                    onClick={() => setGrupoJuegoId(g.id)}
                    aria-pressed={grupoJuegoId === g.id}
                    style={{
                      padding: "0.35rem 0.75rem", borderRadius: "10px",
                      border: `1.5px solid ${grupoJuegoId === g.id ? g.color : "rgba(255,255,255,0.1)"}`,
                      backgroundColor: grupoJuegoId === g.id ? `${g.color}20` : "rgba(255,255,255,0.04)",
                      color: grupoJuegoId === g.id ? g.color : "rgba(255,255,255,0.4)",
                      fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}>
                    {g.silabas[0]}…
                  </button>
                ))}
              </div>
            </div>

            {/* Score */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", justifyContent: "flex-end" }}>
              <ScorePill label="Aciertos" valor={aciertos} color="#55EFC4" />
              <ScorePill label="Rondas" valor={rondas} color="rgba(255,255,255,0.4)" />
            </div>

            {/* Layout 2 columnas desktop */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}
              className="juego-grid">

              {/* Izquierda — sílaba objetivo + feedback */}
              <div style={{ ...cardStyle, padding: "2rem", textAlign: "center",
                borderColor: `${game.grupoColor}30` }}
                aria-live="polite">
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>
                  ¿Cuál es esta sílaba?
                </p>

                {/* Sílaba grande */}
                <div style={{
                  fontSize: "clamp(4rem, 14vw, 7rem)",
                  fontWeight: 900, lineHeight: 1,
                  color: feedback === "correcto" ? "#55EFC4"
                    : feedback === "incorrecto" ? "#FF6B6B"
                    : game.grupoColor,
                  textShadow: `0 0 60px ${game.grupoColor}30`,
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.03em",
                  transition: "color 0.3s ease",
                }}>
                  {game.silabaObjetivo}
                </div>

                {/* Feedback */}
                <div aria-live="assertive" style={{ minHeight: "1.8rem", marginBottom: "0.75rem" }}>
                  {feedback === "correcto" && (
                    <span style={{ color: "#55EFC4", fontWeight: 900, fontSize: "1.1rem" }}>✓ ¡Muy bien!</span>
                  )}
                  {feedback === "incorrecto" && (
                    <span style={{ color: "#FF6B6B", fontWeight: 900, fontSize: "1.1rem" }}>
                      ✗ Era {game.silabaObjetivo}
                    </span>
                  )}
                </div>

                {/* Repetir */}
                <button
                  onClick={() => {
                    const ej = EJEMPLO_SILABA[game.silabaObjetivo] ?? "";
                    hablar(`${game.silabaObjetivo}... como en... ${ej}`, config.velocidadVoz);
                  }}
                  aria-label="Escuchar sílaba de nuevo"
                  style={{
                    padding: "0.5rem 1.2rem", borderRadius: "12px",
                    border: `1.5px solid ${game.grupoColor}40`,
                    backgroundColor: `${game.grupoColor}10`,
                    color: game.grupoColor, fontSize: "0.85rem",
                    fontWeight: 800, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                >
                  🔊 Repetir
                </button>
              </div>

              {/* Derecha — opciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem",
                  fontWeight: 700, textAlign: "center" }}>
                  Elegí la sílaba
                </p>

                <div role="grid" aria-label="Opciones de respuesta"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {game.opciones.map((op) => {
                    const esCorrecta = op === game.silabaObjetivo;
                    const esSeleccionada = op === game.seleccionada;
                    let bg = "rgba(255,255,255,0.05)";
                    let border = "rgba(255,255,255,0.12)";
                    let clr = "#fff";
                    if (game.respondido) {
                      if (esCorrecta) { bg = "rgba(85,239,196,0.15)"; border = "#55EFC4"; clr = "#55EFC4"; }
                      else if (esSeleccionada) { bg = "rgba(255,107,107,0.15)"; border = "#FF6B6B"; clr = "#FF6B6B"; }
                    }
                    return (
                      <button key={op} role="gridcell"
                        onClick={() => responder(op)}
                        aria-label={`Opción: ${op}, ejemplo: ${EJEMPLO_SILABA[op] ?? ""}`}
                        aria-disabled={game.respondido}
                        disabled={game.respondido}
                        style={{
                          padding: "1.1rem 0.5rem", borderRadius: "16px",
                          border: `2px solid ${border}`,
                          backgroundColor: bg, color: clr,
                          fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
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
                        {op}
                      </button>
                    );
                  })}
                </div>

                {/* Siguiente manual */}
                {game.respondido && !config.autoAvanzar && (
                  <button onClick={() => nuevaRonda(game.silabaObjetivo)}
                    aria-label="Siguiente sílaba"
                    style={{
                      padding: "0.8rem", borderRadius: "14px", width: "100%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "#fff", fontSize: "1rem", fontWeight: 900,
                      cursor: "pointer", marginTop: "4px",
                    }}>
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

// ─── ScorePill ─────────────────────────────────────────────────────
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