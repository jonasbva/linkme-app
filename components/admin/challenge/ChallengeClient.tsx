'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Flag, LockKeyhole, RefreshCw, X } from 'lucide-react'
import { useTheme } from '../ThemeProvider'
import { Card } from '../ui'
import { CHALLENGE, RULES } from '@/lib/challenge/config'
import type { Race, Racer } from '@/lib/challenge/calculate'
import { CONVERSIONS_UPDATED } from '@/lib/conversion-events'
import styles from './challenge.module.css'

const number = (n: number | null, digits = 0) => n === null ? '—' : n.toLocaleString('de-DE', { maximumFractionDigits: digits })
const percent = (n: number | null) => n === null ? '—' : `${number(n, 1)} %`
const dateLabel = (d: string | null) => d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'noch keine Einträge'
const bonus = (r: Racer) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: r.currency, maximumFractionDigits: 0 }).format(r.bonus)

function ChallengeRules() {
  return <>
    <p className={styles.caption}>{CHALLENGE.rulesSource.title} · Stand {dateLabel(CHALLENGE.rulesSource.date)}</p>
    <ol className={styles.rules}>{RULES.map(rule => <li key={rule}>{rule}</li>)}</ol>
  </>
}

function Modal({ title, onClose, children, light }: { title: string; onClose: () => void; children: React.ReactNode; light: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current!
    const previous = document.activeElement as HTMLElement | null
    el.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { el.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return createPortal(<dialog ref={dialog} className={`${styles.dialog} ${styles.page}`} data-light={light} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) onClose() }} aria-labelledby="challenge-detail-title">
    <div className={styles.dialogContent}>
      <header className={styles.dialogHeader}><h2 id="challenge-detail-title">{title}</h2><button autoFocus aria-label="Schließen" className={styles.iconButton} onClick={onClose}><X size={20} /></button></header>
      <div className={styles.dialogBody}>{children}</div>
    </div>
  </dialog>, document.body)
}

function ProgressChart({ racer }: { racer: Racer }) {
  const ceiling = Math.max(racer.target, racer.total ?? 0)
  const x = (day: number) => 12 + day / 30 * 336
  const y = (value: number) => 108 - value / ceiling * 88
  const points = [{ date: CHALLENGE.start, actual: 0, expected: 0 }, ...racer.history]
  // Break the actual series at the first missing day instead of drawing a
  // reassuring flat/interpolated line across unknown observations.
  const actual = points.filter(p => p.actual !== null).map((p, i) => `${x(i)},${y(p.actual!)}`).join(' ')
  return <figure className={styles.chart}>
    <svg viewBox="0 0 360 134" role="img" aria-label={`Verlauf ${racer.name}: durchgezogene Linie erfasste Subs, gestrichelte Linie Soll. Datenlücken werden nicht verbunden.`}>
      <line x1="12" x2="348" y1="108" y2="108" className={styles.chartGrid} />
      <line x1="12" x2="348" y1="64" y2="64" className={styles.chartGrid} />
      <line x1="12" x2="348" y1={y(0)} y2={y(racer.target)} className={styles.chartExpected} />
      {actual && <polyline points={actual} className={styles.chartActual} />}
      <text x="12" y="128">01.11.</text><text x="348" y="128" textAnchor="end">30.11.</text>
    </svg>
    <figcaption><span className={styles.actualKey} />Ist <span className={styles.expectedKey} />Soll</figcaption>
  </figure>
}

