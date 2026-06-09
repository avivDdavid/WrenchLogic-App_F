// Small orange "❓" badge that reveals an RTL tooltip on hover/focus.
// `text` is shown with line breaks preserved (whitespace-pre-line).
export default function HelpHint({ text, label = 'עזרה' }) {
  return (
    <span className="relative inline-flex group align-middle">
      <button
        type="button"
        aria-label={label}
        className="w-5 h-5 flex items-center justify-center rounded border border-primary-container text-primary-container text-[11px] leading-none hover:bg-primary-container/10 focus:bg-primary-container/10 transition-colors cursor-help"
      >
        ❓
      </button>
      <span
        role="tooltip"
        dir="rtl"
        className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-[280px] max-w-[280px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 bg-[#2D2D2D] text-white text-[12px] leading-relaxed border border-primary-container rounded-lg p-3 shadow-[0_4px_16px_rgba(0,0,0,0.5)] text-right whitespace-pre-line"
      >
        {text}
        {/* downward arrow */}
        <span className="absolute top-full right-1/2 translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-[#FF6B00]" />
      </span>
    </span>
  );
}
