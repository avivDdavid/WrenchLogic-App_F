// A part is "new" if its created_at is within the last two weeks.
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export function isNewPart(createdAt) {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= TWO_WEEKS_MS;
}

// "חדש 🔥" pill — orange, white text, fully rounded. Renders nothing for
// parts that aren't recent (or before the created_at column exists).
// Pass positioning via className (e.g. "absolute top-2 left-2 z-10").
export default function NewBadge({ createdAt, className = '' }) {
  if (!isNewPart(createdAt)) return null;
  return (
    <span className={`inline-flex items-center bg-[#FF6B00] text-white text-xs font-bold px-2 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)] whitespace-nowrap ${className}`}>
      חדש 🔥
    </span>
  );
}
