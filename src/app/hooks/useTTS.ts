// src/app/hooks/useTTS.ts
"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export function useTTS(text: string) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [charIndex, setCharIndex] = useState(-1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (opts?: { voiceName?: string; rate?: number; pitch?: number }) => {
      if (
        !text ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      )
        return;
      if (speechSynthesis.speaking || speechSynthesis.pending)
        speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      let chosen: SpeechSynthesisVoice | undefined;
      if (opts?.voiceName) {
        chosen = speechSynthesis
          .getVoices()
          .find((vo) => vo.name === opts.voiceName);
      }
      if (!chosen) {
        chosen = speechSynthesis
          .getVoices()
          .find((vo) => vo.name.includes("Google US English"));
      }
      if (chosen) {
        u.voice = chosen;
      }
      u.rate = opts?.rate ?? 1;
      u.pitch = opts?.pitch ?? 1;

      u.onboundary = (e) => {
        if (typeof e.charIndex === "number") setCharIndex(e.charIndex);
      };
      u.onend = () => setCharIndex(-1);

      utterRef.current = u;
      speechSynthesis.speak(u);
    },
    [text]
  );

  const pause = useCallback(() => {
    if (typeof window !== "undefined") speechSynthesis.pause();
  }, []);
  const resume = useCallback(() => {
    if (typeof window !== "undefined") speechSynthesis.resume();
  }, []);
  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      if (speechSynthesis.speaking || speechSynthesis.pending)
        speechSynthesis.cancel();
      setCharIndex(-1);
    }
  }, []);

  return { voices, charIndex, speak, pause, resume, stop };
}