function RacerDetails({ racer: r, race }: { racer: Racer; race: Race }) {
  return <>
    <section className={styles.section}>
      <div className={styles.detailEyebrow}>Persönlicher Stand · {r.rank === null ? 'ohne Rang' : `Rang ${r.rank}`}{race.provisional && ' · vorläufig'}</div>
      <div className={styles.detailPercent}>{percent(r.percent)}</div>
      <p className={styles.subtotal}>{number(r.total)} <span>/ {number(r.target)} neue Subs</span></p>
      <dl className={styles.facts}>
        <div><dt>Noch bis zum Ziel</dt><dd>{number(r.remaining)} Subs</dd></div>
        <div><dt>Bonus</dt><dd>{bonus(r)}</dd></div>
        <div><dt>Zielstatus</dt><dd>{r.reached ? 'Ziel erreicht' : r.total === null ? 'Noch nicht auswertbar' : 'Ziel noch offen'}</dd></div>
      </dl>
      {r.reached && <p className={styles.note}>Das persönliche Gesamtziel für den Bonus ist erreicht{!r.complete ? ' · erfasster Zwischenstand mit Datenlücken' : ''}.</p>}
    </section>
    <section className={styles.section}>
      <h3>Tempo & Entwicklung</h3>
      <p className={styles.caption}>01.11. bis {race.asOf ? dateLabel(race.asOf) : 'zum ersten Datenstand'} · {race.elapsedDays} von 30 Tagen</p>
      <dl className={styles.facts}>
        <div><dt>Soll zum Stichtag</dt><dd>{number(r.expected)} Subs</dd></div>
        <div><dt>Abweichung vom Soll</dt><dd>{r.delta === null ? '—' : `${r.delta > 0 ? '+' : r.delta < 0 ? '−' : ''}${number(Math.abs(r.delta))} Subs`}{!r.complete && r.delta !== null && ' *'}</dd></div>
        <div><dt>Bisher pro Tag</dt><dd>{number(r.dailyAverage, 1)}</dd></div>
        <div><dt>Benötigt pro restlichem Tag</dt><dd>{race.remainingDays === 0 ? r.reached ? 'Ziel erreicht' : 'Zeitraum beendet' : number(r.requiredDaily)}</dd></div>
      </dl>
      {!r.complete && <p className={styles.note}>Unvollständige Daten: Ist und Abweichung zeigen nur erfasste Werte. Kein verlässlicher Tagesdurchschnitt oder benötigtes Tempo.</p>}
      <ProgressChart racer={r} />
    </section>
    <section className={styles.section}>
      <h3>Creator-Aufteilung</h3>
      <div className={styles.tableWrap}><table><thead><tr><th>Creator</th><th>Neue Subs</th><th>{r.name === 'Jolena' ? 'Mindestziel' : 'Orientierungsziel'}</th><th>Stand</th></tr></thead>
        <tbody>{r.breakdown.map(c => <tr key={c.id}><th scope="row">{c.name}{(!c.access || !c.exists || c.missingDates.length > 0 || c.invalidDates.length > 0) && <span className={styles.asterisk}> *</span>}</th><td>{number(c.total)}</td><td>{number(c.target)}</td><td>{percent(c.percent)}</td></tr>)}</tbody></table></div>
      {r.breakdown.some(c => !c.access) && <p className={styles.note}>Gesamtstände und Ränge sind für alle Challenge-Teilnehmer sichtbar. Creator-Einzeldaten bleiben auf deine Zugriffsrechte beschränkt.</p>}
      <p className={styles.caption}>{r.name === 'Jolena' ? 'Beide Creator-Mindestziele werden getrennt ausgewiesen. Eine zusätzliche Bonus-Sperrregel ist nicht bestätigt.' : 'Creator-Ziele dienen zur Orientierung. Maßgeblich ist das persönliche Gesamtziel.'}</p>
    </section>
  </>
}

