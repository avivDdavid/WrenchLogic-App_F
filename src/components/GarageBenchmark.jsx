import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { partName } from '../lib/displayNames';

const MIN_USERS = 3; // need at least this many builders to show a meaningful benchmark

const T = {
  he: {
    title: 'איפה אתה עומד?',
    rpcLine1: (sql) => (
      <>כדי להפעיל השוואה קהילתית, הרץ את <span className="font-mono-data text-primary-container">{sql}</span> ב-Supabase → SQL Editor.</>
    ),
    rpcLine2: (<>הפונקציה <code>get_benchmark_stats()</code> מחושבת בצד-שרת ועוקפת RLS בצורה מאובטחת.</>),
    notEnoughTitle: (m) => `היה מהראשונים לבנות ${m} — אין עדיין מספיק נתונים להשוואה`,
    notEnoughSub: (m, n) => `נדרשים לפחות ${n} בוני ${m} כדי לחשב ממוצע קהילתי.`,
    strongerThan: (pct, m) => `הרכב שלך חזק מ-${pct}% מה-${m} באתר`,
    yourHp: 'כ״ס שלך',
    communityAvg: 'ממוצע קהילתי',
    builders: (m) => `בוני ${m}`,
    percentile: 'אחוזון',
    belowGap: (avgHP, currentHP, m) => (
      <>הרכב הממוצע של {m} באתר על <span className="text-primary-container font-bold">{avgHP} HP</span> — אתה ב-<span className="text-secondary font-bold">{currentHP} HP</span></>
    ),
    beatPrompt: 'מה יעזור לך לעקוף את הממוצע?',
    addToBeat: (name) => (<>הוסף <span className="text-primary-container font-semibold">{name}</span> כדי לעקוף את הממוצע</>),
    pctSuffix: 'אחוזון שלך',
  },
  en: {
    title: 'Where do you stand?',
    rpcLine1: (sql) => (
      <>To enable the community benchmark, run <span className="font-mono-data text-primary-container">{sql}</span> in Supabase → SQL Editor.</>
    ),
    rpcLine2: (<>The <code>get_benchmark_stats()</code> function runs server-side and bypasses RLS securely.</>),
    notEnoughTitle: (m) => `Be one of the first to build the ${m} — not enough data to compare yet`,
    notEnoughSub: (m, n) => `At least ${n} ${m} builders are needed to compute a community average.`,
    strongerThan: (pct, m) => `Your car is stronger than ${pct}% of ${m}s on the site`,
    yourHp: 'Your HP',
    communityAvg: 'Community Avg',
    builders: (m) => `${m} builders`,
    percentile: 'Percentile',
    belowGap: (avgHP, currentHP, m) => (
      <>The average {m} on the site makes <span className="text-primary-container font-bold">{avgHP} HP</span> — you&apos;re at <span className="text-secondary font-bold">{currentHP} HP</span></>
    ),
    beatPrompt: 'What will help you beat the average?',
    addToBeat: (name) => (<>Add <span className="text-primary-container font-semibold">{name}</span> to beat the average</>),
    pctSuffix: 'your percentile',
  },
};

/**
 * GarageBenchmark — "Where do you stand?"
 *
 * Calls the `get_benchmark_stats` Supabase RPC (SECURITY DEFINER, bypasses RLS)
 * to compare the current user's installed-HP vs all WrenchLogic builders.
 */
