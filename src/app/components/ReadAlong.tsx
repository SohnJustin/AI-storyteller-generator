// components/ReadAlong.tsx
"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
// import StoryGenerator from "../generate-story/page";
import { useTTS } from "@/app/hooks/useTTS";

export default function ReadAlong({ text }: { text: string }) {
  // Strip markdown for TTS + highlighting (prevents reading “asterisk”)
  const plainText = useMemo(
    () => text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1"),
    [text]
  );

  // If your useTTS currently expects the original text, pass plainText instead
  const { voices, charIndex, speak, pause, resume, stop } = useTTS(plainText);

  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tokenize the SAME text you send to TTS so boundaries align
  const tokens = useMemo(() => {
    const arr: { start: number; end: number; str: string; isWord: boolean }[] =
      [];
    let i = 0;
    for (const chunk of plainText.match(/\S+|\s+/g) ?? []) {
      arr.push({
        start: i,
        end: i + chunk.length,
        str: chunk,
        isWord: /\S/.test(chunk),
      });
      i += chunk.length;
    }
    return arr;
  }, [plainText]); // ✅ correct dep

  const activeIdx = useMemo(() => {
    if (charIndex < 0) return -1;
    let idx = tokens.findIndex(
      (t) => charIndex >= t.start && charIndex < t.end
    );
    if (idx < 0) return -1;
    while (idx < tokens.length && !tokens[idx].isWord) idx++;
    return idx < tokens.length && tokens[idx].isWord ? idx : -1;
  }, [charIndex, tokens]);

  useEffect(() => {
    if (activeIdx < 0) return;
    const el = containerRef.current?.querySelector(
      `[data-i="${activeIdx}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx]);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  if (!supported)
    return <div>Text-to-speech isn’t supported in this browser.</div>;

  return (
    <div>
      {/* controls ... unchanged */}
      <div
        ref={containerRef}
        style={{
          lineHeight: 1.8,
          fontSize: 18,
          maxHeight: 360,
          overflow: "auto",
        }}
      >
        {tokens.map((t, i) =>
          t.isWord ? (
            <span
              key={i}
              data-i={i}
              style={{
                opacity: i === activeIdx ? 1 : 0.55,
                textDecoration: i === activeIdx ? "underline" : "none",
                transition: "opacity .12s",
              }}
            >
              {t.str}
            </span>
          ) : (
            <span key={i}>{t.str}</span>
          )
        )}
      </div>
    </div>
  );
}
