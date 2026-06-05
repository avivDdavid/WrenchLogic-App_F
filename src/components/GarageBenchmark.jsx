import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MIN_USERS = 3; // need at least this many builders to show a meaningful benchmark

/**
 * GarageBenchmark — "Where do you stand?"
 *
 * Calls the `get_benchmark_stats` Supabase RPC (SECURITY DEFINER, bypasses RLS)
 * to compare the current user's installed-HP vs all WrenchLogic builders.
 *
 * States:
 *  - loading       → spinner
 *  - rpc_missing   → RPC not deployed yet; show SQL hint
 *  - not_enough    → < MIN_USERS builders with installs
 *  - above_avg     → user is above the community average
 *  - below_avg     → user is below; show recommended part to close the gap
 */
export default function GarageBenchmark({
  modelName, currentHP, baseHP, ownedIds,
}) {
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
        const hpNeeded = avgHP - currentHP;
        const owned = new Set(ownedIds);

        const { data: parts } = await supabase
          .from('parts')
          .select('id, name, hp_gain')
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
      <BenchmarkShell>
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined text-primary-container text-[32px] animate-spin">progress_activity</span>
        </div>
      </BenchmarkShell>
    );
  }

  if (status === 'rpc_missing') {
    return (
      <BenchmarkShell>
        <div className="bg-[#121212] border border-dashed border-[#2D2D2D] rounded-lg p-md text-right space-y-xs">
          <p className="font-body-md text-body-md text-secondary">
            כדי להפעיל השוואה קהילתית, הרץ את{' '}
            <span className="font-mono-data text-primary-container">benchmark_rpc.sql</span>{' '}
            ב-Supabase → SQL Editor.
          </p>
          <p className="font-mono-data text-[11px] text-[#474746]">
            הפונקציה <code>get_benchmark_stats()</code> מחושבת בצד-שרת ועוקפת RLS בצורה מאובטחת.
          </p>
        </div>
      </BenchmarkShell>
    );
  }

  if (status === 'not_enough') {
    return (
      <BenchmarkShell>
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md md:p-lg text-center space-y-sm">
          <span className="text-[40px]">🏗️</span>
          <p className="font-h2 text-h2 text-on-surface">
            היה מהראשונים לבנות {modelName} — אין עדיין מספיק נתונים להשוואה
          </p>
          <p className="font-body-md text-body-md text-secondary">
            נדרשים לפחות {MIN_USERS} בוני {modelName} כדי לחשב ממוצע קהילתי.
          </p>
        </div>
      </BenchmarkShell>
    );
  }

  const { avgHP, percentile, userCount } = stats;

  if (status === 'above_avg') {
    return (
      <BenchmarkShell>
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md md:p-lg space-y-md">
          {/* Trophy badge */}
          <div className="flex items-center justify-center gap-3 bg-[#FF6B00]/10 border border-[#FF6B00]/40 rounded-md py-4 px-6">
            <span className="text-[32px]">🏆</span>
            <p className="font-h2 text-h2 text-[#FF6B00] text-right" dir="rtl">
              הרכב שלך חזק מ-{percentile}% מה-{modelName} באתר
            </p>
          </div>
          {/* Stats row */}
          <div className="flex flex-row-reverse gap-md text-right">
            <Stat label="כ״ס שלך" value={`${currentHP} HP`} highlight />
            <Stat label="ממוצע קהילתי" value={`${avgHP} HP`} />
            <Stat label="בוני {modelName}" value={`${userCount}`} />
          </div>
          {/* Simple bar */}
          <PercentileBar percentile={percentile} />
        </div>
      </BenchmarkShell>
    );
  }

  // below_avg
  return (
    <BenchmarkShell>
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md md:p-lg space-y-md">
        {/* Gap info */}
        <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2D2D2D] rounded-md py-3 px-4 flex-row-reverse">
          <span className="text-[28px]">📈</span>
          <p className="font-body-lg text-body-lg text-on-surface text-right" dir="rtl">
            הרכב הממוצע של {modelName} באתר על{' '}
            <span className="text-primary-container font-bold">{avgHP} HP</span>
            {' '}— אתה ב-{' '}
            <span className="text-secondary font-bold">{currentHP} HP</span>
          </p>
        </div>
        {/* Stats row */}
        <div className="flex flex-row-reverse gap-md text-right">
          <Stat label="כ״ס שלך" value={`${currentHP} HP`} />
          <Stat label="ממוצע קהילתי" value={`${avgHP} HP`} highlight />
          <Stat label="אחוזון" value={`${percentile}%`} />
        </div>
        <PercentileBar percentile={percentile} />
        {/* Recommended part */}
        {topRec && (
          <div className="pt-sm border-t border-[#2D2D2D]">
            <p className="font-label-caps text-label-caps text-secondary mb-sm text-right">
              מה יעזור לך לעקוף את הממוצע?
            </p>
            <div className="bg-[#121212] border border-primary-container/30 rounded-lg p-md flex items-center justify-between gap-md">
              <span className="font-mono-data text-sm text-primary-container bg-primary-container/10 px-2 py-1 rounded shrink-0">
                +{topRec.hp_gain} HP
              </span>
              <p className="font-body-md text-body-md text-on-surface flex-1 text-right" dir="ltr">
                הוסף <span className="text-primary-container font-semibold">{topRec.name}</span> כדי לעקוף את הממוצע
              </p>
            </div>
          </div>
        )}
      </div>
    </BenchmarkShell>
  );
}

// ── Small sub-components ───────────────────────────────────────────────────

function BenchmarkShell({ children }) {
  return (
    <section className="space-y-md">
      <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
        <h3 className="font-h2 text-h2 text-primary-container uppercase">איפה אתה עומד?</h3>
        <span className="font-label-caps text-label-caps text-[#474746] tracking-widest hidden sm:inline">
          COMMUNITY BENCHMARK
        </span>
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

function PercentileBar({ percentile }) {
  return (
    <div className="space-y-xs">
      <div className="flex justify-between font-mono-data text-[11px] text-[#474746]">
        <span>0%</span>
        <span className="text-primary-container">{percentile}% אחוזון שלך</span>
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