export default function ChallengeClient() {
  const { resolved } = useTheme()
  const [data, setData] = useState<{ race: Race; currentUserId: string; today: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cutoff, setCutoff] = useState('')
  const [selection, setSelection] = useState<string | null>(null)
  const requestId = useRef(0)
  const controller = useRef<AbortController | null>(null)
  const refresh = useCallback(async () => {
    const id = ++requestId.current
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/challenge${cutoff ? `?asOf=${cutoff}` : ''}`, { cache: 'no-store', signal: abort.signal })
      if (!res.ok) {
        if (id === requestId.current && (res.status === 401 || res.status === 403)) {
          setData(null)
          setSelection(null)
        }
        throw new Error(res.status === 401 ? 'Sitzung abgelaufen. Bitte erneut anmelden.' : res.status === 403 ? 'Kein Zugriff auf die Challenge.' : 'Daten konnten nicht aktualisiert werden.')
      }
      const next = await res.json()
      if (id === requestId.current) { setData(next); setError(null) }
    } catch (e) {
      if (id === requestId.current && !abort.signal.aborted) setError(e instanceof Error ? e.message : 'Verbindung fehlgeschlagen.')
    } finally { if (id === requestId.current) setBusy(false) }
  }, [cutoff])
  useEffect(() => {
    refresh()
    const update = () => { if (document.visibilityState === 'visible') refresh() }
    const storage = (e: StorageEvent) => { if (e.key === CONVERSIONS_UPDATED) update() }
    const interval = window.setInterval(update, 30000)
    window.addEventListener(CONVERSIONS_UPDATED, update)
    window.addEventListener('storage', storage)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      controller.current?.abort(); clearInterval(interval)
      window.removeEventListener(CONVERSIONS_UPDATED, update); window.removeEventListener('storage', storage)
      window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update)
    }
  }, [refresh])
  const race = data?.race
  const selected = race?.racers.find(r => r.id === selection)
  const light = resolved === 'light'
  return <div className={`${styles.page} challenge-page`} data-light={light}>
    <header className={styles.header}>
      <div><div className={styles.eyebrow}>MAHO · Team Challenge</div><h1>November Challenge</h1><p className={styles.caption}>01.–30.11.2026 <span>·</span> Daten bis {race ? dateLabel(race.latestDate) : '…'}</p></div>
      <button className={styles.secondary} onClick={() => setSelection('rules')}>Regeln</button>
    </header>
    <div className={styles.toolbar}>
      <div className={styles.raceStatus} aria-live="polite">{race ? race.latestDate === null ? 'Noch keine Daten' : race.provisional ? 'Vorläufiger Stand' : race.elapsedDays === 30 ? 'Endstand' : 'Zwischenstand' : 'Rennen wird geladen…'}{race?.restricted && ' · eingeschränkte Sicht'}</div>
      <div className={styles.tools}>
        <select aria-label="Berichtszeitraum" value={cutoff} onChange={e => setCutoff(e.target.value)}>
          <option value="">Aktuell</option>{CHALLENGE.reports.map(report => <option key={report.cutoff} value={report.cutoff} disabled={!data || report.cutoff > data.today}>{report.label}</option>)}
        </select>
        <button className={styles.iconButton} disabled={busy} onClick={refresh} aria-label="Daten aktualisieren"><RefreshCw size={15} className={busy ? styles.refreshing : undefined} /></button>
      </div>
    </div>
    {error && <div className={styles.error} role="alert">{error} {data && 'Die angezeigten Daten wurden nicht aktualisiert.'} <button onClick={refresh}>Erneut versuchen</button></div>}
    {race ? <>
      {!race.latestDate && <p className={styles.empty}>Für diesen Zeitraum sind noch keine neuen Subs erfasst. <Link href="/admin/conversions">Tägliche Einträge öffnen</Link></p>}
      <Card className={styles.race}>
        <div aria-label="Challenge nach prozentualer Zielerreichung">
        <div className={styles.trackHeader}><span>Rang / Team</span><div className={styles.axis}><span style={{ left: '0%' }}>0 %</span><span style={{ left: `${50 / race.scaleMax * 100}%` }}>50 %</span><span style={{ left: `${100 / race.scaleMax * 100}%` }}>100 %</span>{race.scaleMax > 100 && <span className={styles.extendedAxis} style={{ left: '100%' }}>{race.scaleMax} %</span>}</div></div>
        <div className={styles.lanes}>
          <div className={styles.guides} aria-hidden="true"><div className={styles.guideInner}><div className={styles.start} /><div className={styles.finish} style={{ left: `${100 / race.scaleMax * 100}%` }} /><div className={styles.pace} style={{ left: `${race.expectedPercent / race.scaleMax * 100}%` }} /></div></div>
          {race.racers.map(r => <button key={r.id} className={`${styles.lane} ${data.currentUserId === r.id ? styles.ownLane : ''}`} onClick={() => setSelection(r.id)} aria-haspopup="dialog" aria-label={`${r.name}${data.currentUserId === r.id ? ', deine Bahn' : ''}, ${r.rank === null ? 'ohne Rang' : `Rang ${r.rank}`}, ${r.percent === null ? 'keine auswertbaren Daten' : percent(r.percent)}${r.reached ? ', Ziel erreicht' : ''}`}>
            <span className={styles.identity}><span className={styles.rank}>{r.rank ?? '—'}</span><span className={styles.name}>{r.name}{data.currentUserId === r.id && <small>Du</small>}{r.reached && <small>Ziel erreicht</small>}</span></span>
            <span className={styles.track}><span className={styles.progressRail} /><span className={styles.progressFill} style={{ width: `${(r.percent ?? 0) / race.scaleMax * 100}%` }} /><span className={styles.progressEndpoint} style={{ left: `${(r.percent ?? 0) / race.scaleMax * 100}%` }}><span className={styles.progressLabel}>{r.restricted && <LockKeyhole size={11} />}{percent(r.percent)}</span></span></span>
          </button>)}
        </div>
        </div>
      </Card>
      <footer className={styles.footer}><div className={styles.legend}><span><i className={styles.finishKey} />100 % des Monatsziels</span><span><i className={styles.paceKey} />Soll {percent(race.expectedPercent)}{race.asOf && ` · ${dateLabel(race.asOf).slice(0, 6)}`}</span></div><Link href="/admin/conversions"><Flag size={13} />Expectations / Einträge</Link></footer>
    </> : !error && <div className={styles.loading} role="status"><div />Sechs Bahnen werden vorbereitet…</div>}
    {selection === 'rules' && <Modal title="Challenge-Regeln" light={light} onClose={() => setSelection(null)}><ChallengeRules /></Modal>}
    {selected && race && <Modal title={selected.name} light={light} onClose={() => setSelection(null)}><RacerDetails racer={selected} race={race} /></Modal>}
  </div>
}
