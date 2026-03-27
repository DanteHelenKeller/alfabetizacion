/**
 * lib/sounds.ts
 * Efectos de sonido con Web Audio API.
 * Sin dependencias externas ni archivos de audio.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Toca un tono simple */
function tono(
  frecuencia: number,
  duracion: number,
  tipo: OscillatorType = "sine",
  volumen = 0.3
): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = tipo;
  oscillator.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(volumen, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duracion
  );

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duracion);
}

/**
 * Sonido de éxito — acorde ascendente alegre
 */
export function sonidoCorrecto(): void {
  tono(523, 0.12, "sine", 0.25);   // Do
  setTimeout(() => tono(659, 0.12, "sine", 0.25), 100); // Mi
  setTimeout(() => tono(784, 0.2, "sine", 0.25), 200);  // Sol
}

/**
 * Sonido de error — tono grave descendente
 */
export function sonidoIncorrecto(): void {
  tono(300, 0.08, "square", 0.15);
  setTimeout(() => tono(220, 0.25, "square", 0.12), 80);
}

/**
 * Sonido de clic / pop suave
 */
export function sonidoPop(): void {
  tono(880, 0.06, "sine", 0.15);
}

/**
 * Sonido de nivel completo — fanfarria corta
 */
export function sonidoNivel(): void {
  const notas = [523, 659, 784, 1047];
  notas.forEach((nota, i) => {
    setTimeout(() => tono(nota, 0.2, "sine", 0.3), i * 120);
  });
}
