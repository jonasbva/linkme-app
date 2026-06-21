'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

interface DatePickerProps {
  /** Selected date as a local YYYY-MM-DD string. */
  value: string
  onChange: (value: string) => void
  isLight: boolean
  /** If true, days after today can't be selected (default true). */
  disableFuture?: boolean
}

function pad(n: number) { return String(n).padStart(2, '0') }
function toYMD(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1)
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function startOfDay(d: Date) { const r = new Date(d); r.setHours(0, 0, 0, 0); return r }

export default function DatePicker({ value, onChange, isLight, disableFuture = true }: DatePickerProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => parseYMD(value), [value])
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Snap the visible month to the selected date whenever the picker opens.
  useEffect(() => {
    if (show) { setViewYear(selected.getFullYear()); setViewMonth(selected.getMonth()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const today = startOfDay(new Date())

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
    const days: { date: Date; inMonth: boolean }[] = []
    for (let i = startOffset - 1; i >= 0; i--) days.push({ date: new Date(viewYear, viewMonth, -i), inMonth: false })
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(viewYear, viewMonth, i), inMonth: true })
    while (days.length % 7 !== 0) {
      const d = new Date(viewYear, viewMonth + 1, days.length - startOffset - lastDay.getDate() + 1)
      days.push({ date: d, inMonth: false })
    }
    return days
  }, [viewYear, viewMonth])

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const triggerLabel = selected.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1)
  }

  function pick(d: Date) {
    if (disableFuture && startOfDay(d) > today) return
    onChange(toYMD(d))
    setShow(false)
  }

  const presets: { label: string; build: () => Date }[] = [
    { label: 'Today', build: () => new Date() },
    { label: 'Yesterday', build: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d } },
    { label: '2 days ago', build: () => { const d = new Date(); d.setDate(d.getDate() - 2); return d } },
  ]

  // ─── Theme tokens (mirrors DateRangePicker) ───
  const popBg = isLight ? 'bg-white border-black/10 shadow-xl' : 'bg-[#111] border-white/[0.08] shadow-2xl shadow-black/60'
  const textMuted = isLight ? 'text-black/40' : 'text-white/40'
  const textDim = isLight ? 'text-black/20' : 'text-white/20'
  const textPrimary = isLight ? 'text-black/80' : 'text-white/90'
  const divider = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
  const dayBase = isLight ? 'hover:bg-black/[0.06] text-black/70' : 'hover:bg-white/[0.06] text-white/70'
  const dayOutside = isLight ? 'text-black/15' : 'text-white/15'
  const daySelected = 'bg-blue-500 text-white hover:bg-blue-600'
  const dayToday = isLight ? 'ring-1 ring-blue-400/40' : 'ring-1 ring-blue-400/30'
  const presetBtn = isLight ? 'text-black/60 hover:bg-black/[0.05] hover:text-black/90' : 'text-white/50 hover:bg-white/[0.06] hover:text-white/90'

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg transition-all ${
          isLight ? 'bg-black/[0.03] border border-black/[0.08] hover:bg-black/[0.06]' : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06]'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isLight ? 'text-black/30' : 'text-white/30'}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`text-[13px] font-medium ${isLight ? 'text-black/70' : 'text-white/70'}`}>{triggerLabel}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isLight ? 'text-black/25' : 'text-white/25'}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {show && (
        <div className={`absolute top-full left-0 mt-2 z-50 ${popBg} border rounded-2xl overflow-hidden flex`}>
          {/* Presets */}
          <div className={`w-[130px] shrink-0 border-r ${divider} py-3 px-2 flex flex-col gap-0.5`}>
            {presets.map(p => {
              const d = p.build()
              const active = isSameDay(d, selected)
              return (
                <button
                  key={p.label}
                  onClick={() => pick(d)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                    active ? (isLight ? 'bg-blue-500/10 text-blue-600 font-semibold' : 'bg-blue-500/15 text-blue-400 font-semibold') : presetBtn
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Calendar */}
          <div className="p-4 w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-black/[0.05]' : 'hover:bg-white/[0.06]'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={textMuted}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span className={`text-[14px] font-semibold ${textPrimary}`}>{monthLabel}</span>
              <button type="button" onClick={nextMonth} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-black/[0.05]' : 'hover:bg-white/[0.06]'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={textMuted}><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} className={`text-center text-[11px] font-medium py-1 ${textDim}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, inMonth }, i) => {
                const isSel = isSameDay(date, selected)
                const isTodayDay = isSameDay(date, today)
                const isFuture = disableFuture && startOfDay(date) > today
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isFuture}
                    onClick={() => pick(date)}
                    className={`relative h-9 w-full text-[13px] rounded-lg transition-all ${
                      isSel ? daySelected : isFuture ? `${dayOutside} cursor-not-allowed opacity-40` : inMonth ? dayBase : `${dayOutside} hover:opacity-60`
                    } ${isTodayDay && !isSel ? dayToday : ''}`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
