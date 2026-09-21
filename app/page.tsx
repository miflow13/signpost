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

  const profileChips = useMemo(
    () => [
      [profile.distro, profile.version].filter(Boolean).join(' '),
      profile.desktop,
      profile.session,
    ].filter(Boolean),
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
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <div className="window-controls" aria-hidden="true">
            <span/>
            <span/>
            <span/>
          </div>
          <div className="terminal-title">signpost — context-check</div>
          <div className="terminal-path">~/signpost</div>
        </div>

        <nav>
          <div className="brand"><span>↗</span> signpost</div>
          <div className="nav-note">context-aware linux troubleshooting</div>
        </nav>

        <section className="hero">
          <div className="terminal-command"><span className="prompt">user@linux:~$</span> ./signpost --check-setup</div>
          <h1>Linux troubleshooting that checks its work <span>against your setup.</span></h1>
          <p>
            Tell Signpost what you’re running. It checks the documentation against your actual
            distro, desktop, session, and hardware before pointing you toward a fix.
          </p>
          <div className="cursor-line"><span className="prompt">signpost&gt;</span><span className="cursor" aria-hidden="true"/></div>
        </section>

        <section className="workspace">
        <aside className="profile-card">
          <div className="card-heading">
            <span>$</span>
            <div><b>system.profile</b><small>Context changes the answer.</small></div>
          </div>

          <div className="system-chips" aria-label="Current system profile">
            {profileChips.map((chip) => <span key={chip}>{chip}</span>)}
          </div>

          <label>Distribution<input value={profile.distro} onChange={(e) => update('distro', e.target.value)} /></label>
          <label>Version<input value={profile.version} onChange={(e) => update('version', e.target.value)} /></label>
          <label>Desktop / compositor<input value={profile.desktop} onChange={(e) => update('desktop', e.target.value)} /></label>
          <label>Session<input value={profile.session} onChange={(e) => update('session', e.target.value)} /></label>
          <label>Hardware / notes<textarea rows={3} placeholder="RTX 3070 Ti, laptop model, etc." value={profile.hardware} onChange={(e) => update('hardware', e.target.value)} /></label>
        </aside>

        <section className="ask-card">
          <div className="card-heading">
            <span>&gt;_</span>
            <div><b>troubleshoot.query</b><small>Ask like you would in a forum post.</small></div>
          </div>

          <form onSubmit={submit}>
            <textarea className="question" rows={6} value={question} onChange={(e) => setQuestion(e.target.value)} />
            <div className="examples">
              <span>Try</span>
              {examples.map((item, i) => <button type="button" key={item} onClick={() => setQuestion(item)}>0{i + 1}</button>)}
            </div>
            <button className="submit" disabled={loading}>{loading ? 'resolving context…' : 'run context check ↵'}</button>
          </form>
        </section>
      </section>

      <section className={`answer-card ${answer || error || loading ? 'visible' : ''}`}>
        <div className="answer-top">
          <div><span className="status-dot"/> signpost.output</div>
          <div className="answer-profile">{profileChips.map((chip) => <span key={chip}>{chip}</span>)}</div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-caption"><span className="prompt">signpost&gt;</span> reading documentation and checking applicability…</div>
            <div className="loading-lines"><i/><i/><i/><i/></div>
          </div>
        )}

        {error && <div className="error"><b>Connection isn’t ready yet.</b><p>{error}</p><small>Check the Sanity Context endpoint and model API key in .env.local.</small></div>}

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
                <div className="section-label direction-label"><span>✓</span> RIGHT_DIRECTION</div>
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
                <div className="section-label wrong-label"><span>!</span> WRONG_TURNS</div>
                <div className="section-copy"><SectionCopy markdown={wrongTurns.body}/></div>
              </section>
            )}

            {(confidence || sources) && (
              <footer className="answer-footer">
                {confidence && (
                  <section className="meta-section confidence-section">
                    <div className="meta-label">CONFIDENCE</div>
                    <SectionCopy markdown={confidence.body}/>
                  </section>
                )}
                {sources && (
                  <section className="meta-section sources-section">
                    <div className="meta-label">SOURCES</div>
                    <SectionCopy markdown={sources.body}/>
                  </section>
                )}
              </footer>
            )}
          </div>
        )}

        {answer && !hasStructuredAnswer && (
          <article className="fallback-answer"><ReactMarkdown>{answer}</ReactMarkdown></article>
        )}
      </section>

        <section className="thesis">
          <span className="prompt"># why-signpost</span>
          <p>A Linux command can be technically correct and still be wrong for your machine.</p>
          <p className="muted">Context is part of correctness.</p>
        </section>

        <footer className="site-footer">
          <span>signpost v0.1</span>
          <span>DEV × Sanity Challenge · Path One</span>
        </footer>
      </div>
    </main>
  );
}
