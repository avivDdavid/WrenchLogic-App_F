import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fileToResizedDataUrl } from '../lib/imageResize';
import { upsertProfile, stashPendingAvatar } from '../lib/profile';

const DEMO_EMAIL    = 'demo@wrenchlogic.com';
const DEMO_PASSWORD = 'demo1234';

// OAuth buttons are hidden until the providers are configured in Supabase.
const OAUTH_ENABLED = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const T = {
  he: {
    tagline: 'Engineered Performance',
    quickDemo: 'כניסת דמו מהירה',
    demoLogin: 'כנס כדמו',
    orManual: 'או כניסה ידנית',
    tabLogin: 'התחבר',
    tabSignup: 'הירשם',
    firstName: 'שם פרטי',
    email: 'אימייל',
    phone: 'טלפון',
    location: 'מיקום / עיר',
    password: 'סיסמה',
    confirmPassword: 'אימות סיסמה',
    profilePic: 'תמונת פרופיל (אופציונלי)',
    firstNamePh: 'השם שלך',
    emailPh: 'your@email.com',
    phonePh: '050-0000000',
    locationPh: 'עיר מגורים',
    pwPh: 'לפחות 6 תווים',
    confirmPh: 'חזור על הסיסמה',
    uploadPhoto: 'העלה תמונה',
    changePhoto: 'שנה תמונה',
    removePhoto: 'הסר',
    submitLogin: 'התחבר',
    submitSignup: 'הירשם',
    backHome: 'חזור לעמוד הראשי ←',
    err: {
      required: 'נא למלא את כל שדות החובה',
      invalidEmail: 'כתובת אימייל לא תקינה',
      shortPw: 'הסיסמה חייבת להכיל לפחות 6 תווים',
      pwMismatch: 'הסיסמאות אינן תואמות',
      emailTaken: 'כתובת האימייל כבר רשומה במערכת',
      signupFail: 'שגיאה בהרשמה — נסה שוב',
      loginFail: 'אימייל או סיסמה שגויים',
      imageFail: 'טעינת התמונה נכשלה — נסה תמונה אחרת',
    },
    signupSuccess: 'נרשמת בהצלחה! אם נדרש אישור מייל — בדוק את תיבת הדואר. אחרת תוכל להתחבר כעת.',
  },
  en: {
    tagline: 'Engineered Performance',
    quickDemo: 'Quick demo login',
    demoLogin: 'Enter as demo',
    orManual: 'or manual login',
    tabLogin: 'Sign In',
    tabSignup: 'Register',
    firstName: 'First name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location / City',
    password: 'Password',
    confirmPassword: 'Confirm password',
    profilePic: 'Profile picture (optional)',
    firstNamePh: 'Your name',
    emailPh: 'your@email.com',
    phonePh: '050-0000000',
    locationPh: 'Your city',
    pwPh: 'At least 6 characters',
    confirmPh: 'Repeat the password',
    uploadPhoto: 'Upload photo',
    changePhoto: 'Change photo',
    removePhoto: 'Remove',
    submitLogin: 'Sign In',
    submitSignup: 'Register',
    backHome: '← Back to home',
    err: {
      required: 'Please fill in all required fields',
      invalidEmail: 'Invalid email address',
      shortPw: 'Password must be at least 6 characters',
      pwMismatch: 'Passwords do not match',
      emailTaken: 'This email is already registered',
      signupFail: 'Sign-up failed — please try again',
      loginFail: 'Wrong email or password',
      imageFail: 'Image failed to load — try another one',
    },
    signupSuccess: 'Registered successfully! If email confirmation is required, check your inbox. Otherwise you can sign in now.',
  },
};

