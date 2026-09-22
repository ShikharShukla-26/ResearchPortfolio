'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type SetupStatus = {
  ready: boolean;
  hasDatabase: boolean;
  hasAdmin: boolean;
  missing: string[];
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState<SetupStatus | null>(null);

  useEffect(() => {
    void fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data: SetupStatus) => setSetup(data))
      .catch(() => {});
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string; missing?: string[] };
      setError(data.error ?? data.missing?.join(' ') ?? 'Login failed');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <div className="admin-shell admin-login">
      <h1>Portfolio admin</h1>
      <p className="admin-hint">
        Sign in to update bios, research, writing, links, and logs after deploy.
      </p>

      {setup && !setup.ready ? (
        <div className="admin-card admin-grid" style={{ marginBottom: '1rem' }}>
          <p className="admin-error" style={{ margin: 0 }}>
            Server setup incomplete:
          </p>
          <ul className="admin-hint" style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {setup.missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {!setup.hasDatabase ? (
            <p className="admin-hint" style={{ margin: 0 }}>
              In Vercel: open this project → <strong>Storage</strong> →{' '}
              <strong>Create database</strong> → <strong>Neon</strong> → connect
              to <strong>shikhar-shukla-research</strong> (Production + Preview). Then{' '}
              <strong>Redeploy</strong> the latest deployment.
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="admin-grid">
        <div className="admin-field">
          <label htmlFor="password">Admin password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="admin-error">{error}</p> : null}
        <button type="submit" disabled={loading || setup?.ready === false}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="admin-hint">
        Use the <code>ADMIN_PASSWORD</code> value from Vercel → Settings →
        Environment Variables. First successful login imports your portfolio into
        Postgres.
      </p>
    </div>
  );
}
