'use client'

import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react'

interface DateRangePickerProps {
  dateStart: Date
  dateEnd: Date
  dateLabel: string
  onApply: (label: string, start: Date, end: Date) => void
  isLight: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────
function fmtDay(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function fmtDayFull(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtRangeDisplay(start: Date, end: Date) {
  const sameDay = isSameDay(start, end)
  if (sameDay) return `${fmtDay(start)} ${fmtTime(start)}–${fmtTime(end)}`
  return `${fmtDay(start)} ${fmtTime(start)} → ${fmtDay(end)} ${fmtTime(end)}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfDay(d: Date) {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r
}

function endOfDay(d: Date) {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r
}

// Floor to whole minute — used so the "live" end time we show is stable enough
// for the minute-bucketed cache key.
function floorMinute(d: Date) {
  const r = new Date(d); r.setSeconds(0, 0); return r
}

// `now minus 1 minute (floored to the minute)` — the canonical live end time.
function liveEndNow() {
  const n = new Date(Date.now() - 60 * 1000)
  return floorMinute(n)
}

// ISO-local string for <input type="datetime-local"> (no timezone offset)
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(s: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return Number.isFinite(d.getTime()) ? d : null
}

export default function DateRangePicker({ dateStart, dateEnd, dateLabel, onApply, isLight }: DateRangePickerProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  // Inline position so the popup never overflows the viewport horizontally.
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({ visibility: 'hidden' })

  // Calendar state
  const [viewYear, setViewYear] = useState(dateEnd.getFullYear())
  const [viewMonth, setViewMonth] = useState(dateEnd.getMonth())

  // Selection state — now carries minute-precise datetimes
  const [pickStart, setPickStart] = useState<Date>(dateStart)
  const [pickEnd, setPickEnd] = useState<Date>(dateEnd)
  const [picking, setPicking] = useState(false) // waiting for second calendar click

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync state when opening
  useEffect(() => {
    if (show) {
      setViewYear(dateEnd.getFullYear())
      setViewMonth(dateEnd.getMonth())
      setPickStart(dateStart)
      setPickEnd(dateEnd)
      setPicking(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  // Position the popup so it never overflows the viewport horizontally.
  // The popup is ~620px wide; if the button sits near the left edge, a right-anchored
  // popup would run off the left side of the screen. Measure and clamp instead.
  useLayoutEffect(() => {
    if (!show) {
      setPopupStyle({ visibility: 'hidden' })
      return
    }
    function reposition() {
      const btn = buttonRef.current
      const pop = popupRef.current
      if (!btn || !pop) return
      const btnRect = btn.getBoundingClientRect()
      const popWidth = pop.offsetWidth || 620
      const viewportWidth = window.innerWidth
      const margin = 8 // safety margin from viewport edges

      // Preferred: align popup's right edge to button's right edge (original behavior).
      let left = btnRect.right - popWidth
      // If that would overflow the left side, clamp to the left margin.
      if (left < margin) left = margin
      // If the popup would overflow the right side, shift it left.
      if (left + popWidth > viewportWidth - margin) {
        left = Math.max(margin, viewportWidth - popWidth - margin)
      }
      // Convert absolute viewport left into an offset relative to the button wrapper,
      // which is the popup's positioning context (`absolute`).
      const offsetLeft = left - btnRect.left
      setPopupStyle({
        width: 620,
        left: offsetLeft,
        right: 'auto',
        visibility: 'visible',
      })
    }
    reposition()
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [show])

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
    const days: { date: Date; inMonth: boolean }[] = []
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(viewYear, viewMonth, -i), inMonth: false })
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(viewYear, viewMonth, i), inMonth: true })
    }
    while (days.length % 7 !== 0) {
      const d = new Date(viewYear, viewMonth + 1, days.length - startOffset - lastDay.getDate() + 1)
      days.push({ date: d, inMonth: false })
    }
    return days
  }, [viewYear, viewMonth])

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Clicking a calendar day preserves whatever time is already in that slot,
  // but if no time was chosen yet we default to 00:00 for start and 23:59:59.999
  // for end (unless the end day is today — then we use live-now).
  function handleDayClick(date: Date) {
    if (!picking) {
      const s = startOfDay(date)
      s.setHours(pickStart.getHours(), pickStart.getMinutes(), 0, 0)
      setPickStart(s)
      setPicking(true)
    } else {
      let start = pickStart
      let end = date
      if (end < start) { [start, end] = [end, start] }
      // Preserve the existing end time; if end is today, snap to live-now.
      const today = new Date()
      const endFinal = isSameDay(end, today)
        ? liveEndNow()
        : (() => { const r = endOfDay(end); return r })()
      setPickStart(start)
      setPickEnd(endFinal)
      setPicking(false)
    }
  }

  function inRange(date: Date) {
    const s = startOfDay(pickStart)
    const e = startOfDay(pickEnd)
    const d = startOfDay(date)
    const min = s <= e ? s : e
    const max = s <= e ? e : s
    return d >= min && d <= max
  }

  function isRangeStart(date: Date) { return isSameDay(date, pickStart) }
  function isRangeEnd(date: Date) { return isSameDay(date, pickEnd) }

  const today = new Date()

  // ─── Presets (minute precision) ─────────────────────────────────
  type Preset = { label: string; build: () => { start: Date; end: Date } }
  const presets: Preset[] = [
    {
      label: 'Today',
      // today 00:00 → now minus 1 min (floored)
      build: () => ({ start: startOfDay(new Date()), end: liveEndNow() }),
    },
    {
      label: 'Yesterday',
      build: () => {
        const y = new Date(); y.setDate(y.getDate() - 1)
        return { start: startOfDay(y), end: endOfDay(y) }
      },
    },
    {
      label: 'Last 7 days',
      // 7 days ago 00:00 → live end
      build: () => {
        const s = new Date(); s.setDate(s.getDate() - 6)
        return { start: startOfDay(s), end: liveEndNow() }
      },
    },
    {
      label: 'Last 30 days',
      build: () => {
        const s = new Date(); s.setDate(s.getDate() - 29)
        return { start: startOfDay(s), end: liveEndNow() }
      },
    },
    {
      label: 'This Month',
      build: () => {
        const n = new Date()
        return { start: new Date(n.getFullYear(), n.getMonth(), 1, 0, 0, 0, 0), end: liveEndNow() }
      },
    },
    {
      label: 'Last Month',
      build: () => {
        const n = new Date()
        const s = new Date(n.getFullYear(), n.getMonth() - 1, 1, 0, 0, 0, 0)
        const e = new Date(n.getFullYear(), n.getMonth(), 0, 23, 59, 59, 999)
        return { start: s, end: e }
      },
    },
    {
      label: 'All Time',
      build: () => ({ start: new Date(2020, 0, 1, 0, 0, 0, 0), end: liveEndNow() }),
    },
  ]

  function applyPreset(p: Preset) {
    const { start, end } = p.build()
    setPickStart(start); setPickEnd(end); setPicking(false)
    onApply(p.label, start, end)
    setShow(false)
  }

  function applyCustom() {
    let s = pickStart, e = pickEnd
    if (e < s) { const t = s; s = e; e = t }
    onApply(fmtRangeDisplay(s, e), s, e)
    setShow(false)
  }

  // ─── Styling ────────────────────────────────────────────────────
  const popBg = isLight ? 'bg-white border-black/10 shadow-xl' : 'bg-[#111] border-white/[0.08] shadow-2xl shadow-black/60'
  const textMuted = isLight ? 'text-black/40' : 'text-white/40'
  const textDim = isLight ? 'text-black/20' : 'text-white/20'
  const textPrimary = isLight ? 'text-black/80' : 'text-white/90'
  const divider = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
  const presetBtn = isLight
    ? 'text-black/60 hover:bg-black/[0.05] hover:text-black/90'
    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/90'
  const presetActive = isLight
    ? 'bg-blue-500/10 text-blue-600 font-semibold'
    : 'bg-blue-500/15 text-blue-400 font-semibold'
  const dayBase = isLight
    ? 'hover:bg-black/[0.06] text-black/70'
    : 'hover:bg-white/[0.06] text-white/70'
  const dayOutside = isLight ? 'text-black/15' : 'text-white/15'
  const dayInRange = isLight ? 'bg-blue-500/10' : 'bg-blue-500/10'
  const daySelected = 'bg-blue-500 text-white hover:bg-blue-600'
  const dayToday = isLight ? 'ring-1 ring-blue-400/40' : 'ring-1 ring-blue-400/30'
  const timeInput = isLight
    ? 'bg-white border border-black/10 text-black/80 focus:border-black/30'
    : 'bg-white/[0.05] border border-white/10 text-white/85 focus:border-white/30'
  const primaryBtn = isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        ref={buttonRef}
        onClick={() => setShow(!show)}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all ${
          isLight
            ? 'bg-black/[0.03] border border-black/[0.06] hover:bg-black/[0.06]'
            : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={isLight ? 'text-black/30' : 'text-white/30'}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`text-[13px] font-medium ${isLight ? 'text-black/70' : 'text-white/70'}`}>{dateLabel}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={isLight ? 'text-black/25' : 'text-white/25'}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {show && (
        <div
          ref={popupRef}
          className={`absolute top-full mt-2 z-50 ${popBg} border rounded-2xl overflow-hidden flex`}
          style={popupStyle}
        >
          {/* Presets */}
          <div className={`w-[180px] shrink-0 border-r ${divider} py-3 px-2 flex flex-col gap-0.5`}>
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                  dateLabel === p.label ? presetActive : presetBtn
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendar + datetime inputs */}
          <div className="flex-1 p-5">
            <div className="mb-3">
              <p className={`text-[12px] ${textMuted}`}>Selected range</p>
              <p className={`text-[15px] font-semibold tracking-tight ${textPrimary} mt-0.5`}>
                {fmtRangeDisplay(pickStart, pickEnd)}
              </p>
              {picking && <p className="text-[11px] mt-0.5 text-blue-400">Click an end date</p>}
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-black/[0.05]' : 'hover:bg-white/[0.06]'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={textMuted}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className={`text-[14px] font-semibold ${textPrimary}`}>{monthLabel}</span>
              <button onClick={nextMonth} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-black/[0.05]' : 'hover:bg-white/[0.06]'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={textMuted}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} className={`text-center text-[11px] font-medium py-1 ${textDim}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, inMonth }, i) => {
                const isTodayDay = isSameDay(date, today)
                const selected = isRangeStart(date) || isRangeEnd(date)
                const within = inRange(date) && !selected

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(date)}
                    className={`relative h-9 w-full text-[13px] rounded-lg transition-all ${
                      selected
                        ? daySelected
                        : within
                          ? dayInRange + ' ' + (inMonth ? (isLight ? 'text-black/70' : 'text-white/80') : dayOutside)
                          : inMonth
                            ? dayBase
                            : dayOutside + ' hover:opacity-60'
                    } ${isTodayDay && !selected ? dayToday : ''}`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            {/* datetime-local inputs + apply */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] mb-1 ${textMuted}`}>Start</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(pickStart)}
                  onChange={e => {
                    const d = fromLocalInput(e.target.value)
                    if (d) setPickStart(d)
                  }}
                  className={`w-full ${timeInput} rounded-lg px-2 py-1.5 text-[12px] outline-none`}
                />
              </div>
              <div>
                <label className={`block text-[11px] mb-1 ${textMuted}`}>End</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(pickEnd)}
                  onChange={e => {
                    const d = fromLocalInput(e.target.value)
                    if (d) setPickEnd(d)
                  }}
                  className={`w-full ${timeInput} rounded-lg px-2 py-1.5 text-[12px] outline-none`}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => {
                  const end = liveEndNow()
                  setPickEnd(end)
                }}
                className={`text-[12px] ${textMuted} hover:${textPrimary} transition-colors`}
              >
                Snap end → live now
              </button>
              <button
                onClick={applyCustom}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium ${primaryBtn} transition-colors`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
