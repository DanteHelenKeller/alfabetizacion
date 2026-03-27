"use client";
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useConfig } from "@/lib/config-context";
import { hablar } from "@/lib/speech";
import { sonidoPop } from "@/lib/sounds";

export default function ConfiguracionPage() {
  const { config, dispatch, setTamano, setVelocidadVoz, setCantOpciones } = useConfig();

  // Función para probar la voz inmediatamente
  const probarVoz = () => {
    hablar("Hola, así se escucha mi voz en esta velocidad.", config.velocidadVoz);
  };

  const handleToggleAuto = () => {
    sonidoPop();
    dispatch({ type: "TOGGLE_AUTO_AVANZAR" });
  };

  const handleToggleSonido = () => {
    sonidoPop();
    dispatch({ type: "TOGGLE_VOLUMEN" });
  };

  // --- Estilos de tarjetas ---
  const sectionStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "2rem",
    marginBottom: "1.5rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 800,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "1rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D1A", color: "#fff" }}>
      <NavBar />

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 1rem" }}>
        <header style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            ⚙️ Configuración
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            Ajustá la aplicación para las necesidades del alumno.
          </p>
        </header>

        {/* --- SECCIÓN: VOZ --- */}
        <section style={sectionStyle}>
          <span style={labelStyle}>🔊 Voz y Lectura</span>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "1rem", fontWeight: "bold" }}>
              Velocidad: {config.velocidadVoz.toFixed(2)}
            </p>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={config.velocidadVoz}
              onChange={(e) => setVelocidadVoz(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#FDCB6E", cursor: "pointer" }}
            />
          </div>
          <button
            onClick={probarVoz}
            style={{
              padding: "0.8rem 1.5rem", borderRadius: "12px", border: "none",
              backgroundColor: "#FDCB6E", color: "#000", fontWeight: 900, cursor: "pointer"
            }}
          >
            🔊 Probar Voz
          </button>
        </section>

        {/* --- SECCIÓN: TAMAÑO VISUAL --- */}
        <section style={sectionStyle}>
          <span style={labelStyle}>👁️ Visual (Tamaño de letra)</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            {[
              { v: 1, lab: "Normal" },
              { v: 2, lab: "Grande" },
              { v: 3, lab: "Muy Grande" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => { sonidoPop(); setTamano(t.v as 1|2|3); }}
                style={{
                  padding: "1rem", borderRadius: "12px", fontWeight: 900,
                  border: `2px solid ${config.tamano === t.v ? "#A29BFE" : "rgba(255,255,255,0.1)"}`,
                  backgroundColor: config.tamano === t.v ? "#A29BFE20" : "transparent",
                  color: config.tamano === t.v ? "#A29BFE" : "#fff",
                  cursor: "pointer"
                }}
              >
                {t.lab}
              </button>
            ))}
          </div>
        </section>

        {/* --- SECCIÓN: JUEGO --- */}
        <section style={sectionStyle}>
          <span style={labelStyle}>🎮 Opciones de Juego</span>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <p style={{ fontWeight: "bold" }}>Avanzar automáticamente</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Pasa a la siguiente palabra al acertar</p>
            </div>
            <button
              onClick={handleToggleAuto}
              style={{
                width: "60px", height: "30px", borderRadius: "30px", border: "none",
                backgroundColor: config.autoAvanzar ? "#55EFC4" : "#444",
                position: "relative", cursor: "pointer", transition: "0.3s"
              }}
            >
              <div style={{
                width: "22px", height: "22px", backgroundColor: "#fff", borderRadius: "50%",
                position: "absolute", top: "4px", left: config.autoAvanzar ? "34px" : "4px",
                transition: "0.3s"
              }} />
            </button>
          </div>

          <div>
            <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>Cantidad de opciones</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => { sonidoPop(); setCantOpciones(n as 2|4); }}
                  style={{
                    flex: 1, padding: "1rem", borderRadius: "12px", fontWeight: 900,
                    border: `2px solid ${config.cantOpciones === n ? "#FD79A8" : "rgba(255,255,255,0.1)"}`,
                    backgroundColor: config.cantOpciones === n ? "#FD79A820" : "transparent",
                    color: config.cantOpciones === n ? "#FD79A8" : "#fff",
                    cursor: "pointer"
                  }}
                >
                  {n} opciones
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* --- RESET --- */}
        <button
          onClick={() => { sonidoPop(); dispatch({ type: "RESET" }); }}
          style={{
            width: "100%", padding: "1rem", borderRadius: "15px",
            backgroundColor: "transparent", border: "1px dashed rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.4)", fontWeight: "bold", cursor: "pointer",
            marginTop: "2rem"
          }}
        >
          Restablecer todos los valores por defecto
        </button>
      </main>

      <Footer />
    </div>
  );
}