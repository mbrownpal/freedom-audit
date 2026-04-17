'use client';

import { useState, useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import './styles.css';

// Questions from prototype
const QUESTIONS = [
  { section: 'Where You Are Now', question: "How would you describe yourself and the season of life you're in right now?" },
  { section: 'Where You Are Now', question: "If we fast-forward 12 months and this next chapter has gone really well, what's different about your life?" },
  { section: 'Freedom of Health', question: "On a scale of 0-10, how do you feel about your health right now? What's working, and what's not where you'd like it to be?" },
  { section: 'Freedom of Relationships', question: 'On a scale of 0-10, how would you rate your relationships right now? Think about your partner, your family, your closest friends, and your broader community. Where do you feel most yourself, and where are you still guarding?' },
  { section: 'Freedom of Relationships', question: "Where in your life do you feel most free to be exactly who you are without editing? Where do you feel like you're still wearing a version of yourself that isn't quite true?" },
  { section: 'Freedom of Time', question: 'On a scale of 0-10, how free do you feel with your time? Walk me through how you actually spend your days. How much is chosen versus reactive?' },
  { section: 'Freedom of Mind', question: 'On a scale of 0-10, how clear and free does your mind feel on most days? Is your work energizing or draining? When during the day do you feel most like yourself?' },
  { section: 'Freedom of Mind', question: "What beliefs or stories are you carrying that you suspect aren't fully true anymore?" },
  { section: 'Freedom of Soul', question: 'On a scale of 0-10, how connected do you feel to something greater than yourself? How aligned is your work with a deeper sense of purpose? What does that even look like for you?' },
  { section: 'Financial Foundation', question: "On a scale of 0-10, how do you rate your financial situation? What's going well, and what's not where you'd like it to be?" },
  { section: 'Financial Foundation', question: "What does 'enough' look like for you, specifically? Have you ever actually defined the number?" },
  { section: 'Your Inner Landscape', question: 'When something stressful or painful happens, what goes on inside you? How does it hit, how long does it stick around, and how do you move through it?' },
  { section: 'Your Inner Landscape', question: "When you want something you don't have, how does that land? Does it drive you, distract you, or sit with you in some other way?" },
  { section: 'Your Inner Landscape', question: "How much of your day are you genuinely present versus running on autopilot or stuck in your head about what's next?" },
  { section: 'Your Inner Landscape', question: "When everything gets quiet and you're really honest with yourself, what's the undercurrent? What's running in the background?" },
  { section: 'Where It Comes From', question: "What did you witness from your father's relationship to work, money, and life? How does that show up in you today?" },
  { section: 'Where It Comes From', question: "What did you witness from your mother's relationship to work, money, and life? How does that show up in you today?" },
  { section: 'Where It Comes From', question: "What's a pattern you've identified in yourself that you've tried to change but can't quite shake? What keeps it in place?" },
  { section: 'Where It Comes From', question: 'What role did you play in your family growing up? Are you still playing some version of it?' },
  { section: 'Radical Honesty', question: 'What are you pretending not to know about your life right now?' },
  { section: 'Radical Honesty', question: 'What are you most afraid of losing if you actually got everything you say you want?' },
  { section: 'Radical Honesty', question: "If money, status, and other people's opinions were completely off the table, what would you do with the next ten years of your life?" },
];

const TOTAL_QUESTIONS = QUESTIONS.length;

const GEN_MESSAGES = [
  'Mapping your inner terrain…',
  'Reading between the lines…',
  'Synthesizing patterns…',
  'Calculating your Alignment Score…',
  'Generating your report…',
];

const initialState = {
  mode: 'welcome' as 'welcome' | 'assessment' | 'generating' | 'report',
  clientName: '',
  clientEmail: '',
  currentQuestion: 0,
  answers: {} as Record<number, string>,
  report: null as any,
  error: null as string | null,
};

type State = typeof initialState;
type Action =
  | { type: 'SET_NAME'; value: string }
  | { type: 'SET_EMAIL'; value: string }
  | { type: 'BEGIN' }
  | { type: 'ANSWER'; index: number; value: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GENERATE' }
  | { type: 'REPORT_SUCCESS'; report: any }
  | { type: 'REPORT_ERROR'; error: string | null }
  | { type: 'RESTART' }
  | { type: 'HYDRATE'; payload: Partial<State> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, clientName: action.value };
    case 'SET_EMAIL':
      return { ...state, clientEmail: action.value };
    case 'BEGIN':
      return { ...state, mode: 'assessment', currentQuestion: 0 };
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.index]: action.value },
      };
    case 'NEXT':
      if (state.currentQuestion >= TOTAL_QUESTIONS - 1) return state;
      return { ...state, currentQuestion: state.currentQuestion + 1 };
    case 'BACK':
      if (state.currentQuestion <= 0) return state;
      return { ...state, currentQuestion: state.currentQuestion - 1 };
    case 'GENERATE':
      return { ...state, mode: 'generating', error: null };
    case 'REPORT_SUCCESS':
      return { ...state, mode: 'report', report: action.report, error: null };
    case 'REPORT_ERROR':
      return { ...state, error: action.error };
    case 'RESTART':
      return initialState;
    case 'HYDRATE':
      return {
        ...initialState,
        ...action.payload,
        error: null,
        mode: action.payload.mode === 'generating' ? 'assessment' : (action.payload.mode || 'welcome'),
      };
    default:
      return state;
  }
}

