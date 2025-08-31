// hooks/useWebSpeech.ts
import { useEffect, useRef, useState, useCallback } from "react";

export function useTTS(text: string) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [charIndex, setCharIndex] = useState(-1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voice list (arrives async)
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (opts?: { voiceName?: string; rate?: number; pitch?: number }) => {
      if (!text) return;
      // Cancel any previous utterance
      if (speechSynthesis.speaking || speechSynthesis.pending)
        speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      if (opts?.voiceName) {
        const v = speechSynthesis
          .getVoices()
          .find((vo) => vo.name === opts.voiceName);
        if (v) u.voice = v;
      }
      u.rate = opts?.rate ?? 1;
      u.pitch = opts?.pitch ?? 1;

      // Boundary events give char offsets into original text
      u.onboundary = (e) => {
        if (typeof e.charIndex === "number") setCharIndex(e.charIndex);
      };
      u.onend = () => setCharIndex(-1);

      utterRef.current = u;
      // Must be triggered by a user gesture on iOS/Safari
      speechSynthesis.speak(u);
    },
    [text]
  );

  const pause = useCallback(() => speechSynthesis.pause(), []);
  const resume = useCallback(() => speechSynthesis.resume(), []);
  const stop = useCallback(() => {
    if (speechSynthesis.speaking || speechSynthesis.pending)
      speechSynthesis.cancel();
    setCharIndex(-1);
  }, []);

  return { voices, charIndex, speak, pause, resume, stop };
}
