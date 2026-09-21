'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? 'Login failed');
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
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="admin-hint">
        Requires <code>POSTGRES_URL</code>, <code>ADMIN_PASSWORD</code>, and{' '}
        <code>SESSION_SECRET</code> on the server. First login runs database
        setup and imports your existing portfolio content.
      </p>
    </div>
  );
}
