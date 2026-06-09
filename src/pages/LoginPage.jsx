import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DEMO_EMAIL    = 'demo@wrenchlogic.com';
const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
  const navigate    = useNavigate();
  const { session } = useAuth();

  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [notice,   setNotice]   = useState('');

  if (session) return <Navigate to="/catalog" replace />;

  const doLogin = async (emailVal, passVal) => {
    setError('');
    setNotice('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passVal });
    if (error) {
      setError('אימייל או סיסמה שגויים');
    } else {
      navigate('/catalog');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      await doLogin(email, password);
    } else {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message === 'User already registered'
          ? 'כתובת האימייל כבר רשומה במערכת'
          : 'שגיאה בהרשמה — נסה שוב');
      } else {
        setNotice('נרשמת בהצלחה! בדוק את האימייל שלך לאישור, או התחבר אם האישור כבר נשלח.');
      }
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setMode('login');
    doLogin(DEMO_EMAIL, DEMO_PASSWORD);
  };

  const handleOAuth = async (provider) => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/catalog` },
    });
    if (error) setError(`שגיאה בהתחברות עם ${provider === 'google' ? 'Google' : 'Facebook'}`);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center px-4">

      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBurEgOH3jmw4eP2CFysB37rBzR1e4jguvbCXMmSgXy_LdyIj0Dt_4LflY0ZcbQ0nRomlIvMXFZ4bPCtz4SZ38MQj-1c_qeUmZATwJ8dY7uD-CB0iA11TPi2k_ug22YT7VK54m_28VUg2davlnVadi5crMA3P57aIiiT5H4tWe5tNHxBK1zvkhJHC4467uzSrInD9VO1VTO9AYe9cICqc3W8s6tP8Mm8cFIFmZBSilUSwMIX3iZbmvqwhBR6EioeMI43dCkoG72YTw')] bg-cover bg-center" />

      <div className="relative z-10 w-full max-w-md space-y-4">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#FF6B00] uppercase tracking-tighter">
            WrenchLogic
          </h1>
          <p className="font-mono-data text-mono-data text-secondary uppercase mt-1">
            Engineered Performance
          </p>
        </div>

        {/* Demo Banner */}
        <div className="bg-[#1E1E1E] border border-[#FF6B00]/40 rounded-lg px-5 py-4" dir="rtl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#FF6B00] text-[18px]">bolt</span>
            <span className="font-label-caps text-label-caps text-[#FF6B00] uppercase">כניסת דמו מהירה</span>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-mono-data text-[11px] text-secondary space-y-0.5">
              <p dir="ltr">email: {DEMO_EMAIL}</p>
              <p dir="ltr">pass:&nbsp; {DEMO_PASSWORD}</p>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="shrink-0 bg-[#FF6B00] text-[#121212] font-label-caps text-label-caps px-4 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5 shadow-[0_2px_6px_rgba(255,107,0,0.35)]"
            >
              {loading
                ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-[16px]">login</span>
              }
              כנס כדמו
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-8 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#2D2D2D]" />
            <span className="font-mono-data text-[11px] text-[#474747] uppercase">או כניסה ידנית</span>
            <div className="flex-1 h-px bg-[#2D2D2D]" />
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-row-reverse mb-6 border-b border-[#2D2D2D]">
            {[
              { id: 'login',  label: 'התחברות' },
              { id: 'signup', label: 'הרשמה'   },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setMode(tab.id); setError(''); setNotice(''); }}
                className={
                  `flex-1 py-2 font-label-caps text-label-caps transition-colors ` +
                  (mode === tab.id
                    ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                    : 'text-secondary hover:text-on-surface')
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">

            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps text-secondary">אימייל</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                dir="ltr"
                className="w-full bg-[#121212] border border-[#2D2D2D] rounded text-[#E0E0E0] p-3 font-body-md text-body-md focus:border-[#FF6B00] focus:outline-none placeholder:text-[#474747]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps text-secondary">סיסמה</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                className="w-full bg-[#121212] border border-[#2D2D2D] rounded text-[#E0E0E0] p-3 font-body-md text-body-md focus:border-[#FF6B00] focus:outline-none placeholder:text-[#474747]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 rounded p-3 text-red-400 font-body-md text-body-md">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {error}
              </div>
            )}

            {notice && (
              <div className="flex items-center gap-2 bg-green-900/20 border border-green-800 rounded p-3 text-green-400 font-body-md text-body-md">
                <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B00] text-[#121212] font-label-caps text-label-caps py-4 rounded hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                : <span className="material-symbols-outlined text-[20px]">
                    {mode === 'login' ? 'login' : 'person_add'}
                  </span>
              }
              {mode === 'login' ? 'כניסה למערכת' : 'יצירת חשבון'}
            </button>

          </form>

          {/* OAuth divider */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-[#2D2D2D]" />
            <span className="font-mono-data text-[11px] text-[#474747]">או</span>
            <div className="flex-1 h-px bg-[#2D2D2D]" />
          </div>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3 mt-4" dir="rtl">

            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-[#1A1A1A] font-label-caps text-label-caps py-3 rounded border border-[#DDDDDD] hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {/* Google "G" SVG icon */}
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              התחבר עם Google
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleOAuth('facebook')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-label-caps text-label-caps py-3 rounded hover:bg-[#166FE5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {/* Facebook "f" SVG icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="white">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              התחבר עם Facebook
            </button>

          </div>
        </div>

        <p className="text-center font-mono-data text-secondary text-xs">
          <Link to="/" className="hover:text-[#FF6B00] transition-colors">חזור לעמוד הראשי ←</Link>
        </p>

      </div>
    </main>
  );
}