/**
 * lib/speech.ts
 * Wrapper de SpeechSynthesis API para español argentino.
 * Sin dependencias externas — usa la API nativa del browser.
 */

/**
 * Habla un texto en español con la velocidad configurada.
 * @param texto    Texto a pronunciar
 * @param velocidad  Rate de 0.5 a 1.5 (default: 1)
 * @param onEnd    Callback al terminar
 */
export function hablar(
  texto: string,
  velocidad = 1,
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancela cualquier locución en curso
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(texto);

  // Intentar voz en español argentino, con fallback a español genérico
  utterance.lang = "es-AR";
  utterance.rate = Math.max(0.5, Math.min(1.5, velocidad));
  utterance.pitch = 1.1; // Ligeramente más agudo — amigable para niños
  utterance.volume = 1;

  if (onEnd) utterance.onend = onEnd;

  // Workaround para bug en Chrome: el speechSynthesis se pausa en segundo plano
  const resumeTimer = setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      clearInterval(resumeTimer);
    } else {
      window.speechSynthesis.resume();
    }
  }, 5000);

  utterance.onend = () => {
    clearInterval(resumeTimer);
    onEnd?.();
  };

  utterance.onerror = () => {
    clearInterval(resumeTimer);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Detiene cualquier locución en curso.
 */
export function detenerVoz(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Devuelve las voces disponibles en español.
 * Útil para elegir la mejor voz disponible en el dispositivo.
 */
export function vocesEspanol(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith("es"));
}