export default function FreedomAudit() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [resumePrompt, setResumePrompt] = useState<Partial<State> | null>(null);

  // Load saved state on mount
  useEffect(() => {
    if (!state.clientEmail) return;
    
    fetch('/api/assessment/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.clientEmail }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Object.keys(data.data.answers || {}).length > 0) {
          setResumePrompt(data.data);
        }
      })
      .catch(console.error);
  }, [state.clientEmail]);

  // Auto-save
  useEffect(() => {
    if (state.mode === 'generating' || !state.clientEmail) return;

    const saveData = {
      email: state.clientEmail,
      clientName: state.clientName,
      currentQuestion: state.currentQuestion,
      answers: state.answers,
      report: state.report,
      status: state.mode === 'report' ? 'complete' : 'in_progress',
    };

    fetch('/api/assessment/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData),
    }).catch(console.error);
  }, [state, state.mode]);

  const runGeneration = useCallback(async () => {
    try {
      const answersArray = QUESTIONS.map((q, i) => ({
        section: q.section,
        question: q.question,
        answer: state.answers[i] || '',
      }));

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: state.clientName,
          answers: answersArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      dispatch({ type: 'REPORT_SUCCESS', report: data.report });

      // Send email in background
      fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: state.clientName,
          clientEmail: state.clientEmail,
          report: data.report,
          answers: answersArray,
        }),
      }).catch(console.error);
    } catch (err) {
      console.error('[Generation] Error:', err);
      dispatch({
        type: 'REPORT_ERROR',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [state.clientName, state.clientEmail, state.answers]);

  useEffect(() => {
    if (state.mode === 'generating' && !state.error && !state.report) {
      runGeneration();
    }
  }, [state.mode, runGeneration, state.error, state.report]);

  const handleComplete = () => {
    dispatch({ type: 'GENERATE' });
  };

  const handleRetry = () => {
    dispatch({ type: 'REPORT_ERROR', error: null });
    runGeneration();
  };

  const handleResume = () => {
    if (!resumePrompt) return;
    dispatch({ type: 'HYDRATE', payload: resumePrompt });
    setResumePrompt(null);
  };

  const handleDiscard = () => {
    setResumePrompt(null);
  };

  const handleRestart = () => {
    dispatch({ type: 'RESTART' });
  };

  return (
    <div className="fa-root">
      {resumePrompt && (
        <ResumePrompt
          saved={resumePrompt}
          onResume={handleResume}
          onDiscard={handleDiscard}
        />
      )}

      {!resumePrompt && state.mode === 'welcome' && (
        <Welcome
          clientName={state.clientName}
          clientEmail={state.clientEmail}
          onName={(v: string) => dispatch({ type: 'SET_NAME', value: v })}
          onEmail={(v: string) => dispatch({ type: 'SET_EMAIL', value: v })}
          onBegin={() => dispatch({ type: 'BEGIN' })}
        />
      )}

      {!resumePrompt && state.mode === 'assessment' && (
        <Assessment
          state={state}
          dispatch={dispatch}
          onComplete={handleComplete}
        />
      )}

      {!resumePrompt && state.mode === 'generating' && (
        <Generating error={state.error} onRetry={handleRetry} />
      )}

      {!resumePrompt && state.mode === 'report' && state.report && (
        <Report
          clientName={state.clientName}
          report={state.report}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}


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
          <Paragraphs text={report.pillar_time} />
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
