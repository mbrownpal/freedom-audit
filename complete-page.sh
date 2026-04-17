#!/bin/bash
# Script to complete app/page.tsx with all missing component implementations

cd /home/openclaw/.openclaw/workspace/freedom-audit

# Remove the trailing comment
sed -i '$ d' app/page.tsx

# Append the missing components
cat >> app/page.tsx << 'EOFCOMPONENTS'

// UI Component Implementations

function Welcome({ clientName, clientEmail, onName, onEmail, onBegin }: any) {
  const canBegin = clientName.trim().length > 0 && clientEmail.trim().length > 0;
  return (
    <div className="fa-welcome">
      <div className="fa-welcome-inner">
        <div className="fa-eyebrow">Unbreakable Wealth · Private Intake</div>
        <h1>The <em>Freedom</em> Audit</h1>
        <p className="lede">A comprehensive map of where you actually stand.</p>
        <div className="fa-rule" />
        <p className="body">
          This audit maps your life across the dimensions that actually determine freedom. 
          It takes about 60–75 minutes. The deeper you go, the more useful your results will be. 
          If you prefer to talk rather than type, use voice-to-text on your device keyboard.
        </p>

        <div className="fa-input-grid">
          <div className="fa-input-col">
            <span className="fa-input-label">First Name</span>
            <input
              className="fa-name-input"
              type="text"
              value={clientName}
              onChange={(e) => onName(e.target.value)}
              placeholder="First name"
              autoComplete="given-name"
            />
          </div>
          <div className="fa-input-col">
            <span className="fa-input-label">Email Address</span>
            <input
              className="fa-name-input"
              type="email"
              value={clientEmail}
              onChange={(e) => onEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="meta">{TOTAL_QUESTIONS} questions · 10 sections</div>
        <button className="fa-btn" onClick={onBegin} disabled={!canBegin}>Begin</button>
      </div>
    </div>
  );
}

function ProgressBar({ current, total, sectionTitle }: any) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="fa-progress-wrap">
      <div className="fa-progress-inner">
        <div className="fa-progress-meta">
          <span className="fa-progress-section">{sectionTitle}</span>
          <span className="fa-progress-count">{current + 1} of {total}</span>
        </div>
        <div className="fa-progress-track">
          <div className="fa-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function AutoTextarea({ value, onChange, placeholder }: any) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, 160) + 'px';
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="fa-textarea"
      rows={5}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Assessment({ state, dispatch, onComplete }: any) {
  const current = QUESTIONS[state.currentQuestion];
  const value = state.answers[state.currentQuestion] || '';
  const canAdvance = value.trim().length >= 10;
  const isLast = state.currentQuestion === TOTAL_QUESTIONS - 1;

  return (
    <>
      <ProgressBar
        current={state.currentQuestion}
        total={TOTAL_QUESTIONS}
        sectionTitle={current.section}
      />
      <div className="fa-shell">
        <div className="fa-question">
          <div className="fa-section-label">{current.section}</div>
          <h2 className="fa-prompt">{current.question}</h2>

          <AutoTextarea
            value={value}
            onChange={(v: string) =>
              dispatch({ type: 'ANSWER', index: state.currentQuestion, value: v })
            }
            placeholder="Take your time…"
          />

          <div className="fa-hint">Tip: use voice-to-text for a more natural response</div>

          <div className="fa-actions">
            <button
              className="fa-btn fa-btn-ghost"
              onClick={() => dispatch({ type: 'BACK' })}
              disabled={state.currentQuestion === 0}
            >
              ← Back
            </button>
            <span className="spacer" />
            <button
              className="fa-btn"
              onClick={() => {
                if (isLast) onComplete();
                else dispatch({ type: 'NEXT' });
              }}
              disabled={!canAdvance}
            >
              {isLast ? 'Complete Audit' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Generating({ error, onRetry }: any) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % GEN_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [error]);

  return (
    <div className="fa-generating">
      <div className="fa-generating-inner">
        <div className="fa-orb" />
        {error ? (
          <>
            <div className="fa-gen-title">Something didn't land.</div>
            <div className="fa-gen-sub">Try again</div>
            <div className="fa-error">
              <div className="title">Generation Error</div>
              <div className="body">{error}</div>
              <button className="fa-btn" onClick={onRetry}>Retry</button>
            </div>
          </>
        ) : (
          <>
            <div className="fa-gen-title">{GEN_MESSAGES[idx]}</div>
            <div className="fa-gen-sub">One moment</div>
          </>
        )}
      </div>
    </div>
  );
}

function Paragraphs({ text }: { text: string }) {
  if (!text) return null;
  const chunks = String(text)
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (chunks.length === 0) return <p>{String(text)}</p>;
  return (
    <>
      {chunks.map((c, i) => (
        <p key={i}>{c}</p>
      ))}
    </>
  );
}

function GapVisual({ vision, reality }: { vision: string; reality: string }) {
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
          <div className="fa-gap-bar-marker-label" style={{ left: `${realityPct}%` }}>
            Reality
          </div>
          <div className="fa-gap-bar-vision" style={{ left: `${visionPct}%` }} />
          <div className="fa-gap-bar-marker-label" style={{ left: `${visionPct}%`, top: 44 }}>
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

function TabPanel({ id, report }: any) {
  switch (id) {
    case 'metatype':
      return (
        <div className="fa-tab-panel">
          <div className="metatype-title">{report.metatype_name}</div>
          <Paragraphs text={report.metatype_description} />
        </div>
      );
    case 'health':
      return (
        <div className="fa-tab-panel">
          <h2>Freedom of Health</h2>
          <Paragraphs text={report.pillar_health} />
        </div>
      );
    case 'relationships':
      return (
        <div className="fa-tab-panel">
          <h2>Freedom of Relationships</h2>
          <Paragraphs text={report.pillar_relationships} />
        </div>
      );
    case 'time':
      return (
        <div className="fa-tab-panel">
          <h2>Freedom of Time</h2>
          <Paragraphs text=报告.pillar_time} />
        </div>
      );
    case 'mind':
      return (
        <div className="fa-tab-panel">
          <h2>Freedom of Mind</h2>
          <Paragraphs text={report.pillar_mind} />
        </div>
      );
    case 'soul':
      return (
        <div className="fa-tab-panel">
          <h2>Freedom of Soul</h2>
          <Paragraphs text={report.pillar_soul} />
        </div>
      );
    case 'finances':
      return (
        <div className="fa-tab-panel">
          <h2>Financial Foundation</h2>
          <Paragraphs text={report.pillar_finances} />
        </div>
      );
    case 'inner':
      return (
        <div className="fa-tab-panel">
          <h2>Your Inner State</h2>
          <Paragraphs text={report.inner_state} />
          <div className="fa-divider" />
          <Paragraphs text={report.patterns} />
        </div>
      );
    case 'gap':
      return (
        <div className="fa-tab-panel">
          <h2>The Gap</h2>
          <GapVisual
            vision={report.alignment_score_vision}
            reality={report.alignment_score_reality}
          />
          <Paragraphs text={report.the_gap_narrative} />
        </div>
      );
    case 'strategy':
      return (
        <div className="fa-tab-panel">
          <h2>Your Strategy</h2>
          <Paragraphs text={report.strategy} />
        </div>
      );
    default:
      return null;
  }
}

function Report({ clientName, report, onRestart }: any) {
  const [active, setActive] = useState('metatype');

  const TABS = [
    { id: 'metatype', label: 'Your Metatype' },
    { id: 'health', label: 'Health' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'time', label: 'Time' },
    { id: 'mind', label: 'Mind' },
    { id: 'soul', label: 'Soul' },
    { id: 'finances', label: 'Finances' },
    { id: 'inner', label: 'Inner State' },
    { id: 'gap', label: 'The Gap' },
    { id: 'strategy', label: 'Strategy' },
  ];

  return (
    <div className="fa-shell">
      <div className="fa-report-head">
        <div className="eyebrow">The Freedom Audit</div>
        <h1>Your Report</h1>
        <div className="fa-rule" />
        <div className="name">Prepared for {clientName}</div>
      </div>

      <div className="fa-tabs">
        <div className="fa-tabs-scroll">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`fa-tab ${active === t.id ? 'active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <TabPanel id={active} report={report} />

      <div className="fa-report-footer">
        <div className="mark">End of Report · Unbreakable Wealth</div>
        <div className="actions">
          <button className="fa-btn" onClick={onRestart}>Start Over</button>
        </div>
      </div>
    </div>
  );
}

function ResumePrompt({ saved, onResume, onDiscard }: any) {
  const name = saved.clientName || 'you';
  return (
    <div className="fa-welcome">
      <div className="fa-welcome-inner">
        <div className="fa-eyebrow">Welcome Back</div>
        <h1>Resume where you left off</h1>
        <div className="fa-rule" />
        <p className="body">
          You have a saved assessment for {name}. Continue where you left off, or start fresh.
        </p>
        <div className="fa-resume-actions">
          <button className="fa-btn" onClick={onResume}>Resume Audit</button>
          <button className="fa-btn fa-btn-ghost" onClick={onDiscard}>Start Fresh</button>
        </div>
      </div>
    </div>
  );
}
EOFCOMPONENTS

echo "✅ page.tsx completed successfully"
