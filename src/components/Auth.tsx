import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getUser, handleAuthCallback, onAuthChange, type User, type CallbackResult } from '@netlify/identity';
import { Navigate, useLocation } from 'react-router-dom';
import { Loading, Notice } from './UI';

const AuthContext = createContext<{ user: User | null; loading: boolean; callback: string | null; inviteToken: string | null; error: string; refresh: () => Promise<void>; clearCallback: () => void }>({ user: null, loading: true, callback: null, inviteToken: null, error: '', refresh: async () => {}, clearCallback: () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [callback, setCallback] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const callbackPromise = useRef<Promise<CallbackResult | null> | null>(null);
  const refresh = async () => { setUser(await getUser()); };
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthChange((_event, current) => { if (active) setUser(current); });
    async function initialize() {
      try {
        callbackPromise.current ||= handleAuthCallback();
        const result = await callbackPromise.current;
        if (!active) return;
        if (result) { setCallback(result.type); if (result.type === 'invite') setInviteToken(result.token || null); }
        const current = await getUser();
        if (active) setUser(current);
      } catch { if (active) setError('This account link has expired or is invalid. Request a new email link to continue.'); }
      finally { if (active) setLoading(false); }
    }
    initialize();
    return () => { active = false; unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{ user, loading, callback, inviteToken, error, refresh, clearCallback: () => { setCallback(null); setInviteToken(null); setError(''); } }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export function Protected({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading text="Connecting to mission control…" />;
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} replace state={{ from: location.pathname }} />;
  if (!user.confirmedAt) return <div className="page narrow"><Notice>Confirm your email address before accessing your dashboard.</Notice></div>;
  if (admin && !user.roles?.includes('admin')) return <Navigate to="/admin/login" replace />;
  return children;
}
