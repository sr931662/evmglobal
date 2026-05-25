const PHONE = '917070595907'

export function openWhatsApp(packageName = '') {
  const message = packageName
    ? `Hi EMV Global, I am interested in customizing the "${packageName}" package. Could you share more details?`
    : 'Hi EMV Global, I am interested in planning a premium trip.'
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, '_blank')
}
