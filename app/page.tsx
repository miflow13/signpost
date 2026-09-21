'use client';

import {FormEvent, KeyboardEvent, useMemo, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import type {SystemProfile} from '@/lib/types';

const defaults: SystemProfile = {
  distro: 'Fedora',
  version: '44',
  desktop: 'GNOME',
  session: 'Wayland',
  hardware: '',
};

const examples = [
  'Disable my laptop keyboard but keep my USB keyboard working',
  'Why does xinput advice fail on Wayland?',
  'Steam flickers on NVIDIA — what actually applies to my setup?',
];

type AnswerSection = { title: string; body: string };

type RunMeta = {
  contextMs: number;
  modelMs: number;
  totalMs: number;
  steps: number;
  toolCalls: number;
  provider?: string;
  model?: string;
};

function splitAnswer(markdown: string): AnswerSection[] {
  if (!markdown.trim()) return [];

  const sections: AnswerSection[] = [];
  let title = '';
  let lines: string[] = [];

  const flush = () => {
    const body = lines.join('\n').trim();
    if (title || body) sections.push({title: title || 'Answer', body});
    lines = [];
  };

  for (const line of markdown.split('\n')) {
    const match = line.match(/^##\s+(.+)\s*$/);
    if (match) {
      flush();
      title = match[1].trim();
    } else {
      lines.push(line);
    }
  }

  flush();
  return sections;
}

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function SectionCopy({markdown}: {markdown: string}) {
  return <ReactMarkdown>{markdown}</ReactMarkdown>;
}

export default function Home() {
  const [profile, setProfile] = useState<SystemProfile>(defaults);
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<RunMeta | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);

  const profileSummary = useMemo(
    () => [profile.distro, profile.version, profile.desktop, profile.session]
      .filter(Boolean)
      .join(' · '),
    [profile],
  );

  const answerSections = useMemo(() => splitAnswer(answer), [answer]);

  const section = (name: string) =>
    answerSections.find((item) => normalized(item.title) === normalized(name));

  const rightDirection = section('Right direction');
  const whyItFits = section('Why it fits');
  const wrongTurns = section('Wrong turns');
  const confidence = section('Confidence');
  const sources = section('Sources');
  const hasStructuredAnswer = Boolean(rightDirection || whyItFits || wrongTurns || confidence || sources);
  const hasConversation = Boolean(submittedQuestion || answer || loading || error);

  function update<K extends keyof SystemProfile>(key: K, value: SystemProfile[K]) {
    setProfile((current) => ({...current, [key]: value}));
  }

  function newChat() {
    setQuestion('');
    setSubmittedQuestion('');
    setAnswer('');
    setError('');
    setMeta(null);
  }

  function useExample(text: string) {
    setQuestion(text);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setSubmittedQuestion(trimmed);
    setLoading(true);
    setError('');
    setAnswer('');
    setMeta(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question: trimmed, profile}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setAnswer(data.answer);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <button className="brand" type="button" onClick={newChat} aria-label="New Signpost chat">
          <span className="brand-mark">↗</span>
          <span>Signpost</span>
        </button>

        <div className="top-actions">
          <button className="ghost-button" type="button" onClick={newChat}>New chat</button>
          <button className="setup-button" type="button" onClick={() => setSetupOpen((open) => !open)}>
            <span className="status-dot"/>
            {profileSummary}
            <span className="chevron">⌄</span>
          </button>
        </div>

        {setupOpen && (
          <div className="setup-popover">
            <div className="setup-heading">
              <div>
                <strong>Your setup</strong>
                <span>Signpost uses this to decide which fixes actually apply.</span>
              </div>
              <button type="button" onClick={() => setSetupOpen(false)}>×</button>
            </div>

            <div className="setup-grid">
              <label>
                <span>Linux type</span>
                <input value={profile.distro} onChange={(e) => update('distro', e.target.value)} />
              </label>
              <label>
                <span>Version</span>
                <input value={profile.version} onChange={(e) => update('version', e.target.value)} />
              </label>
              <label>
                <span>Desktop</span>
                <input value={profile.desktop} onChange={(e) => update('desktop', e.target.value)} />
              </label>
              <label>
                <span>Display mode</span>
                <input value={profile.session} onChange={(e) => update('session', e.target.value)} />
              </label>
              <label className="wide-field">
                <span>Hardware notes</span>
                <input
                  placeholder="Optional"
                  value={profile.hardware}
                  onChange={(e) => update('hardware', e.target.value)}
                />
              </label>
            </div>
          </div>
        )}
      </header>

      <section className={`conversation ${hasConversation ? 'has-thread' : 'empty'}`}>
        {!hasConversation && (
          <div className="welcome">
            <div className="assistant-orb">↗</div>
            <h1>What are you trying to fix?</h1>
            <p>Linux troubleshooting that checks whether the advice actually fits your setup.</p>
          </div>
        )}

        {hasConversation && (
          <div className="thread">
            {submittedQuestion && (
              <div className="user-row">
                <div className="user-bubble">{submittedQuestion}</div>
              </div>
            )}

            <div className="assistant-row">
              <div className="assistant-avatar">↗</div>

              <div className="assistant-card">
                <div className="assistant-card-head">
                  <div>
                    <strong>Signpost</strong>
                    <span><i/> Source-grounded</span>
                  </div>

                  <button className="mini-setup" type="button" onClick={() => setSetupOpen(true)}>
                    {profileSummary}
                  </button>
                </div>

                {loading && (
                  <div className="thinking">
                    <div className="thinking-dots"><i/><i/><i/></div>
                    <span>Checking documentation against your setup…</span>
                  </div>
                )}

                {error && (
                  <div className="error-card">
                    <strong>I couldn’t finish that check.</strong>
                    <p>{error}</p>
                  </div>
                )}

                {answer && hasStructuredAnswer && (
                  <div className="answer">
                    {(rightDirection || whyItFits) && (
                      <section className="answer-section">
                        <div className="answer-label right-label">✓ Right direction</div>
                        {rightDirection && <SectionCopy markdown={rightDirection.body}/>}
                        {whyItFits && (
                          <div className="nested-section">
                            <div className="sub-label">Why it fits your setup</div>
                            <SectionCopy markdown={whyItFits.body}/>
                          </div>
                        )}
                      </section>
                    )}

                    {wrongTurns && (
                      <section className="answer-section">
                        <div className="answer-label wrong-label">Things to avoid</div>
                        <SectionCopy markdown={wrongTurns.body}/>
                      </section>
                    )}

                    {confidence && (
                      <section className="answer-section compact-section">
                        <div className="sub-label">Confidence</div>
                        <SectionCopy markdown={confidence.body}/>
                      </section>
                    )}

                    {sources && (
                      <section className="answer-section compact-section">
                        <div className="sub-label">Sources</div>
                        <SectionCopy markdown={sources.body}/>
                      </section>
                    )}
                  </div>
                )}

                {answer && !hasStructuredAnswer && (
                  <div className="answer fallback-answer"><ReactMarkdown>{answer}</ReactMarkdown></div>
                )}

                {meta && (
                  <details className="details">
                    <summary>Details</summary>
                    <div>
                      {meta.provider && <span>{meta.provider}</span>}
                      {meta.model && <span>{meta.model}</span>}
                      <span>{(meta.totalMs / 1000).toFixed(1)}s</span>
                      <span>{meta.toolCalls} tool {meta.toolCalls === 1 ? 'call' : 'calls'}</span>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="composer-zone">
        <form className="composer" onSubmit={submit}>
          <textarea
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Describe your Linux problem…"
            aria-label="Ask Signpost"
          />

          <div className="composer-actions">
            <button className="context-button" type="button" onClick={() => setSetupOpen(true)}>
              <span className="status-dot"/>
              {profileSummary}
            </button>

            <button className="send-button" type="submit" disabled={loading || !question.trim()} aria-label="Check this">
              ↑
            </button>
          </div>
        </form>

        {!hasConversation && (
          <div className="prompt-suggestions">
            {examples.map((example) => (
              <button type="button" key={example} onClick={() => useExample(example)}>
                {example}
              </button>
            ))}
          </div>
        )}

        <div className="composer-note">
          Signpost checks whether a fix actually applies to your setup.
        </div>
      </div>
    </main>
  );
}
