"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useConfig } from "@/lib/config-context";
import { detenerVoz, hablar } from "@/lib/speech";
import { sonidoPop, sonidoCorrecto } from "@/lib/sounds";

const ORACIONES_DATA = [
  { texto: "Ana lee.", nivel: 1 },
  { texto: "Mamá ríe.", nivel: 1 },
  { texto: "El sol está saliendo.", nivel: 1 },
  { texto: "Luna brilla.", nivel: 1 },
  { texto: "Tomo agua.", nivel: 1 },
  { texto: "El gato duerme.", nivel: 1 },
  { texto: "El perro corre rápido.", nivel: 2 },
  { texto: "Voy a la escuela.", nivel: 2 },
  { texto: "Leo un cuento corto.", nivel: 2 },
  { texto: "Mi amigo salta alto.", nivel: 2 },
  { texto: "La maestra escribe en el pizarrón.", nivel: 2 },
  { texto: "Jugamos en el patio.", nivel: 2 },
  { texto: "La pelota es roja.", nivel: 2 },
  { texto: "Hoy llevo mi mochila a la escuela.", nivel: 3 },
  { texto: "El gato negro duerme en la silla.", nivel: 3 },
  { texto: "Me gusta dibujar con colores brillantes.", nivel: 3 },
  { texto: "Con mis amigos jugamos después de clase.", nivel: 3 },
  { texto: "La maestra nos lee un cuento divertido.", nivel: 3 },
  { texto: "Aprendo palabras nuevas todos los días.", nivel: 3 },
  { texto: "En casa practico la lectura con mi familia.", nivel: 3 },
];

export default function OracionesPage() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number>(1);
  const [index, setIndex] = useState(0);
  const [palabraActiva, setPalabraActiva] = useState<number | null>(null);
  const [leyendo, setLeyendo] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const oracionesFiltradas = useMemo(() => {
    return ORACIONES_DATA.filter(o => o.nivel === nivelSeleccionado);
  }, [nivelSeleccionado]);

  const oracionActual = oracionesFiltradas[index] || oracionesFiltradas[0];

  // --- LÓGICA DE MAPEO DE PALABRAS (Para resaltado perfecto) ---
  const palabrasInfo = useMemo(() => {
    const palabras = oracionActual.texto.split(" ");
    let charAcumulado = 0;
    return palabras.map((p) => {
      const inicio = oracionActual.texto.indexOf(p, charAcumulado);
      const fin = inicio + p.length;
      charAcumulado = fin;
      return { texto: p, inicio, fin };
    });
  }, [oracionActual]);

  const leerOracion = useCallback(() => {
    if (typeof window === "undefined") return;
    detenerVoz();
    setLeyendo(true);
    setPalabraActiva(null);

    // TRUCO: Agregamos una coma después de cada palabra solo para el audio 
    // para forzar al motor a no "pegar" palabras como "sol sale"
    const textoParaVoz = palabrasInfo.map(p => p.texto).join(", ");
    
    const utterance = new SpeechSynthesisUtterance(textoParaVoz);
    utterance.lang = "es-AR";
    utterance.rate = config.velocidadVoz;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        // Buscamos cuál de nuestras palabras contiene este caracter
        const idxFound = palabrasInfo.findIndex(
          p => event.charIndex >= p.inicio && event.charIndex <= p.fin
        );
        if (idxFound !== -1) setPalabraActiva(idxFound);
      }
    };

    utterance.onend = () => {
      setLeyendo(false);
      setPalabraActiva(null);
      sonidoCorrecto();
    };

    window.speechSynthesis.speak(utterance);
  }, [palabrasInfo, config.velocidadVoz]);

  const navegar = (dir: number) => {
    sonidoPop();
    detenerVoz();
    setLeyendo(false);
    setPalabraActiva(null);
    let nuevo = index + dir;
    if (nuevo < 0) nuevo = oracionesFiltradas.length - 1;
    if (nuevo >= oracionesFiltradas.length) nuevo = 0;
    setIndex(nuevo);
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D1A", color: "#fff" }}>
      <NavBar />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
        
        {/* Selectores de Nivel */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "2rem" }}>
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => { setNivelSeleccionado(n); setIndex(0); }}
              style={{
                padding: "0.8rem 1.2rem", borderRadius: "12px", fontWeight: 900,
                border: `2px solid ${nivelSeleccionado === n ? "#55EFC4" : "rgba(255,255,255,0.1)"}`,
                backgroundColor: nivelSeleccionado === n ? "#55EFC420" : "transparent",
                color: nivelSeleccionado === n ? "#55EFC4" : "rgba(255,255,255,0.4)",
                cursor: "pointer"
              }}>
              Nivel {n}
            </button>
          ))}
        </div>

        <div style={{
          backgroundColor: "rgba(20,20,30,0.8)",
          border: "2px solid rgba(85, 239, 196, 0.2)",
          borderRadius: "32px", padding: "4rem 2rem", textAlign: "center"
        }}>
          
          {/* Oración visual */}
          <div style={{ 
            display: "flex", flexWrap: "wrap", justifyContent: "center", 
            gap: "0.8rem", marginBottom: "4rem", minHeight: "150px", alignItems: "center"
          }}>
            {palabrasInfo.map((p, i) => (
              <span key={i} style={{
                fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
                fontWeight: 900, padding: "0.2rem 0.6rem", borderRadius: "12px",
                backgroundColor: palabraActiva === i ? "#55EFC4" : "transparent",
                color: palabraActiva === i ? "#000" : "#fff",
                transition: "all 0.1s ease"
              }}>
                {p.texto}
              </span>
            ))}
          </div>

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem" }}>
            <button onClick={() => navegar(-1)} style={btnStyle}>Anterior</button>
            
            <button onClick={leerOracion} disabled={leyendo}
              style={{
                width: "100px", height: "100px", borderRadius: "50%",
                backgroundColor: leyendo ? "#222" : "#55EFC4",
                border: "none", cursor: "pointer", fontSize: "2.5rem"
              }}>
              {leyendo ? "⏳" : "🔊"}
            </button>

            <button onClick={() => navegar(1)} style={btnStyle}>Siguiente</button>
          </div>
          
          <p style={{ marginTop: "2rem", color: "rgba(255,255,255,0.2)", fontWeight: "bold" }}>
            {index + 1} / {oracionesFiltradas.length}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "1rem 1.5rem", borderRadius: "15px", backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: "bold", cursor: "pointer"
};