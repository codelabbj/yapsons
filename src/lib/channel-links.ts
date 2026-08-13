/** Lien WhatsApp support Yapson (click-to-chat), pas un numéro. */
export const DEFAULT_WHATSAPP_LINK = 'https://wa.me/message/25W53A4ZCBAGC1'

/** Helpers liens support. Yapson utilise un lien configuré, pas un numéro. */
export function formatWhatsAppLink(phoneOrLink?: string | null, indicator?: string | null): string {
  const raw = (phoneOrLink || '').trim()
  if (raw.startsWith('http') || raw.includes('wa.me') || raw.includes('whatsapp.com')) {
    return raw.startsWith('http') ? raw : `https://${raw.replace(/^\/+/, '')}`
  }
  const cleanPhone = raw.replace(/\D/g, '')
  if (cleanPhone) {
    const cleanIndicator = (indicator || '').replace(/\D/g, '')
    return `https://wa.me/${cleanIndicator}${cleanPhone}`
  }
  return DEFAULT_WHATSAPP_LINK
}

export function formatTelegramLink(telegram?: string | null): string {
  if (!telegram) return ""
  const value = String(telegram).trim()
  if (!value) return ""
  if (value.startsWith("http")) return value
  return `https://t.me/${value.replace(/^@/, "")}`
}
