"use client";
/**
 * lib/config-context.tsx
 * Estado global de configuración de la app.
 * Se guarda en localStorage automáticamente.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

// ─── Tipos ──────────────────────────────────────────────────────────────────
export interface ConfigState {
  /** Tamaño de fuente: 1=Normal, 2=Grande, 3=Muy Grande */
  tamano: 1 | 2 | 3;
  /** Velocidad de la voz: 0.5 a 1.5 */
  velocidadVoz: number;
  /** Volumen de efectos de sonido activo */
  volumenSonidos: boolean;
  /** Avanzar automáticamente al acertar */
  autoAvanzar: boolean;
  /** Cantidad de opciones en juegos */
  cantOpciones: 2 | 4;
}

type ConfigAction =
  | { type: "SET_TAMANO"; value: 1 | 2 | 3 }
  | { type: "SET_VELOCIDAD_VOZ"; value: number }
  | { type: "TOGGLE_VOLUMEN" }
  | { type: "TOGGLE_AUTO_AVANZAR" }
  | { type: "SET_CANT_OPCIONES"; value: 2 | 4 }
  | { type: "RESET" };

// ─── Estado inicial ──────────────────────────────────────────────────────────
const DEFAULT_CONFIG: ConfigState = {
  tamano: 2,          // Grande por defecto — mejor para baja visión
  velocidadVoz: 0.85, // Un poco más lento que la velocidad normal
  volumenSonidos: true,
  autoAvanzar: true,
  cantOpciones: 4,
};

const STORAGE_KEY = "alfabetizacion-config";

// ─── Reducer ─────────────────────────────────────────────────────────────────
function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case "SET_TAMANO":
      return { ...state, tamano: action.value };
    case "SET_VELOCIDAD_VOZ":
      return { ...state, velocidadVoz: action.value };
    case "TOGGLE_VOLUMEN":
      return { ...state, volumenSonidos: !state.volumenSonidos };
    case "TOGGLE_AUTO_AVANZAR":
      return { ...state, autoAvanzar: !state.autoAvanzar };
    case "SET_CANT_OPCIONES":
      return { ...state, cantOpciones: action.value };
    case "RESET":
      return DEFAULT_CONFIG;
    default:
      return state;
  }
}

// ─── CSS: tamaño de fuente global ────────────────────────────────────────────
const FONT_SIZE_MAP: Record<1 | 2 | 3, string> = {
  1: "1rem",      // Normal   → 16px
  2: "1.25rem",   // Grande   → 20px
  3: "1.6rem",    // Muy Grande → 25.6px
};

// ─── Contexto ────────────────────────────────────────────────────────────────
interface ConfigContextValue {
  config: ConfigState;
  dispatch: React.Dispatch<ConfigAction>;
  /** Shortcut: cambia el tamaño */
  setTamano: (v: 1 | 2 | 3) => void;
  /** Shortcut: cambia la velocidad de voz */
  setVelocidadVoz: (v: number) => void;
  /** Shortcut: cambia la cantidad de opciones */
  setCantOpciones: (v: 2 | 4) => void;
  /** Clase de fuente basada en el tamaño */
  fontSizeClass: string;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, dispatch] = useReducer(configReducer, DEFAULT_CONFIG, () => {
    // Inicializar desde localStorage si existe
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Si falla el parse, usar defaults
    }
    return DEFAULT_CONFIG;
  });

  // Persistir en localStorage al cambiar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Silenciar errores de storage (modo privado, cuota llena, etc.)
    }
  }, [config]);

  // Aplicar tamaño de fuente al root del documento
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.fontSize = FONT_SIZE_MAP[config.tamano];
    }
  }, [config.tamano]);

  const setTamano = useCallback(
    (v: 1 | 2 | 3) => dispatch({ type: "SET_TAMANO", value: v }),
    []
  );

  const setVelocidadVoz = useCallback(
    (v: number) => dispatch({ type: "SET_VELOCIDAD_VOZ", value: v }),
    []
  );

  const setCantOpciones = useCallback(
    (v: 2 | 4) => dispatch({ type: "SET_CANT_OPCIONES", value: v }),
    []
  );

  const fontSizeClass =
    config.tamano === 3
      ? "text-2xl"
      : config.tamano === 2
      ? "text-xl"
      : "text-base";

  return (
    <ConfigContext.Provider
      value={{
        config,
        dispatch,
        setTamano,
        setVelocidadVoz,
        setCantOpciones,
        fontSizeClass,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig debe usarse dentro de <ConfigProvider>");
  }
  return ctx;
}