export default function GarageBenchmark({
  modelName, currentHP, baseHP, ownedIds,
}) {
  const { lang } = useTheme();
  const t = T[lang] || T.he;
  const isHe = lang === 'he';

  const [status,     setStatus]     = useState('loading'); // loading | rpc_missing | not_enough | above_avg | below_avg
  const [stats,      setStats]      = useState(null);      // { avgHP, percentile, userCount }
  const [topRec,     setTopRec]     = useState(null);      // best part to close the gap

  const userGain = currentHP - baseHP;

  useEffect(() => {
    let active = true;

    const run = async () => {
      setStatus('loading');

      // ── 1. Fetch benchmark via RPC ─────────────────────────────────────────
      const { data, error } = await supabase.rpc('get_benchmark_stats');

      if (!active) return;

      if (error) {
        // PGRST202 = function not found; any RPC error → show SQL hint
        setStatus('rpc_missing');
        return;
      }

      const { user_count, avg_hp_gain, gains_sorted } = data;

      if (user_count < MIN_USERS) {
        setStatus('not_enough');
        return;
      }

      // ── 2. Compute percentile ──────────────────────────────────────────────
      // gains_sorted is an ASC-sorted array of each user's total HP gain.
      const gains = Array.isArray(gains_sorted) ? gains_sorted : [];
      const below = gains.filter(g => g < userGain).length;
      const percentile = Math.round((below / gains.length) * 100);
      const avgHP = baseHP + avg_hp_gain;

      setStats({ avgHP, percentile, userCount: user_count });

      if (currentHP >= avgHP) {
        setStatus('above_avg');
      } else {
        setStatus('below_avg');

        // ── 3. Best part to beat the average ──────────────────────────────────
        const owned = new Set(ownedIds);

        const { data: parts } = await supabase
          .from('parts')
          .select('id, name, name_en, hp_gain')
          .gt('hp_gain', 0)
          .order('hp_gain', { ascending: false })
          .limit(20);

        if (!active) return;

        const rec = (parts ?? []).find(p => !owned.has(p.id));
        setTopRec(rec ?? null);
      }
    };

    run();
    return () => { active = false; };
  }, [currentHP, baseHP, ownedIds.join(',')]); // re-run when HP or owned parts change

  // ── Render helpers ─────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <BenchmarkShell title={t.title} isHe={isHe}>
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined text-primary-container text-[32px] animate-spin">progress_activity</span>
        </div>
      </BenchmarkShell>
    );
  }

  if (status === 'rpc_missing') {
    return (
      <BenchmarkShell title={t.title} isHe={isHe}>
        <div className={`bg-[#121212] border border-dashed border-[#2D2D2D] rounded-lg p-md space-y-xs ${isHe ? 'text-right' : 'text-left'}`}>
          <p className="font-body-md text-body-md text-secondary">
            {t.rpcLine1('benchmark_rpc.sql')}
          </p>
          <p className="font-mono-data text-[11px] text-[#474746]">
            {t.rpcLine2}
          </p>
        </div>
      </BenchmarkShell>
    );
  }

  if (status === 'not_enough') {
    return (
      <BenchmarkShell title={t.title} isHe={isHe}>
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md md:p-lg text-center space-y-sm">
          <span className="text-[40px]">🏗️</span>
          <p className="font-h2 text-h2 text-on-surface">
            {t.notEnoughTitle(modelName)}
          </p>
          <p className="font-body-md text-body-md text-secondary">
            {t.notEnoughSub(modelName, MIN_USERS)}
          </p>
        </div>
      </BenchmarkShell>
    );
  }

  const { avgHP, percentile, userCount } = stats;

  if (status === 'above_avg') {
    return (
      <BenchmarkShell title={t.title} isHe={isHe}>
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md md:p-lg space-y-md">
          {/* Trophy badge */}
          <div className="flex items-center justify-center gap-3 bg-[#FF6B00]/10 border border-[#FF6B00]/40 rounded-md py-4 px-6">
            <span className="text-[32px]">🏆</span>
            <p className={`font-h2 text-h2 text-[#FF6B00] ${isHe ? 'text-right' : 'text-left'}`} dir={isHe ? 'rtl' : 'ltr'}>
              {t.strongerThan(percentile, modelName)}
            </p>
          </div>
          {/* Stats row */}
          <div className="flex flex-row-reverse gap-md text-right">
            <Stat label={t.yourHp} value={`${currentHP} HP`} highlight />
            <Stat label={t.communityAvg} value={`${avgHP} HP`} />
            <Stat label={t.builders(modelName)} value={`${userCount}`} />
          </div>
          {/* Simple bar */}
          <PercentileBar percentile={percentile} suffix={t.pctSuffix} />
        </div>
      </BenchmarkShell>
    );
  }

  // below_avg
  return (
    <BenchmarkShell title={t.title} isHe={isHe}>
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md md:p-lg space-y-md">
        {/* Gap info */}
        <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2D2D2D] rounded-md py-3 px-4 flex-row-reverse">
          <span className="text-[28px]">📈</span>
          <p className={`font-body-lg text-body-lg text-on-surface ${isHe ? 'text-right' : 'text-left'}`} dir={isHe ? 'rtl' : 'ltr'}>
            {t.belowGap(avgHP, currentHP, modelName)}
          </p>
        </div>
        {/* Stats row */}
        <div className="flex flex-row-reverse gap-md text-right">
          <Stat label={t.yourHp} value={`${currentHP} HP`} />
          <Stat label={t.communityAvg} value={`${avgHP} HP`} highlight />
          <Stat label={t.percentile} value={`${percentile}%`} />
        </div>
        <PercentileBar percentile={percentile} suffix={t.pctSuffix} />
        {/* Recommended part */}
        {topRec && (
          <div className="pt-sm border-t border-[#2D2D2D]">
            <p className={`font-label-caps text-label-caps text-secondary mb-sm ${isHe ? 'text-right' : 'text-left'}`}>
              {t.beatPrompt}
            </p>
            <div className="bg-[#121212] border border-primary-container/30 rounded-lg p-md flex items-center justify-between gap-md">
              <span className="font-mono-data text-sm text-primary-container bg-primary-container/10 px-2 py-1 rounded shrink-0">
                +{topRec.hp_gain} HP
              </span>
              <p className={`font-body-md text-body-md text-on-surface flex-1 ${isHe ? 'text-right' : 'text-left'}`}>
                {t.addToBeat(partName(topRec, lang))}
              </p>
            </div>
          </div>
        )}
      </div>
    </BenchmarkShell>
  );
}

// ── Small sub-components ───────────────────────────────────────────────────

function BenchmarkShell({ children, title, isHe }) {
  return (
    <section className="space-y-md">
      <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
        <h3 className="font-h2 text-h2 text-primary-container uppercase">{title}</h3>
        {isHe && (
          <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">
            COMMUNITY BENCHMARK
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div className="flex-1 bg-[#121212] border border-[#2D2D2D] rounded-lg p-sm text-center space-y-base">
      <p className="font-label-caps text-label-caps text-secondary text-[10px] tracking-wider">{label}</p>
      <p className={`font-mono-data text-h2 font-bold ${highlight ? 'text-primary-container' : 'text-on-surface'}`}>
        {value}
      </p>
    </div>
  );
}

function PercentileBar({ percentile, suffix }) {
  return (
    <div className="space-y-xs">
      <div className="flex justify-between font-mono-data text-[11px] text-[#474746]">
        <span>0%</span>
        <span className="text-primary-container">{percentile}% {suffix}</span>
        <span>100%</span>
      </div>
      <div className="relative h-2 bg-[#2D2D2D] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary-container rounded-full transition-all duration-500"
          style={{ width: `${percentile}%` }}
        />
      </div>
    </div>
  );
}
