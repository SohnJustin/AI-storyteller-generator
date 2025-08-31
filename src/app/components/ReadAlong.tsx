// components/ReadAlong.tsx
"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
import { useTTS } from "../api/text-to-speech/route";
import StoryGenerator from "../generate-story/page";
import ReactMarkdown from "react-markdown";

export default function ReadAlong({ text }: { text: string }) {
  const { voices, charIndex, speak, pause, resume, stop } = useTTS(text);
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tokenize while preserving whitespace so char offsets align
  const tokens = useMemo(() => {
    const arr: { start: number; end: number; str: string; isWord: boolean }[] =
      [];
    let i = 0;
    for (const chunk of text.match(/\S+|\s+/g) ?? []) {
      arr.push({
        start: i,
        end: i + chunk.length,
        str: chunk,
        isWord: /\S/.test(chunk),
      });
      i += chunk.length;
    }
    return arr;
  }, [<ReactMarkdown>text</ReactMarkdown>]);

  // Which token should be highlighted?
  const activeIdx = useMemo(() => {
    if (charIndex < 0) return -1;
    let idx = tokens.findIndex(
      (t) => charIndex >= t.start && charIndex < t.end
    );
    if (idx < 0) return -1;
    while (idx < tokens.length && !tokens[idx].isWord) idx++;
    return idx < tokens.length && tokens[idx].isWord ? idx : -1;
  }, [charIndex, tokens]);

  // Auto-scroll current word into view
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = containerRef.current?.querySelector(
      `[data-i="${activeIdx}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx]);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  if (!supported) {
    return (
      <div>
        Text-to-speech isn’t supported in this browser. You can still read the
        story below.
      </div>
    );
  }
  const plainText = text
    .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold markers
    .replace(/\*(.*?)\*/g, "$1"); // remove italic markers
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <button onClick={() => speak({ voiceName, rate })}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button onClick={stop}>Stop</button>

        <label>
          Voice:
          <select
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
          >
            <option value="">(default)</option>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang}){v.default ? " — default" : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rate:
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
          {rate.toFixed(2)}x
        </label>
      </div>

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
