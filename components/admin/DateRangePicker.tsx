'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

interface DateRangePickerProps {
  dateStart: Date
  dateEnd: Date
  dateLabel: string
  onApply: (label: string, start: Date, end: Date) => void
  isLight: boolean
}

function fmt(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function fmtFull(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
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

export default function DateRangePicker({ dateStart, dateEnd, dateLabel, onApply, isLight }: DateRangePickerProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Calendar state
  const [viewYear, setViewYear] = useState(dateEnd.getFullYear())
  const [viewMonth, setViewMonth] = useState(dateEnd.getMonth())

  // Selection state for click-to-pick range
  const [pickStart, setPickStart] = useState<Date | null>(null)
  const [pickEnd, setPickEnd] = useState<Date | null>(null)
  const [picking, setPicking] = useState(false) // true = waiting for second click

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync calendar view when opening
  useEffect(() => {
    if (show) {
      setViewYear(dateEnd.getFullYear())
      setViewMonth(dateEnd.getMonth())
      setPickStart(dateStart)
      setPickEnd(dateEnd)
      setPicking(false)
    }
  }, [show])

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
    const days: { date: Date; inMonth: boolean }[] = []

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth, -i)
      days.push({ date: d, inMonth: false })
    }
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(viewYear, viewMonth, i), inMonth: true })
    }
    // Next month padding to fill grid
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

  function handleDayClick(date: Date) {
    if (!picking) {
      // First click — set start
      setPickStart(date)
      setPickEnd(null)
      setPicking(true)
    } else {
      // Second click — set end and apply
      let start = pickStart!
      let end = date
      if (end < start) [start, end] = [end, start]
      const label = isSameDay(start, end)
        ? fmt(start)
        : `${fmtFull(start)} - ${fmtFull(end)}`
      setPickStart(start)
      setPickEnd(end)
      setPicking(false)
      onApply(label, startOfDay(start), endOfDay(end))
      setShow(false)
    }
  }

  function isInRange(date: Date) {
    if (!pickStart) return false
    if (!pickEnd && !picking) return false
    const s = pickStart
    const e = pickEnd || pickStart
    const min = s < e ? s : e
    const max = s < e ? e : s
    return date >= startOfDay(min) && date <= endOfDay(max)
  }

  function isRangeStart(date: Date) {
    return pickStart ? isSameDay(date, pickStart) : false
  }

  function isRangeEnd(date: Date) {
    return pickEnd ? isSameDay(date, pickEnd) : false
  }

  const today = new Date()

  // Presets
  function applyPreset(label: string, start: Date, end: Date) {
    onApply(label, start, end)
    setPickStart(start)
    setPickEnd(end)
    setPicking(false)
    setShow(false)
  }

  const presets = [
    { label: 'Today', fn: () => { const s = startOfDay(new Date()); applyPreset('Today', s, new Date()) } },
    { label: 'Yesterday', fn: () => { const s = new Date(); s.setDate(s.getDate() - 1); applyPreset('Yesterday', startOfDay(s), endOfDay(s)) } },
    { label: 'This Week', fn: () => { const s = new Date(); const day = s.getDay(); const diff = day === 0 ? 6 : day - 1; s.setDate(s.getDate() - diff); applyPreset('This Week', startOfDay(s), new Date()) } },
    { label: 'Last Week', fn: () => { const s = new Date(); const day = s.getDay(); const diff = day === 0 ? 6 : day - 1; s.setDate(s.getDate() - diff - 7); const e = new Date(s); e.setDate(e.getDate() + 6); applyPreset('Last Week', startOfDay(s), endOfDay(e)) } },
    { label: 'This Month', fn: () => { const n = new Date(); const s = new Date(n.getFullYear(), n.getMonth(), 1); applyPreset('This Month', s, new Date()) } },
    { label: 'Last Month', fn: () => { const n = new Date(); const s = new Date(n.getFullYear(), n.getMonth() - 1, 1); const e = new Date(n.getFullYear(), n.getMonth(), 0, 23, 59, 59); applyPreset('Last Month', s, e) } },
    { label: 'This Year', fn: () => { const s = new Date(new Date().getFullYear(), 0, 1); applyPreset('This Year', s, new Date()) } },
    { label: 'Last Year', fn: () => { const y = new Date().getFullYear() - 1; applyPreset('Last Year', new Date(y, 0, 1), new Date(y, 11, 31, 23, 59, 59)) } },
    { label: 'All Time', fn: () => { applyPreset('All Time', new Date(2020, 0, 1), new Date()) } },
  ]

  // Display strings for header
  const displayRange = pickStart && pickEnd
    ? isSameDay(pickStart, pickEnd) ? fmt(pickStart) : `${fmt(pickStart)} - ${fmt(pickEnd)}`
    : pickStart ? fmt(pickStart) : dateLabel

  // Styling
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

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger button */}
      <button
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

      {/* Dropdown */}
      {show && (
        <div className={`absolute right-0 top-full mt-2 z-50 ${popBg} border rounded-2xl overflow-hidden flex`} style={{ width: 560 }}>
          {/* Left: Presets */}
          <div className={`w-[180px] shrink-0 border-r ${divider} py-3 px-2 flex flex-col gap-0.5`}>
            {presets.map(p => (
              <button
                key={p.label}
                onClick={p.fn}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                  dateLabel === p.label ? presetActive : presetBtn
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Right: Calendar */}
          <div className="flex-1 p-5">
            {/* Header: selected range display */}
            <div className="mb-4">
              <p className={`text-[12px] ${textMuted}`}>Select date range</p>
              <p className={`text-[20px] font-bold tracking-tight ${textPrimary}`}>
                {displayRange}
              </p>
              {picking && (
                <p className={`text-[11px] mt-0.5 text-blue-400`}>Click an end date</p>
              )}
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

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} className={`text-center text-[11px] font-medium py-1 ${textDim}`}>{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, inMonth }, i) => {
                const isToday = isSameDay(date, today)
                const selected = isRangeStart(date) || isRangeEnd(date)
                const inRange = isInRange(date) && !selected

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(date)}
                    className={`relative h-9 w-full text-[13px] rounded-lg transition-all ${
                      selected
                        ? daySelected
                        : inRange
                          ? dayInRange + ' ' + (inMonth ? (isLight ? 'text-black/70' : 'text-white/80') : dayOutside)
                          : inMonth
                            ? dayBase
                            : dayOutside + ' hover:opacity-60'
                    } ${isToday && !selected ? dayToday : ''}`}
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
