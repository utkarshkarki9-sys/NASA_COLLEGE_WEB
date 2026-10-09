import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, signup, requestPasswordRecovery, updateUser, acceptInvite } from '@netlify/identity';
import { ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../components/Auth';
import { Eyebrow, Notice } from '../components/UI';

export default function Login({ admin = false, registration = false }: { admin?: boolean; registration?: boolean }) {
  const { user, callback, inviteToken, error: callbackError, refresh, clearCallback } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(registration ? 'signup' : 'login');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const reset = callback === 'recovery' || callback === 'invite';
  const returnTo = location.state?.from?.startsWith('/admin') ? '/admin' : location.state?.from === '/register' || registration ? '/register' : '/dashboard';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');

    try {
      if (reset) {
        if (callback === 'invite' && inviteToken) {
          await acceptInvite(inviteToken, password);
        } else {
          await updateUser({ password });
        }
        clearCallback();
        await refresh();
        navigate(admin || user?.roles?.includes('admin') ? '/admin' : '/dashboard');
      } else if (mode === 'forgot') {
        await requestPasswordRecovery(email);
        setMessage('If an account exists for this address, a recovery link has been sent. Check your inbox and spam folder.');
      } else if (mode === 'signup') {
        const created = await signup(email, password, { full_name: String(data.get('name')) });
        if (created.confirmedAt) {
          await refresh();
          navigate('/register');
        } else {
          setMessage('Check your email to confirm your account. Then return to log in and complete your team registration. No team registration has been created yet.');
        }
      } else {
        const loggedIn = await login(email, password);
        clearCallback();
        await refresh();
        if (admin && !loggedIn.roles?.includes('admin')) {
          setError('You’re signed in, but this account does not have organizer access. Ask an event administrator to assign the admin role.');
          return;
        }
        navigate(admin ? '/admin' : returnTo);
      }
    } catch (caught: unknown) {
      const status = typeof caught === 'object' && caught !== null && 'status' in caught
        ? (caught as { status?: unknown }).status
        : undefined;
      setError(
        (status === 401 || status === 400)
          ? 'Check your email and password. Confirm your email first if you recently created an account.'
          : status === 422
            ? 'Check your details. This email may already have an account, or the password may not meet requirements.'
            : 'We couldn’t complete this account request. Try again, or request a recovery link if you already have an account.')
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth-page container">
      <div className="auth-story">
        <Eyebrow>{admin ? 'MISSION CONTROL' : 'YOUR JOURNEY STARTS HERE'}</Eyebrow>
        <h1 className="page-title">
          {admin ? (
            <>
              BEHIND EVERY
              <br />
              GREAT MISSION.
            </>
          ) : (
            <>
              FIND YOUR CREW.
              <br />
              <span className="serif-accent">Make your mark.</span>
            </>
          )}
        </h1>
        <p>
          {admin
            ? 'Secure organizer access to real registrations, teams, check-ins, and event reports.'
            : 'One account. Your team, your registration, and your ticket to a whole universe of possibility.'}
        </p>
        <span className="mono" style={{ color: '#ffffff' }}>
          ASTROVERSE · 14–16 NOVEMBER 2026
        </span>
      </div>

      <div className="form-panel">
        <div className="panel-heading">
          <ShieldCheck size={26} />
          <span className="mono muted">{admin ? 'ORGANIZER ACCESS' : 'PARTICIPANT ACCESS'}</span>
        </div>

        <h2>
          {reset
            ? 'Set your password.'
            : mode === 'signup'
              ? 'Join the mission.'
              : mode === 'forgot'
                ? 'Find your way back.'
                : 'Welcome back.'}
        </h2>

        <p>
          {reset
            ? 'Choose a strong password to secure your account.'
            : mode === 'signup'
              ? 'Create an account before registering your team.'
              : mode === 'forgot'
                ? 'Enter your email and we’ll send an account recovery link.'
                : 'Log in to access your mission dashboard.'}
        </p>

        {(error || callbackError) && <Notice>{error || callbackError}</Notice>}
        {message && <Notice success>{message}</Notice>}

        <form onSubmit={submit}>
          {!reset && mode === 'signup' && (
            <label>
              Full name
              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                placeholder="Your full name"
              />
            </label>
          )}

          {!reset && (
            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@institution.edu"
              />
            </label>
          )}

          {(reset || mode !== 'forgot') && (
            <label>
              Password
              <div className="password-input">
                <input
                  name="password"
                  type={visible ? 'text' : 'password'}
                  required
                  minLength={reset || mode === 'signup' ? 12 : 1}
                  maxLength={128}
                  autoComplete={reset || mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder={reset || mode === 'signup' ? 'At least 12 characters' : 'Your password'}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? 'Hide password' : 'Show password'}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          {!reset && mode === 'login' && (
            <button
              type="button"
              className="forgot-link"
              onClick={() => {
                setMode('forgot');
                setError('');
                setMessage('');
              }}
            >
              Forgot your password?
            </button>
          )}

          <button className="button primary full-width" disabled={busy}>
            {busy
              ? 'Connecting…'
              : reset
                ? 'Save password'
                : mode === 'signup'
                  ? 'Create account'
                  : mode === 'forgot'
                    ? 'Send recovery link'
                    : admin
                      ? 'Enter mission control'
                      : 'Log in'}
            <ArrowRight size={17} />
          </button>
        </form>

        {!reset && (
          <div className="auth-switch">
            {mode === 'forgot' ? (
              <button onClick={() => setMode('login')}>Back to log in</button>
            ) : admin ? (
              <Link to="/login">Looking for participant login?</Link>
            ) : (
              <>
                {mode === 'signup' ? 'Already part of the crew?' : 'New to ASTROVERSE?'}{' '}
                <button
                  onClick={() => {
                    setMode(mode === 'signup' ? 'login' : 'signup');
                    setError('');
                    setMessage('');
                  }}
                >
                  {mode === 'signup' ? 'Log in' : 'Create an account'}
                  <ArrowUpRightLocal />
                </button>
              </>
            )}
          </div>
        )}

        <p className="form-footnote">
          Your information stays private. <Link to="/privacy">Privacy & declaration</Link>
        </p>
      </div>
    </div>
  );
}

function ArrowUpRightLocal() {
  return <ArrowRight size={13} />;
}
