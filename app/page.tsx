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
      <nav>
        <div className="brand"><span>↗</span> Signpost</div>
        <div className="nav-note">Linux help, with context.</div>
      </nav>

      <section className="hero">
        <div className="eyebrow">CONTEXT BEFORE COMMANDS</div>
        <h1>Linux advice that knows<br/><span>which machine it’s talking to.</span></h1>
        <p>
          Tell Signpost what you’re running. It checks the documentation against your actual
          distro, desktop, session, and hardware before pointing you toward a fix.
        </p>
      </section>

      <section className="workspace">
        <aside className="profile-card">
          <div className="card-heading">
            <span>01</span>
            <div><b>Your system</b><small>Context changes the answer.</small></div>
          </div>

          <label>Distribution<input value={profile.distro} onChange={(e) => update('distro', e.target.value)} /></label>
          <label>Version<input value={profile.version} onChange={(e) => update('version', e.target.value)} /></label>
          <label>Desktop / compositor<input value={profile.desktop} onChange={(e) => update('desktop', e.target.value)} /></label>
          <label>Session<input value={profile.session} onChange={(e) => update('session', e.target.value)} /></label>
          <label>Hardware / notes<textarea rows={3} placeholder="RTX 3070 Ti, laptop model, etc." value={profile.hardware} onChange={(e) => update('hardware', e.target.value)} /></label>
          <div className="profile-chip"><span>System</span>{profileSummary || 'Incomplete profile'}</div>
        </aside>

        <section className="ask-card">
          <div className="card-heading">
            <span>02</span>
            <div><b>What’s broken?</b><small>Ask like you would in a forum post.</small></div>
          </div>

          <form onSubmit={submit}>
            <textarea className="question" rows={6} value={question} onChange={(e) => setQuestion(e.target.value)} />
            <div className="examples">
              {examples.map((item, i) => <button type="button" key={item} onClick={() => setQuestion(item)}>0{i + 1}</button>)}
            </div>
            <button className="submit" disabled={loading}>{loading ? 'Reading the trail…' : 'Find the right direction →'}</button>
          </form>
        </section>
      </section>

      <section className={`answer-card ${answer || error || loading ? 'visible' : ''}`}>
        <div className="answer-top">
          <div><span className="status-dot"/> Source-grounded answer</div>
          <code>{profileSummary}</code>
        </div>
        {loading && <div className="loading-lines"><i/><i/><i/><i/></div>}
        {error && <div className="error"><b>Connection isn’t ready yet.</b><p>{error}</p><small>Wire up the Sanity Context endpoint and API key in .env.local.</small></div>}
        {meta && (
          <div className="perf">
            <span>{(meta.totalMs / 1000).toFixed(1)}s total</span>
            <span>{(meta.contextMs / 1000).toFixed(1)}s context</span>
            <span>{(meta.modelMs / 1000).toFixed(1)}s model</span>
            <span>{meta.steps} steps</span>
            <span>{meta.toolCalls} tool calls</span>
          </div>
        )}
        {answer && <article><ReactMarkdown>{answer}</ReactMarkdown></article>}
      </section>

      <section className="thesis">
        <span>WHY SIGNPOST EXISTS</span>
        <p>A Linux command can be technically correct and still be wrong for your machine.</p>
        <p className="muted">Context is part of correctness.</p>
      </section>

      <footer>Built for the DEV × Sanity Challenge · Path One</footer>
    </main>
  );
}
