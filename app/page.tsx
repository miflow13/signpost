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
  const [meta, setMeta] = useState<{contextMs:number; modelMs:number; totalMs:number; steps:number; toolCalls:number} | null>(null);

  const profileSummary = useMemo(
    () => [profile.distro, profile.version, profile.desktop, profile.session].filter(Boolean).join(' · '),
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
      <section className="terminal" aria-label="Signpost terminal">
        <header className="terminal-titlebar">
          <div className="window-controls" aria-hidden="true"><span/><span/><span/></div>
          <span>signpost</span>
          <span>~/signpost</span>
        </header>

        <div className="terminal-body">
          <div className="boot">
            <div><span className="prompt">mika@linux:~$</span> signpost --context-check</div>
            <div className="headline">Linux troubleshooting that checks its work against your setup.</div>
            <div className="muted">Sanity-grounded guidance for the distro, desktop, session, and hardware you actually use.</div>
          </div>

          <form onSubmit={submit}>
            <div className="command-line">
              <span className="prompt">signpost@system:~$</span>
              <span>profile --edit</span>
            </div>

            <div className="profile-grid">
              <label>
                <span>distro</span>
                <input value={profile.distro} onChange={(e) => update('distro', e.target.value)} />
              </label>
              <label>
                <span>version</span>
                <input value={profile.version} onChange={(e) => update('version', e.target.value)} />
              </label>
              <label>
                <span>desktop</span>
                <input value={profile.desktop} onChange={(e) => update('desktop', e.target.value)} />
              </label>
              <label>
                <span>session</span>
                <input value={profile.session} onChange={(e) => update('session', e.target.value)} />
              </label>
              <label className="hardware-field">
                <span>hardware</span>
                <input
                  placeholder="RTX 3070 Ti, laptop model, etc."
                  value={profile.hardware}
                  onChange={(e) => update('hardware', e.target.value)}
                />
              </label>
            </div>

            <div className="context-line">
              <span className="dim">context:</span> {profileSummary || 'incomplete'}
              {profile.hardware ? <span className="dim"> · {profile.hardware}</span> : null}
            </div>

            <div className="command-line question-command">
              <span className="prompt">signpost@system:~$</span>
              <span>ask</span>
            </div>

            <textarea
              className="question"
              rows={5}
              aria-label="Troubleshooting question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div className="example-line">
              <span className="dim">examples:</span>
              {examples.map((item, i) => (
                <button type="button" key={item} onClick={() => setQuestion(item)}>[{i + 1}]</button>
              ))}
            </div>

            <button className="run-command" disabled={loading}>
              <span className="prompt">$</span> {loading ? 'checking context…' : 'run'}
            </button>
          </form>

          {(loading || error || answer) && (
            <div className="output">
              <div className="output-rule">── signpost output ─────────────────────────────────────────────</div>

              {loading && (
                <div className="loading-line">
                  <span className="prompt">signpost&gt;</span> reading sources and checking applicability
                  <span className="dots">...</span>
                </div>
              )}

              {error && (
                <div className="error">
                  <div><span className="error-mark">!</span> request failed</div>
                  <p>{error}</p>
                  <small>Check your Sanity Context connection and selected model provider.</small>
                </div>
              )}

              {meta && (
                <div className="perf">
                  <span>{(meta.totalMs / 1000).toFixed(1)}s total</span>
                  <span>{(meta.contextMs / 1000).toFixed(1)}s context</span>
                  <span>{(meta.modelMs / 1000).toFixed(1)}s model</span>
                  <span>{meta.steps} steps</span>
                  <span>{meta.toolCalls} tool calls</span>
                </div>
              )}

              {answer && hasStructuredAnswer && (
                <div className="answer-document">
                  {(rightDirection || whyItFits) && (
                    <section className="answer-section direction-section">
                      <div className="section-label direction-label">✓ RIGHT_DIRECTION</div>
                      {rightDirection && <div className="section-copy"><SectionCopy markdown={rightDirection.body}/></div>}
                      {whyItFits && (
                        <div className="why-panel">
                          <div className="subsection-label">WHY_IT_FITS</div>
                          <SectionCopy markdown={whyItFits.body}/>
                        </div>
                      )}
                    </section>
                  )}

                  {wrongTurns && (
                    <section className="answer-section wrong-section">
                      <div className="section-label wrong-label">! WRONG_TURNS</div>
                      <div className="section-copy"><SectionCopy markdown={wrongTurns.body}/></div>
                    </section>
                  )}

                  {(confidence || sources) && (
                    <div className="answer-footer">
                      {confidence && (
                        <section className="meta-section">
                          <div className="meta-label">CONFIDENCE</div>
                          <SectionCopy markdown={confidence.body}/>
                        </section>
                      )}
                      {sources && (
                        <section className="meta-section">
                          <div className="meta-label">SOURCES</div>
                          <SectionCopy markdown={sources.body}/>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              )}

              {answer && !hasStructuredAnswer && (
                <article className="fallback-answer"><ReactMarkdown>{answer}</ReactMarkdown></article>
              )}

              {!loading && !error && answer && (
                <div className="return-prompt"><span className="prompt">mika@linux:~$</span><span className="cursor" aria-hidden="true"/></div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