export default function LoginPage() {
  const navigate    = useNavigate();
  const { session } = useAuth();
  const { lang }    = useTheme();
  const t  = T[lang] || T.he;
  const isHe = lang === 'he';

  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [notice,   setNotice]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Extended signup fields
  const [firstName, setFirstName] = useState('');
  const [phone,     setPhone]     = useState('');
  const [location,  setLocation]  = useState('');
  const [avatar,    setAvatar]    = useState(''); // resized base64 data URI

  if (session) return <Navigate to="/catalog" replace />;

  const resetMessages = () => { setError(''); setNotice(''); };

  const doLogin = async (emailVal, passVal) => {
    resetMessages();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passVal });
    if (error) {
      setError(t.err.loginFail);
    } else {
      navigate('/catalog');
    }
    setLoading(false);
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setAvatar(dataUrl);
      setError('');
    } catch {
      setError(t.err.imageFail);
    }
  };

  const handleSignup = async () => {
    resetMessages();

    // Client-side validation
    if (!firstName.trim() || !email.trim() || !phone.trim() || !location.trim() || !password || !confirmPassword) {
      setError(t.err.required); return;
    }
    if (!EMAIL_RE.test(email.trim())) { setError(t.err.invalidEmail); return; }
    if (password.length < 6)          { setError(t.err.shortPw); return; }
    if (password !== confirmPassword) { setError(t.err.pwMismatch); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Stored on auth.users (small text only) → survives email confirmation and
      // is synced into the profiles table on first login.
      options: { data: { first_name: firstName.trim(), phone: phone.trim(), location: location.trim() } },
    });

    if (error) {
      setError(error.message === 'User already registered' ? t.err.emailTaken : t.err.signupFail);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (data.session && userId) {
      // Confirmation disabled → we're authenticated, write the full profile now.
      await upsertProfile(userId, {
        first_name: firstName.trim(),
        phone:      phone.trim(),
        location:   location.trim(),
        ...(avatar ? { avatar_url: avatar } : {}),
      });
    } else if (avatar) {
      // Confirmation pending → no session yet; stash avatar for first login.
      stashPendingAvatar(avatar);
    }

    setNotice(t.signupSuccess);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') await doLogin(email, password);
    else                  await handleSignup();
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setMode('login');
    doLogin(DEMO_EMAIL, DEMO_PASSWORD);
  };

  const handleOAuth = async (provider) => {
    resetMessages();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/catalog` },
    });
    if (error) setError(`OAuth error (${provider})`);
    setLoading(false);
  };

  const inputClass = 'w-full bg-[#121212] border border-[#2D2D2D] rounded text-[#E0E0E0] p-3 font-body-md text-body-md focus:border-[#FF6B00] focus:outline-none placeholder:text-[#474747]';
  const dir = isHe ? 'rtl' : 'ltr';

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center px-4 py-10">

      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBurEgOH3jmw4eP2CFysB37rBzR1e4jguvbCXMmSgXy_LdyIj0Dt_4LflY0ZcbQ0nRomlIvMXFZ4bPCtz4SZ38MQj-1c_qeUmZATwJ8dY7uD-CB0iA11TPi2k_ug22YT7VK54m_28VUg2davlnVadi5crMA3P57aIiiT5H4tWe5tNHxBK1zvkhJHC4467uzSrInD9VO1VTO9AYe9cICqc3W8s6tP8Mm8cFIFmZBSilUSwMIX3iZbmvqwhBR6EioeMI43dCkoG72YTw')] bg-cover bg-center" />

      <div className="relative z-10 w-full max-w-md space-y-4">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#FF6B00] uppercase tracking-tighter">
            WrenchLogic
          </h1>
          <p className="font-mono-data text-mono-data text-secondary uppercase mt-1">
            {t.tagline}
          </p>
        </div>

        {/* Demo Banner */}
        <div className="bg-[#1E1E1E] border border-[#FF6B00]/40 rounded-lg px-5 py-4" dir={dir}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#FF6B00] text-[18px]">bolt</span>
            <span className="font-label-caps text-label-caps text-[#FF6B00] uppercase">{t.quickDemo}</span>
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
              {t.demoLogin}
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-8 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#2D2D2D]" />
            <span className="font-mono-data text-[11px] text-[#474747] uppercase">{t.orManual}</span>
            <div className="flex-1 h-px bg-[#2D2D2D]" />
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-row-reverse mb-6 border-b border-[#2D2D2D]">
            {[
              { id: 'login',  label: t.tabLogin },
              { id: 'signup', label: t.tabSignup },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setMode(tab.id); resetMessages(); setConfirmPassword(''); }}
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

          <form onSubmit={handleSubmit} className="space-y-4" dir={dir}>

            {/* First name — signup only */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-secondary">{t.firstName}</label>
                <input
                  type="text"
                  required
                  name="given-name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder={t.firstNamePh}
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps text-secondary">{t.email}</label>
              <input
                type="email"
                required
                name="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPh}
                dir="ltr"
                className={inputClass}
              />
            </div>

            {/* Phone + Location — signup only */}
            {mode === 'signup' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-secondary">{t.phone}</label>
                  <input
                    type="tel"
                    required
                    name="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t.phonePh}
                    dir="ltr"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-secondary">{t.location}</label>
                  <input
                    type="text"
                    required
                    name="address-level2"
                    autoComplete="address-level2"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder={t.locationPh}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps text-secondary">{t.password}</label>
              <input
                type="password"
                required
                minLength={6}
                name="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.pwPh}
                className={inputClass}
              />
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-secondary">{t.confirmPassword}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  name="confirm-password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPh}
                  className={inputClass}
                />
              </div>
            )}

            {/* Profile picture — signup only, optional */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-secondary">{t.profilePic}</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#2D2D2D] bg-[#121212] flex items-center justify-center shrink-0">
                    {avatar
                      ? <img src={avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="material-symbols-outlined text-[#474747] text-[32px]">person</span>
                    }
                  </div>
                  <label className="cursor-pointer border border-[#FF6B00]/50 text-[#FF6B00] font-label-caps text-label-caps px-3 py-2 rounded hover:bg-[#FF6B00] hover:text-[#121212] transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    {avatar ? t.changePhoto : t.uploadPhoto}
                    <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="font-label-caps text-[11px] text-secondary hover:text-red-400 transition-colors"
                    >
                      {t.removePhoto}
                    </button>
                  )}
                </div>
              </div>
            )}

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
              {mode === 'login' ? t.submitLogin : t.submitSignup}
            </button>

          </form>

          {OAUTH_ENABLED && (<>
          {/* OAuth divider */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-[#2D2D2D]" />
            <span className="font-mono-data text-[11px] text-[#474747]">{isHe ? 'או' : 'or'}</span>
            <div className="flex-1 h-px bg-[#2D2D2D]" />
          </div>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3 mt-4" dir={dir}>

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
              {isHe ? 'התחבר עם Google' : 'Continue with Google'}
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
              {isHe ? 'התחבר עם Facebook' : 'Continue with Facebook'}
            </button>

          </div>
          </>)}
        </div>

        <p className="text-center font-mono-data text-secondary text-xs">
          <Link to="/" className="hover:text-[#FF6B00] transition-colors">{t.backHome}</Link>
        </p>

      </div>
    </main>
  );
}
