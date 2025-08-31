// components/ReadAlong.tsx
"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
// import StoryGenerator from "../generate-story/page";
import { useTTS } from "@/app/hooks/useTTS";

function normalizeForTTS(s: string) {
  return s
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00A0/g, " ") // non‑breaking spaces → space
    .replace(/[\t\f\v]+/g, " ") // tabs/form feeds → space
    .replace(/\s+/g, " ") // collapse all whitespace
    .trim(); // trim leading/trailing
}

export default function ReadAlong({ text }: { text: string }) {
  // Strip markdown for TTS + highlighting (prevents reading “asterisk”)
  const rawPlain = useMemo(
    () => text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1"),
    [text]
  );
  const ttsText = useMemo(() => normalizeForTTS(rawPlain), [rawPlain]);

  // If your useTTS currently expects the original text, pass ttsText instead
  const { voices, charIndex, speak, pause, resume, stop } = useTTS(ttsText);

  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [usingFallback, setUsingFallback] = useState(false);
  const [fallbackIdx, setFallbackIdx] = useState(-1);
  const fallbackTimerRef = useRef<number | null>(null);
  const fallbackTickRef = useRef<number | null>(null);

  // Tokenize the SAME text you send to TTS so boundaries align
  const tokens = useMemo(() => {
    // Split into words, punctuation, and whitespace so boundary indices align better
    const pattern = /[A-Za-z0-9]+|[^A-Za-z0-9\s]+|\s+/g;
    const arr: { start: number; end: number; str: string; isWord: boolean }[] =
      [];
    let i = 0;
    for (const chunk of ttsText.match(pattern) ?? []) {
      const isWord = /[A-Za-z0-9]+/.test(chunk);
      arr.push({ start: i, end: i + chunk.length, str: chunk, isWord });
      i += chunk.length;
    }
    return arr;
  }, [ttsText]);

  const boundaryIdx = useMemo(() => {
    if (charIndex < 0) return -1;

    // Small lead to compensate for some voices reporting slightly-late boundaries
    const CHAR_LEAD = 2; // tweak to taste (1–3 chars works well)
    const adjusted = charIndex + CHAR_LEAD;

    // Find the token that contains the adjusted index
    let idx = tokens.findIndex((t) => adjusted >= t.start && adjusted < t.end);
    if (idx < 0) return -1;

    if (tokens[idx].isWord) return idx;

    // Not on a word: snap to the nearest word by character distance
    // Look backward for previous word
    let prev = idx - 1;
    while (prev >= 0 && !tokens[prev].isWord) prev--;
    // Look forward for next word
    let next = idx + 1;
    while (next < tokens.length && !tokens[next].isWord) next++;

    const distPrev =
      prev >= 0
        ? Math.abs(
            adjusted -
              Math.min(tokens[prev].end, Math.max(tokens[prev].start, adjusted))
          )
        : Number.POSITIVE_INFINITY;
    const distNext =
      next < tokens.length
        ? Math.abs(
            adjusted -
              Math.min(tokens[next].end, Math.max(tokens[next].start, adjusted))
          )
        : Number.POSITIVE_INFINITY;

    if (
      distPrev === Number.POSITIVE_INFINITY &&
      distNext === Number.POSITIVE_INFINITY
    )
      return -1;
    if (distPrev <= distNext) return prev;
    return next;
  }, [charIndex, tokens]);

  const activeIdx = usingFallback ? fallbackIdx : boundaryIdx;

  useEffect(() => {
    if (activeIdx < 0) return;
    const el = containerRef.current?.querySelector(
      `[data-i="${activeIdx}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx]);

  // If real boundary events start coming in, stop fallback
  useEffect(() => {
    if (charIndex >= 0 && usingFallback) {
      setUsingFallback(false);
      if (fallbackTickRef.current) {
        window.clearInterval(fallbackTickRef.current);
        fallbackTickRef.current = null;
      }
    }
  }, [charIndex, usingFallback]);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  if (!supported)
    return <div>Text-to-speech isn’t supported in this browser.</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            // Start TTS
            speak({ voiceName, rate });
            // After a short delay, if no boundary events arrive, enable fallback highlighting.
            if (fallbackTimerRef.current)
              window.clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = window.setTimeout(() => {
              if (charIndex < 0) {
                setUsingFallback(true);
                setFallbackIdx(0);
                // Advance through word tokens at ~WPS based on rate (180wpm ≈ 3 wps)
                // (keep fallback driven by rate)
                const wordsPerSecond = 3 * rate;
                const interval = Math.max(
                  120,
                  Math.round(1000 / wordsPerSecond)
                );
                if (fallbackTickRef.current)
                  window.clearInterval(fallbackTickRef.current);
                fallbackTickRef.current = window.setInterval(() => {
                  setFallbackIdx((prev) => {
                    // Find next word token
                    let next = prev < 0 ? 0 : prev + 1;
                    while (next < tokens.length && !tokens[next]?.isWord)
                      next++;
                    return next < tokens.length ? next : prev;
                  });
                }, interval);
              }
            }, 800);
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          ▶️ Play
        </button>
        <button
          onClick={() => {
            pause();
            if (fallbackTickRef.current) {
              window.clearInterval(fallbackTickRef.current);
              fallbackTickRef.current = null;
            }
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          ⏸️ Pause
        </button>
        <button
          onClick={() => {
            resume();
            if (usingFallback) {
              const wordsPerSecond = 3 * rate;
              const interval = Math.max(120, Math.round(1000 / wordsPerSecond));
              if (fallbackTickRef.current)
                window.clearInterval(fallbackTickRef.current);
              fallbackTickRef.current = window.setInterval(() => {
                setFallbackIdx((prev) => {
                  let next = prev < 0 ? 0 : prev + 1;
                  while (next < tokens.length && !tokens[next]?.isWord) next++;
                  return next < tokens.length ? next : prev;
                });
              }, interval);
            }
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          ▶️ Resume
        </button>
        <button
          onClick={() => {
            stop();
            if (fallbackTimerRef.current) {
              window.clearTimeout(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }
            if (fallbackTickRef.current) {
              window.clearInterval(fallbackTickRef.current);
              fallbackTickRef.current = null;
            }
            setUsingFallback(false);
            setFallbackIdx(-1);
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          ⏹️ Stop
        </button>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: 10,
          }}
        >
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

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Speed:
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
          <span style={{ opacity: 0.7 }}>{rate.toFixed(2)}x</span>
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
                backgroundColor: i === activeIdx ? "yellow" : "transparent",
                borderBottom: i === activeIdx ? "2px solid #caa76a" : "none",
                opacity: i === activeIdx ? 1 : 0.8,
                transition: "all 0.15s ease",
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
