'use client';

import {FormEvent, useMemo, useState} from 'react';
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
  'How do I disable my laptop keyboard without disabling my USB keyboard?',
  'Why does an X11 xinput fix not work on my Wayland session?',
  'Steam is flickering on NVIDIA. Which fixes actually apply to this setup?',
];

type AnswerSection = {
  title: string;
  body: string;
};

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
  const [question, setQuestion] = useState(examples[0]);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<RunMeta | null>(null);

  const profileSummary = useMemo(
    () => [profile.distro, profile.version, profile.desktop, profile.session].filter(Boolean).join(' / '),
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

  function update<K extends keyof SystemProfile>(key: K, value: SystemProfile[K]) {
    setProfile((current) => ({...current, [key]: value}));
  }

  function clearTerminal() {
    setQuestion('');
    setAnswer('');
    setError('');
    setMeta(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');
    setMeta(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question, profile}),
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

  return (
    <main>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-mark">&gt;_</span>
            <div>
              <strong>Signpost</strong>
              <small>checks Linux advice against your setup</small>
            </div>
          </div>

          <section className="side-section">
            <div className="side-heading">System profile</div>

            <label>
              <span>Distro</span>
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
              <span>Session</span>
              <input value={profile.session} onChange={(e) => update('session', e.target.value)} />
            </label>
            <label>
              <span>Hardware</span>
              <input
                placeholder="optional notes"
                value={profile.hardware}
                onChange={(e) => update('hardware', e.target.value)}
              />
            </label>

            <div className="profile-summary">
              <span className="status-led"/>
              <div>
                <small>Active context</small>
                <code>{profileSummary || 'incomplete'}</code>
              </div>
            </div>
          </section>

          <section className="side-section">
            <div className="side-heading">Quick tests</div>
            <div className="example-list">
              {examples.map((item, i) => (
                <button type="button" key={item} onClick={() => setQuestion(item)}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <em>{item}</em>
                </button>
              ))}
            </div>
          </section>

          <section className="side-section side-status">
            <div className="side-heading">Runtime</div>
            <div className="status-row"><span>Knowledge</span><strong>Sanity Context</strong></div>
            <div className="status-row"><span>Status</span><strong className={loading ? 'status-live' : 'status-ready'}>{loading ? 'Running' : 'Ready'}</strong></div>
            {meta?.provider && <div className="status-row"><span>Provider</span><strong>{meta.provider}</strong></div>}
            {meta?.model && <div className="status-row"><span>Model</span><strong>{meta.model}</strong></div>}
            {meta && (
              <>
                <div className="status-row"><span>Total</span><strong>{(meta.totalMs / 1000).toFixed(1)}s</strong></div>
                <div className="status-row"><span>Context</span><strong>{(meta.contextMs / 1000).toFixed(1)}s</strong></div>
                <div className="status-row"><span>Tool calls</span><strong>{meta.toolCalls}</strong></div>
              </>
            )}
          </section>

          <div className="sidebar-foot">Signpost v0.1 · DEV × Sanity</div>
        </aside>

        <section className="terminal-window" aria-label="Signpost terminal">
          <header className="mac-titlebar">
            <div className="traffic-lights" aria-hidden="true">
              <span className="traffic-red"/>
              <span className="traffic-yellow"/>
              <span className="traffic-green"/>
            </div>
            <div className="window-title">Signpost — zsh — 120×38</div>
            <div className="window-actions" aria-hidden="true">⌘</div>
          </header>

          <div className="terminal-toolbar">
            <div className="terminal-tab">
              <span className="terminal-icon">&gt;_</span>
              <span>Terminal</span>
            </div>

            <div className="toolbar-context">
              <span className="status-led"/>
              <span>{profileSummary}</span>
            </div>

            <div className="toolbar-actions">
              <button type="button" className="toolbar-button" onClick={clearTerminal}>Clear</button>
              <button
                type="submit"
                form="signpost-form"
                className="toolbar-button run-button"
                disabled={loading || !question.trim()}
              >
                {loading ? 'Running…' : '▶ Run'}
              </button>
            </div>
          </div>

          <form id="signpost-form" className="terminal-form" onSubmit={submit}>
            <div className="terminal-body">
              <div className="line">
                <span className="prompt-user">mika</span><span className="prompt-at">@</span><span className="prompt-host">linux</span>
                <span className="cwd"> ~/signpost</span><span className="shell"> % </span>
                <span>./signpost</span>
              </div>
              <div className="stdout banner">Signpost 0.1.0</div>
              <div className="stdout muted">Linux troubleshooting that checks its work against your setup.</div>
              <div className="blank"/>

              <div className="line">
                <span className="prompt-user">mika</span><span className="prompt-at">@</span><span className="prompt-host">linux</span>
                <span className="cwd"> ~/signpost</span><span className="shell"> % </span>
                <span>signpost ask</span>
              </div>

              <div className="question-line">
                <span className="continuation">&gt; </span>
                <textarea
                  className="question"
                  rows={4}
                  aria-label="Troubleshooting question"
                  placeholder="Describe the Linux problem you want Signpost to check…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="terminal-hint">
                <span>Enter your question, then click Run</span>
                <kbd>⌘↵</kbd>
              </div>

              {(loading || error || answer) && (
                <div className="output">
                  <div className="line">
                    <span className="prompt-user">mika</span><span className="prompt-at">@</span><span className="prompt-host">linux</span>
                    <span className="cwd"> ~/signpost</span><span className="shell"> % </span>
                    <span>signpost run</span>
                  </div>

                  {loading && (
                    <>
                      <div className="stdout"><span className="info">[info]</span> querying Sanity Context Knowledge Base...</div>
                      <div className="stdout"><span className="info">[info]</span> checking applicability against {profileSummary}<span className="dots">...</span></div>
                    </>
                  )}

                  {error && (
                    <>
                      <div className="stdout error"><span>[error]</span> request failed</div>
                      <div className="stdout error-detail">{error}</div>
                    </>
                  )}

                  {answer && hasStructuredAnswer && (
                    <div className="answer-document">
                      {(rightDirection || whyItFits) && (
                        <section className="answer-section">
                          <div className="stdout success">[ok] right_direction</div>
                          {rightDirection && <div className="section-copy"><SectionCopy markdown={rightDirection.body}/></div>}
                          {whyItFits && (
                            <div className="why-panel">
                              <div className="stdout success">[ok] why_it_fits</div>
                              <SectionCopy markdown={whyItFits.body}/>
                            </div>
                          )}
                        </section>
                      )}

                      {wrongTurns && (
                        <section className="answer-section">
                          <div className="stdout skip">[skip] wrong_turns</div>
                          <div className="section-copy"><SectionCopy markdown={wrongTurns.body}/></div>
                        </section>
                      )}

                      {confidence && (
                        <section className="answer-section meta-section">
                          <div className="stdout meta">[meta] confidence</div>
                          <SectionCopy markdown={confidence.body}/>
                        </section>
                      )}

                      {sources && (
                        <section className="answer-section meta-section">
                          <div className="stdout meta">[meta] sources</div>
                          <SectionCopy markdown={sources.body}/>
                        </section>
                      )}
                    </div>
                  )}

                  {answer && !hasStructuredAnswer && (
                    <article className="fallback-answer"><ReactMarkdown>{answer}</ReactMarkdown></article>
                  )}

                  {!loading && !error && answer && (
                    <>
                      <div className="blank"/>
                      <div className="line return-prompt">
                        <span className="prompt-user">mika</span><span className="prompt-at">@</span><span className="prompt-host">linux</span>
                        <span className="cwd"> ~/signpost</span><span className="shell"> % </span>
                        <span className="cursor" aria-hidden="true"/>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
