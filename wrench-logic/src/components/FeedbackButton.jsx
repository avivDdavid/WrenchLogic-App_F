import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

const T = {
  he: {
    label: 'משוב',
    title: 'נשמח לשמוע ממך',
    placeholder: 'ספר לנו מה חשבת...',
    rateLabel: 'דירוג (אופציונלי)',
    send: 'שלח',
    sending: 'שולח...',
    cancel: 'ביטול',
    thanks: 'תודה על המשוב!',
  },
  en: {
    label: 'Feedback',
    title: 'We\'d love your feedback',
    placeholder: 'Tell us what you think...',
    rateLabel: 'Rating (optional)',
    send: 'Send',
    sending: 'Sending...',
    cancel: 'Cancel',
    thanks: 'Thanks for your feedback!',
  },
};

// Floating feedback button + modal. Writes to the Supabase `feedback` table
// (message, rating, page_url). Always thanks the user, even if the write fails.
export default function FeedbackButton() {
  const { lang } = useTheme();
  const t = T[lang] || T.he;
  const isHe = lang === 'he';

  const [open, setOpen]       = useState(false);
  const [message, setMessage] = useState('');
  const [rating, setRating]   = useState(0);
  const [sending, setSending] = useState(false);
  const [hidden, setHidden]   = useState(false);

  const close = () => setOpen(false);
  const nothingToSend = !message.trim() && rating === 0;

  const submit = async () => {
    if (nothingToSend) return;
    setSending(true);
    try {
      await supabase.from('feedback').insert({
        message:  message.trim() || null,
        rating:   rating || null,
        page_url: window.location.href,
      });
    } catch { /* graceful — thank the user regardless */ }
    setSending(false);
    alert(t.thanks);
    setMessage('');
    setRating(0);
    setOpen(false);
  };

  return (
    <>
      {/* Floating button — bottom-left to clear the desktop sidebar (right) and
          the mobile bottom nav. Closable via the small ✕. */}
      {hidden ? (
        // Minimal restore tab pinned to the left edge — brings the button back.
        <button
          onClick={() => setHidden(false)}
          aria-label={t.label}
          title={t.label}
          className="fixed z-50 bottom-24 md:bottom-10 left-0 bg-[#FF6B00] text-black rounded-r-md shadow-[0_4px_16px_rgba(0,0,0,0.5)] px-1.5 py-3 flex items-center hover:bg-[#ff8124] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
        </button>
      ) : (
        <div className="fixed z-50 bottom-20 md:bottom-6 left-4">
          <button
            onClick={() => setOpen(true)}
            dir={isHe ? 'rtl' : 'ltr'}
            aria-label={t.label}
            className="flex items-center gap-2 bg-[#FF6B00] text-black font-bold rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)] px-4 py-3 hover:bg-[#ff8124] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span className="font-label-caps text-label-caps">{t.label}</span>
          </button>
          {/* Close (hide) — stopPropagation so it never opens the modal. */}
          <button
            onClick={(e) => { e.stopPropagation(); setHidden(true); }}
            aria-label={isHe ? 'הסתר' : 'Hide'}
            title={isHe ? 'הסתר' : 'Hide'}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1E1E1E] border border-[#2D2D2D] text-secondary text-[12px] leading-none flex items-center justify-center hover:text-white hover:border-[#555] transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={close}>
          <div
            className="w-full max-w-md bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-lg shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-md"
            dir={isHe ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-h2 text-h2 text-primary-container">{t.title}</h2>
              <button onClick={close} aria-label={t.cancel} className="material-symbols-outlined text-secondary hover:text-on-surface cursor-pointer">close</button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.placeholder}
              rows={4}
              dir={isHe ? 'rtl' : 'ltr'}
              className="w-full bg-[#121212] border border-[#2D2D2D] rounded text-on-surface p-3 font-body-md text-body-md focus:border-primary-container focus:outline-none resize-none"
            />

            <div>
              <p className="font-label-caps text-label-caps text-secondary mb-xs">{t.rateLabel}</p>
              <div className="flex gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n === rating ? 0 : n)}
                    aria-label={`${n}`}
                    className="text-[26px] leading-none cursor-pointer"
                  >
                    <span style={{ color: n <= rating ? '#FFD700' : '#474746' }}>★</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-sm justify-end">
              <button
                onClick={close}
                className="border border-[#2D2D2D] text-secondary font-label-caps text-label-caps px-4 py-2 rounded hover:bg-[#2D2D2D] transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={submit}
                disabled={sending || nothingToSend}
                className="bg-[#FF6B00] text-black font-bold font-label-caps text-label-caps px-5 py-2 rounded hover:bg-[#ff8124] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? t.sending : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
