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
          <span>mika@linux: ~/signpost</span>
          <span>— □ ×</span>
        </header>

        <div className="terminal-body">
          <div className="line">
            <span className="prompt">mika@linux</span><span className="cwd"> ~/signpost</span><span className="shell"> $ </span>
            <span>./signpost</span>
          </div>
          <div className="stdout">Signpost 0.1.0 — context-aware Linux troubleshooting</div>
          <div className="stdout dim">Linux troubleshooting that checks its work against your setup.</div>
          <div className="blank"/>

          <form onSubmit={submit}>
            <div className="line">
              <span className="prompt">mika@linux</span><span className="cwd"> ~/signpost</span><span className="shell"> $ </span>
              <span>signpost profile --edit</span>
            </div>

            <div className="config-block" aria-label="System profile">
              <label className="config-line">
                <span className="config-key">distro</span><span className="equals">=</span>
                <input aria-label="Distribution" value={profile.distro} onChange={(e) => update('distro', e.target.value)} />
              </label>
              <label className="config-line">
                <span className="config-key">version</span><span className="equals">=</span>
                <input aria-label="Version" value={profile.version} onChange={(e) => update('version', e.target.value)} />
              </label>
              <label className="config-line">
                <span className="config-key">desktop</span><span className="equals">=</span>
                <input aria-label="Desktop or compositor" value={profile.desktop} onChange={(e) => update('desktop', e.target.value)} />
              </label>
              <label className="config-line">
                <span className="config-key">session</span><span className="equals">=</span>
                <input aria-label="Session" value={profile.session} onChange={(e) => update('session', e.target.value)} />
              </label>
              <label className="config-line">
                <span className="config-key">hardware</span><span className="equals">=</span>
                <input
                  aria-label="Hardware notes"
                  placeholder="optional"
                  value={profile.hardware}
                  onChange={(e) => update('hardware', e.target.value)}
                />
              </label>
            </div>

            <div className="stdout dim">profile loaded: {profileSummary || 'incomplete'}{profile.hardware ? ` / ${profile.hardware}` : ''}</div>
            <div className="blank"/>

            <div className="line">
              <span className="prompt">mika@linux</span><span className="cwd"> ~/signpost</span><span className="shell"> $ </span>
              <span>signpost ask</span>
            </div>
            <div className="question-line">
              <span className="continuation">&gt; </span>
              <textarea
                className="question"
                rows={4}
                aria-label="Troubleshooting question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="stdout dim example-line">
              <span># examples </span>
              {examples.map((item, i) => (
                <button type="button" key={item} onClick={() => setQuestion(item)}>[{i + 1}]</button>
              ))}
            </div>

            <div className="line run-line">
              <span className="prompt">mika@linux</span><span className="cwd"> ~/signpost</span><span className="shell"> $ </span>
              <button className="run-command" disabled={loading}>
                {loading ? 'signpost run --checking-context' : 'signpost run'}
              </button>
            </div>
          </form>

          {(loading || error || answer) && (
            <div className="output">
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

              {meta && (
                <div className="stdout dim">
                  [done] {meta.steps} steps · {meta.toolCalls} tool calls · {(meta.totalMs / 1000).toFixed(1)}s total · {(meta.contextMs / 1000).toFixed(1)}s context · {(meta.modelMs / 1000).toFixed(1)}s model
                </div>
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
                      <div className="stdout warn">[skip] wrong_turns</div>
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
                    <span className="prompt">mika@linux</span><span className="cwd"> ~/signpost</span><span className="shell"> $ </span>
                    <span className="cursor" aria-hidden="true"/>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
