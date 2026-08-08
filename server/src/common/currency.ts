// Single source of truth for rendering INR amounts server-side. Used to
// normalize Package.price so the display string can never drift from the
// numeric priceValue, regardless of what a client sends.

const FULL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatINR(value: unknown): string | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? FULL.format(n) : null;
}
