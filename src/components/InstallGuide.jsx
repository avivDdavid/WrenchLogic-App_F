// Estimated install effort by difficulty.
const TIME_BY_DIFFICULTY = {
  easy:   '~30 דקות | כלים בסיסיים בלבד',
  medium: '~2-3 שעות | דורש ידע טכני',
  expert: '~יום עבודה | חובה מוסך מקצועי',
};

// Visual difficulty — 3 circles.
const CIRCLES_BY_DIFFICULTY = {
  easy:   '🟢⚪⚪',
  medium: '🟠🟠⚪',
  expert: '🔴🔴🔴',
};

const LABEL_BY_DIFFICULTY = { easy: 'קל', medium: 'בינוני', expert: 'מומחה' };

// YouTube embeds per category — placeholders for now (real videos added later).
const VIDEO_BY_CATEGORY = {
  engine:     'https://www.youtube.com/embed/dQw4w9WgXcQ',
  intake:     'https://www.youtube.com/embed/dQw4w9WgXcQ',
  exhaust:    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  brakes:     'https://www.youtube.com/embed/dQw4w9WgXcQ',
  suspension: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  boost:      'https://www.youtube.com/embed/dQw4w9WgXcQ',
};
const DEFAULT_VIDEO = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

export default function InstallGuide({ difficulty, category, isLegal }) {
  const timeEstimate = TIME_BY_DIFFICULTY[difficulty] ?? 'זמן התקנה לא ידוע';
  const circles      = CIRCLES_BY_DIFFICULTY[difficulty] ?? '⚪⚪⚪';
  const diffLabel    = LABEL_BY_DIFFICULTY[difficulty] ?? (difficulty || '—');
  const videoSrc     = VIDEO_BY_CATEGORY[category] ?? DEFAULT_VIDEO;

  return (
    <div className="flex flex-col gap-lg">

      {/* 1. Estimated time */}
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex flex-row-reverse items-center gap-md text-right">
        <span className="material-symbols-outlined text-primary-container text-[28px]">schedule</span>
        <div>
          <p className="font-label-caps text-label-caps text-surface-variant uppercase">זמן התקנה משוער</p>
          <p className="font-body-lg text-body-lg text-on-surface mt-1" dir="rtl">{timeEstimate}</p>
        </div>
      </div>

      {/* 2. Visual difficulty */}
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md flex flex-row-reverse items-center justify-between gap-md">
        <div className="text-right">
          <p className="font-label-caps text-label-caps text-surface-variant uppercase">רמת קושי</p>
          <p className="font-body-lg text-body-lg text-on-surface mt-1">{diffLabel}</p>
        </div>
        <span className="text-[28px] tracking-widest" aria-label={`רמת קושי: ${diffLabel}`}>{circles}</span>
      </div>

      {/* 3. Responsive 16:9 YouTube embed */}
      <div>
        <p className="font-label-caps text-label-caps text-surface-variant uppercase mb-sm text-right">סרטון הדרכה</p>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#2D2D2D] bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={videoSrc}
            title="מדריך התקנה"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* 4. Track-only legal warning */}
      {isLegal === false && (
        <div className="bg-[#FEE2E2] border border-[#991B1B]/30 rounded-lg p-md flex flex-row-reverse items-center gap-3 text-right">
          <span className="text-[22px]">⚠️</span>
          <p className="font-body-md text-body-md font-semibold text-[#991B1B]" dir="rtl">
            חלף זה מיועד לשימוש במסלול בלבד — לא חוקי לכביש
          </p>
        </div>
      )}

      {/* 5. Find a technician */}
      <a
        href="https://www.google.com/maps/search/מוסך+ספורט"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-primary-container text-[#121212] font-label-caps text-label-caps py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        <span className="material-symbols-outlined text-[18px]">location_on</span>
        מצא טכנאי מומלץ באזורך →
      </a>
    </div>
  );
}
