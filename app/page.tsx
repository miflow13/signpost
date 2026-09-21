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
  {
    title: 'Keyboard on Wayland',
    text: 'How do I disable my laptop keyboard without disabling my USB keyboard?',
  },
  {
    title: 'X11 advice on Wayland',
    text: 'Why does an X11 xinput fix not work on my Wayland session?',
  },
  {
    title: 'NVIDIA troubleshooting',
    text: 'Steam is flickering on NVIDIA. Which fixes actually apply to this setup?',
  },
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
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<RunMeta | null>(null);

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
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-logo">↗</div>
          <div>
            <strong>Signpost</strong>
            <span>Linux troubleshooting</span>
          </div>
        </div>

        <button className="new-chat" type="button" onClick={newChat}>
          <span>＋</span> New chat
        </button>

        <section className="profile-panel">
          <div className="panel-heading">
            <span>Your setup</span>
            <small>Used to check whether advice applies</small>
          </div>

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
          <label>
            <span>Hardware notes</span>
            <input
              placeholder="Optional"
              value={profile.hardware}
              onChange={(e) => update('hardware', e.target.value)}
            />
          </label>
        </section>

        <div className="sidebar-spacer"/>

        <section className="connection-card">
          <div className="connection-line">
            <span className="status-dot"/>
            <div>
              <strong>{loading ? 'Checking sources…' : 'Sources connected'}</strong>
              <small>Sanity Context Knowledge Base</small>
            </div>
          </div>

          {meta && (
            <div className="runtime-meta">
              {meta.provider && <span>{meta.provider}</span>}
              {meta.model && <span>{meta.model}</span>}
              <span>{(meta.totalMs / 1000).toFixed(1)}s</span>
              <span>{meta.toolCalls} tool {meta.toolCalls === 1 ? 'call' : 'calls'}</span>
            </div>
          )}
        </section>
      </aside>

      <section className="chat-shell">
        <header className="chat-header">
          <div>
            <strong>Signpost</strong>
            <span>Checks Linux advice against your actual setup</span>
          </div>

          <div className="context-pills" aria-label="Current system context">
            {[profile.distro && `${profile.distro} ${profile.version}`.trim(), profile.desktop, profile.session]
              .filter(Boolean)
              .map((item) => <span key={item}>{item}</span>)}
          </div>
        </header>

        <div className={`conversation ${hasConversation ? 'active' : 'empty'}`}>
          {!hasConversation && (
            <div className="welcome">
              <div className="assistant-orb">↗</div>
              <h1>What can I help you troubleshoot?</h1>
              <p>
                Ask a Linux question in plain English. Signpost checks the answer against
                <strong> your setup</strong> before pointing you in a direction.
              </p>

              <div className="suggestion-grid">
                {examples.map((example) => (
                  <button type="button" key={example.title} onClick={() => useExample(example.text)}>
                    <strong>{example.title}</strong>
                    <span>{example.text}</span>
                    <em>↗</em>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasConversation && (
            <div className="thread">
              {submittedQuestion && (
                <div className="message user-message">
                  <div className="message-avatar user-avatar">You</div>
                  <div className="message-content">
                    <div className="message-name">You</div>
                    <p>{submittedQuestion}</p>
                  </div>
                </div>
              )}

              {(loading || error || answer) && (
                <div className="message assistant-message">
                  <div className="message-avatar assistant-avatar">↗</div>
                  <div className="message-content">
                    <div className="message-name">
                      Signpost
                      <span className="grounded-badge"><i/> Source-grounded</span>
                    </div>

                    {loading && (
                      <div className="thinking">
                        <div className="thinking-dots"><i/><i/><i/></div>
                        <span>Checking documentation against {profileSummary}…</span>
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
                          <section className="answer-block right-direction">
                            <div className="answer-label"><span>✓</span> Right direction</div>
                            {rightDirection && <SectionCopy markdown={rightDirection.body}/>}
                            {whyItFits && (
                              <div className="why-it-fits">
                                <div className="sub-label">Why it fits your setup</div>
                                <SectionCopy markdown={whyItFits.body}/>
                              </div>
                            )}
                          </section>
                        )}

                        {wrongTurns && (
                          <section className="answer-block wrong-turns">
                            <div className="answer-label"><span>!</span> Things to avoid</div>
                            <SectionCopy markdown={wrongTurns.body}/>
                          </section>
                        )}

                        {(confidence || sources) && (
                          <div className="evidence-grid">
                            {confidence && (
                              <section>
                                <div className="sub-label">Confidence</div>
                                <SectionCopy markdown={confidence.body}/>
                              </section>
                            )}
                            {sources && (
                              <section>
                                <div className="sub-label">Sources</div>
                                <SectionCopy markdown={sources.body}/>
                              </section>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {answer && !hasStructuredAnswer && (
                      <div className="answer fallback-answer"><ReactMarkdown>{answer}</ReactMarkdown></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={submit}>
            <textarea
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask Signpost about a Linux problem…"
              aria-label="Ask Signpost"
            />
            <button type="submit" className="send-button" disabled={loading || !question.trim()} aria-label="Send">
              ↑
            </button>
          </form>
          <div className="composer-foot">
            <span>Enter to send · Shift+Enter for a new line</span>
            <span>{profileSummary}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
