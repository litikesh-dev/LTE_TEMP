import { useEffect, useState } from 'react';
import { GraduationCap, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/shared/api/supabaseClient';
import { setSession } from '@/shared/api/session';
import './login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-login when arriving from SkillPassport with ?email=<address>
  // (career-track handoff). Looks up the account like the form does and
  // lands on the dashboard without showing the login screen.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const handoffEmail = params.get('email')?.trim().toLowerCase();
    if (!handoffEmail) return;
    setLoading(true);
    supabase
      .from('accounts')
      .select('slug, name, email')
      .eq('email', handoffEmail)
      .limit(1)
      .maybeSingle()
      .then(({ data, error: dbError }) => {
        setLoading(false);
        if (dbError || !data) {
          setError('No account found for that email.');
          setEmail(handoffEmail);
          return;
        }
        setSession(data.slug as string, handoffEmail, (data.name as string) ?? '');
        // Drop the query param so a reload doesn't re-trigger auto-login.
        window.location.replace('/');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim().toLowerCase();
    if (!value) {
      setError('Please enter your email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    const { data, error: dbError } = await supabase
      .from('accounts')
      .select('slug, name, email')
      .eq('email', value)
      .limit(1)
      .maybeSingle();
    setLoading(false);

    if (dbError) {
      setError('Something went wrong. Please try again.');
      return;
    }
    if (!data) {
      setError('No account found for that email.');
      return;
    }
    // No real password check — demo login only.
    setSession(data.slug as string, value, (data.name as string) ?? '');
    // Reload so the data bootstrap picks up the chosen account.
    window.location.assign('/');
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo"><GraduationCap size={26} /></div>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to continue your learning journey</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-label">Email</span>
            <div className="login-input-wrap">
              <Mail size={16} className="login-input-icon" />
              <input
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
            </div>
          </label>

          <label className="login-field">
            <span className="login-label">Password</span>
            <div className="login-input-wrap">
              <input
                type="password"
                className="login-input login-input--nopad"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <Loader2 size={16} className="login-spin" /> : <>Sign in <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
