'use client';

import { useState } from 'react';
import { MarkdownBody } from './cms/markdown-body';

type BioMode = 'default' | 'long';

export function BioSection({
  defaultBioMd,
  longBioMd
}: {
  defaultBioMd: string;
  longBioMd: string;
}) {
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
        {mode === 'default' ? (
          <MarkdownBody source={defaultBioMd} />
        ) : (
          <div className="long-bio">
            <MarkdownBody source={longBioMd} />
          </div>
        )}
      </div>
    </section>
  );
}
