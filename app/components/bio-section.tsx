'use client';

import { useState } from 'react';
import { site } from '../site-data';

type BioMode = 'default' | 'long';

function DefaultBio() {
  return (
    <>
      <p className="content-paragraph">
        I&apos;m an independent behavioral and UX researcher with a software
        engineering background. Over the last year I ran six months of embedded
        workplace ethnography inside a software team, plus five self-initiated
        studies spanning behavioral research and heuristic audits of live
        products — <a href="/work/zipcar">Zipcar</a>,{' '}
        <a href="/work/wise">Wise</a> and{' '}
        <a href="/work/decathlon">Decathlon</a>.
      </p>
      <p className="content-paragraph">
        The thing I&apos;m good at is spotting the gap between what people say
        they intend and what they actually do — then turning that gap into
        prioritized, testable interventions a product team can act on. I
        write about attention, persuasive design and self-observation on{' '}
        <a href={site.substack} target="_blank" rel="noopener noreferrer">
          Substack
        </a>
        , and I&apos;m looking for my first full-time UX research role.
      </p>
    </>
  );
}

function LongBio() {
  return (
    <div className="long-bio">
      <p className="content-paragraph">
        I studied mechatronics at ITM Vocational University in Vadodara — a
        diploma first, then a B.Tech. Robots and control systems taught me to
        think in loops: a signal goes out, something changes, a signal comes
        back. I didn&apos;t know then that I&apos;d spend most of my twenties
        watching that same loop play out between people and the products, and
        managers, that shape them.
      </p>
      <p className="content-paragraph">
        After a few short stints in finance and customer service, I taught
        myself JavaScript and joined DevLoops Technologies in 2025 — first as an
        intern building a trilingual CMS and data migration for a Netherlands
        client, then as the sole full-stack developer on production platforms
        for clients in the UK, Canada and the US, and a live healthcare system
        used by real clinics. Designing five- and six-role access systems meant
        I had to understand how information and permission actually flow
        through an organization, not how the org chart says they do.
      </p>
      <p className="content-paragraph">
        Somewhere in 2025 I started studying myself. I&apos;d lose an hour to
        YouTube Shorts while fully aware of what was happening, so I began
        documenting my own behavior as it happened — the 1–2 second gap between
        Shorts, the skeleton loaders that redirect the eye, the way 2x speed
        made me a willing participant in my own capture. That became a series
        of first-person essays on persuasive design and what people are
        actually avoiding when they stay on a platform.
      </p>
      <p className="content-paragraph">
        Then the workplace itself became the study. Between January and August
        2026 I was an embedded insider in a seven-person software team while
        management responded to a missed deadline with a wave of control
        policies. I documented the whole arc — from the first split lunch
        table to my own termination — and built the Control–Trust–Output Loop
        to explain why the fix kept reproducing the problem. My exit is in the
        data, not left out of it.
      </p>
      <p className="content-paragraph">
        Alongside that I ran self-initiated audits of live products against
        Nielsen&apos;s heuristics and cognitive-walkthrough methods: Zipcar,
        Decathlon.in, Wise. Each one ends with the same discipline — what is
        confirmed, what is still a hypothesis, and the cheapest test that would
        tell the difference.
      </p>
      <p className="content-paragraph">
        I&apos;m now looking for my first UX or behavioral research role, on a
        team building products that shape behavior and wanting someone who can
        see the design decisions users don&apos;t. You can{' '}
        <a href={`mailto:${site.email}`}>email me</a>, find me on{' '}
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        , or read the <a href={site.resume}>resume</a>.
      </p>
    </div>
  );
}

export function BioSection() {
  const [mode, setMode] = useState<BioMode>('default');

  return (
    <section className="bio-section" aria-label="Biography">
      <div className="bio-toggle">
        <span>Bio</span>
        <div className="bio-toggle-options" aria-label="Bio length">
          <button
            type="button"
            aria-controls="bio-content"
            aria-pressed={mode === 'default'}
            onClick={() => setMode('default')}
          >
            Default
          </button>
          <button
            type="button"
            aria-controls="bio-content"
            aria-pressed={mode === 'long'}
            onClick={() => setMode('long')}
          >
            Long
          </button>
        </div>
      </div>
      <div id="bio-content">
        {mode === 'default' ? <DefaultBio /> : <LongBio />}
      </div>
    </section>
  );
}
