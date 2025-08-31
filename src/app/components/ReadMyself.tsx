"use client";
import React from "react";

type Props = {
  text: string;
  title?: string;
  storyId?: string; // stable id for saving reading position; if missing we'll hash text
};

// Simple text hash for localStorage keys
function hashString(s: string) {
  let h = 0,
    i = 0,
    len = s.length;
  while (i < len) {
    h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  }
  return String(h >>> 0);
}

const THEMES = {
  light: { bg: "#faf7f2", fg: "#2b2116" },
  sepia: { bg: "#f1e7d0", fg: "#3a2a17" },
  night: { bg: "#0f1115", fg: "#d7d7d7" },
} as const;

export default function ReadMyself({
  text,
  title = "Your Story",
  storyId,
}: Props) {
  const [theme, setTheme] = React.useState<keyof typeof THEMES>("sepia");
  const [fontSize, setFontSize] = React.useState<number>(18);
  const [column, setColumn] = React.useState<number>(680); // content width
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const id = React.useMemo(
    () => storyId ?? hashString(text.slice(0, 1000)),
    [storyId, text]
  );
  const key = `readpos:${id}`;

  // Restore saved scroll position
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const { scrollTop } = JSON.parse(saved);
        // defer to next frame so layout is ready
        requestAnimationFrame(() => {
          el.scrollTop = scrollTop ?? 0;
        });
      } catch {
        /* ignore */
      }
    }
  }, [key]);

  // Persist scroll position (throttled)
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        localStorage.setItem(key, JSON.stringify({ scrollTop: el.scrollTop }));
        ticking = false;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [key]);

  // Progress
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    const onScroll = () => {
      const max = content.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      setProgress(p);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [text, column, fontSize]);

  // Reading time (200 wpm default)
  const words = React.useMemo(
    () => Math.max(1, (text || "").trim().split(/\s+/).length),
    [text]
  );
  const minutes = Math.max(1, Math.round(words / 200));

  // Split into paragraphs
  const paragraphs = React.useMemo(() => {
    const t = (text ?? "").replace(/\r\n/g, "\n").trim();
    return t.length ? t.split(/\n{2,}/g) : ["(No story text provided.)"];
  }, [text]);

  const themeVars = THEMES[theme];

  return (
    <div
      className="readerRoot"
      style={{ background: themeVars.bg, color: themeVars.fg }}
    >
      {/* Top bar with title + controls */}
      <div className="toolbar" role="region" aria-label="Reading controls">
        <div className="titleWrap">
          <h1 className="title" title={title}>
            {title}
          </h1>
          <div className="meta">
            {words.toLocaleString()} words · ~{minutes} min
          </div>
        </div>
        <div className="controls">
          <label className="control">
            Theme
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              {Object.keys(THEMES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="control">
            Font
            <input
              type="range"
              min={14}
              max={24}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
            />
            <span className="val">{fontSize}px</span>
          </label>
          <label className="control">
            Width
            <input
              type="range"
              min={520}
              max={860}
              step={20}
              value={column}
              onChange={(e) => setColumn(parseInt(e.target.value, 10))}
            />
            <span className="val">{column}px</span>
          </label>
          <button
            className="btn"
            onClick={() => {
              const el = containerRef.current;
              if (el) el.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Top
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress" aria-hidden>
        <div
          className="progressInner"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Scrollable reading container */}
      <div className="scroll" ref={containerRef}>
        <div
          className="content"
          ref={contentRef}
          style={{ fontSize, maxWidth: column }}
        >
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <style jsx>{`
        .readerRoot {
          height: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .toolbar {
          position: sticky;
          top: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(2px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        }
        .titleWrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .title {
          margin: 0;
          line-height: 1.2;
          font-size: 22px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .meta {
          font-size: 12px;
          opacity: 0.7;
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .control {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }
        .val {
          width: 44px;
          text-align: right;
          opacity: 0.75;
        }
        .btn {
          border: 1px solid rgba(0, 0, 0, 0.25);
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn:hover {
          filter: brightness(1.05);
        }
        .progress {
          height: 3px;
          background: rgba(0, 0, 0, 0.12);
          transform-origin: left;
        }
        .progressInner {
          height: 100%;
          background: linear-gradient(90deg, #caa76a, #7a5933);
          transform-origin: left;
          transition: transform 0.08s linear;
        }
        .scroll {
          flex: 1;
          overflow: auto;
          display: flex;
          justify-content: center;
        }
        .content {
          padding: 28px 22px 40px;
          line-height: 1.9;
        }
        .content p {
          margin: 0 0 1.2em;
        }
        @media (max-width: 640px) {
          .controls {
            gap: 8px;
          }
          .val {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
