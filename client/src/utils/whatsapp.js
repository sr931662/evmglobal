const PHONE = '917070595907'

const DEFAULT_MESSAGE =
  "Hi Ease My Vacations, I'm planning a holiday and would like a personalized quote."

export function openWhatsApp(context = '') {
  // Multi-line strings (e.g. a lead recap) are passed through untouched;
  // a short string is treated as a package name.
  const message = !context
    ? DEFAULT_MESSAGE
    : context.includes('\n')
      ? context
      : `Hi Ease My Vacations, I am interested in the "${context}" holiday. Could you share a personalized quote?`

  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, '_blank')
}
