export default function TriSegmentProgressBar({ label, base, current, target, maxScale }) {
  const clamp = (v) => Math.min(Math.max(v, 0), 100);

  const baseW    = clamp((base    / maxScale) * 100);
  const currentW = clamp((current / maxScale) * 100);
  const targetW  = clamp((target  / maxScale) * 100);

  return (
    <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md">
      <div className="flex justify-between items-center mb-md">
        <span className="font-mono-data text-mono-data text-secondary">{label}</span>
        <span className="font-h2 text-h2 text-on-surface">
          {current}
          <span className="text-[#474746] text-sm"> / {base}</span>
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-2 bg-[#121212] rounded-full overflow-hidden">
        {/* Segment 3 – planned gains (white glow) — widest layer */}
        <div
          className="absolute inset-y-0 right-0 bg-white/20 rounded-full"
          style={{ width: `${targetW}%` }}
        />
        {/* Segment 2 – installed gains (orange) — covers planned */}
        <div
          className="absolute inset-y-0 right-0 bg-primary-container rounded-full"
          style={{ width: `${currentW}%` }}
        />
        {/* Segment 1 – stock/base (dark gray) — covers orange up to stock */}
        <div
          className="absolute inset-y-0 right-0 bg-[#2D2D2D] rounded-full"
          style={{ width: `${baseW}%` }}
        />
        {/* Stock marker */}
        <div
          className="absolute inset-y-0 w-px bg-white z-10"
          style={{ right: `${baseW}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-[#474746] mt-base font-mono-data">
        <span>0</span>
        <span>STOCK {base}</span>
        <span>{maxScale}+</span>
      </div>
    </div>
  );
}
