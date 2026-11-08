'use client'
export const CONVERSIONS_UPDATED = 'maho:conversions-updated'
export function notifyConversionsUpdated() {
  window.dispatchEvent(new Event(CONVERSIONS_UPDATED))
  // Wake other tabs only after the server has confirmed the write. Values
  // contain no creator data. Polling handles saves by other team members.
  try { localStorage.setItem(CONVERSIONS_UPDATED, `${Date.now()}:${Math.random()}`) } catch { /* Storage may be disabled. */ }
}
