import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { syncProfileFromSignup } from '../lib/profile';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still loading, null = no session, object = logged in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session ?? null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // On login, backfill the profiles row from signup metadata / a stashed avatar
  // (covers the case where email confirmation delayed the session at signup).
  useEffect(() => {
    if (session?.user) syncProfileFromSignup(session.user);
  }, [session?.user?.id]);

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}