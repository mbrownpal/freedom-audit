import { useRef, useEffect, useState } from 'react';

// Will be imported by page.tsx
export function AutoTextarea({ value, onChange, placeholder, id, autoFocus }: any) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, 160) + 'px';
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={ref}
      id={id}
      className="fa-textarea"
      rows={5}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function Paragraphs({ text }: { text: string }) {
  if (!text) return null;
  const chunks = String(text)
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (chunks.length === 0) {
    return <p>{String(text)}</p>;
  }
  return (
    <>
      {chunks.map((c, i) => (
        <p key={i}>{c}</p>
      ))}
    </>
  );
}

export function GapVisual({ vision, reality }: { vision: string; reality: string }) {
  const v = Number(vision);
  const r = Number(reality);
  const gap = Math.max(0, v - r);
  const visionPct = Math.max(0, Math.min(100, (v / 10) * 100));
  const realityPct = Math.max(0, Math.min(100, (r / 10) * 100));
  const [leftPct, rightPct] =
    realityPct <= visionPct ? [realityPct, visionPct] : [visionPct, realityPct];

  return (
    <div className="fa-gap-visual">
      <div className="fa-gap-grid">
        <div className="fa-gap-cell">
          <div className="label">Your Vision</div>
          <div className="value">{v.toFixed(1)}</div>
        </div>
        <div className="fa-gap-cell primary">
          <div className="label">The Gap</div>
          <div className="value">{gap.toFixed(1)}</div>
        </div>
        <div className="fa-gap-cell">
          <div className="label">Your Reality</div>
          <div className="value">{r.toFixed(1)}</div>
        </div>
      </div>

      <div className="fa-gap-bar-wrap">
        <div className="fa-gap-bar">
          <div
            className="fa-gap-bar-fill"
            style={{ left: `${leftPct}%`, width: `${Math.max(0, rightPct - leftPct)}%` }}
          />
          <div className="fa-gap-bar-reality" style={{ left: `${realityPct}%` }} />
          <div
            className="fa-gap-bar-marker-label"
            style={{ left: `${realityPct}%` }}
          >
            Reality
          </div>
          <div className="fa-gap-bar-vision" style={{ left: `${visionPct}%` }} />
          <div
            className="fa-gap-bar-marker-label"
            style={{ left: `${visionPct}%`, top: 44 }}
          >
            Vision
          </div>
        </div>
        <div className="fa-gap-scale">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}
