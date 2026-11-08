// Verified against MAHO's creators/admin_users on 2026-11-08. UUIDs, never
// mutable display names or active flags, bind this historical competition.
export interface ChallengeCreator { id: string; name: string; target: number; minimum?: boolean }
export interface Participant {
  id: string; name: string; target: number; bonus: number; currency: 'EUR' | 'USD'
  baseline: number; basis: string; provisional?: boolean; creators: ChallengeCreator[]
}
export const CHALLENGE = {
  id: 'november-2026', title: 'November Challenge', start: '2026-11-01', end: '2026-11-30',
  days: 30, timeZone: 'Europe/Berlin',
  rulesSource: { title: 'November-Challenge 2026 – Neue Subs', date: '2026-11-05' },
  reports: [
    { date: '2026-11-09', cutoff: '2026-11-08', label: '09.11. · Stand 08.11.' },
    { date: '2026-11-16', cutoff: '2026-11-15', label: '16.11. · Stand 15.11.' },
    { date: '2026-11-23', cutoff: '2026-11-22', label: '23.11. · Stand 22.11.' },
    { date: '2026-12-01', cutoff: '2026-11-30', label: '01.12. · Fazit 30.11.' },
  ],
} as const
export const PARTICIPANTS: Participant[] = [
  { id: 'e619be3e-2f1a-42bc-a029-d213482c247f', name: 'Felix', target: 21802, bonus: 250, currency: 'EUR', baseline: 18168, provisional: true,
    basis: 'Ca. 18.168 neue Subs im Oktober, ca. +20 %. Basis und Monatsziel sind vorläufig: Maxes’ Oktoberwert wurde geschätzt. Rechenwert bleibt 21.802.',
    creators: [
      { id: '26750d15-73d0-4336-b56f-7f7b01f77bb5', name: 'Amber', target: 6682 },
      { id: '62c31190-a8d5-4daf-8464-4cc08a9acb19', name: 'Sophia', target: 5897 },
      { id: 'b8850bfc-7583-4ca9-ae1f-2533b7605056', name: 'Maxes', target: 7180 },
      { id: 'fe9429b7-aa2e-4ff7-a6cb-4562a94a69cb', name: 'Anna', target: 2044 },
    ] },
  { id: '59dab071-8685-4b8f-ad1e-0195fbf3a1b2', name: 'Tom', target: 12265, bonus: 250, currency: 'EUR', baseline: 9434,
    basis: '9.434 neue Subs im Oktober, ca. +30 %.', creators: [
      { id: 'ceef18c2-97b9-4d9b-b311-9957d699f90c', name: 'Hailey', target: 8135 },
      { id: 'e18c08da-8925-42db-834e-1fd8d0ee0467', name: 'Daisy', target: 3809 },
      { id: 'e3afdb3a-8547-4c54-a83c-8f18386a015d', name: 'Emma', target: 322 },
    ] },
  { id: 'cadead42-1762-44f5-b3fb-e2119b1cff64', name: 'Jano', target: 12177, bonus: 250, currency: 'EUR', baseline: 10147,
    basis: '10.147 neue Subs im Oktober, ca. +20 %.', creators: [
      { id: '82f93dd7-ae62-472a-8408-cf97baa769ae', name: 'Chloe', target: 6326 },
      { id: 'aed89dd5-bdc3-498b-ac3f-6bcedc2eea6b', name: 'Alice', target: 3712 },
      { id: '002c91dc-db52-4b68-9940-1f8f1b9c1f60', name: 'Mila', target: 2140 },
    ] },
  { id: 'e60f3529-eb53-4635-aa75-4ed1db089c4f', name: 'Luka', target: 11214, bonus: 250, currency: 'EUR', baseline: 9345,
    basis: '9.345 neue Subs im Oktober, ca. +20 %.', creators: [
      { id: '845047d1-7708-4a23-b47e-142219502964', name: 'Lily Brown', target: 5718 },
      { id: '137283ec-fb49-445f-80f5-79a3129e62f8', name: 'Jessy', target: 2987 },
      { id: '067d31ec-e949-452f-bda7-ea6c09abb61f', name: 'Celine', target: 2510 },
    ] },
  { id: '4e4276a5-fea4-4fb7-bf48-2b8fc872860f', name: 'Devyn', target: 2986, bonus: 250, currency: 'USD', baseline: 2488,
    basis: '2.488 neue Subs im Oktober, ca. +20 %.', creators: [
      { id: '19ce540d-bd59-4294-abc9-41362d12152c', name: 'Jade', target: 2986 },
    ] },
  { id: 'db14f0a2-9336-4ffd-9ded-7a7b1d5c23bd', name: 'Jolena', target: 7500, bonus: 250, currency: 'USD', baseline: 5092,
    basis: 'Ca. 5.092 als Hochrechnung aus 28.10.–03.11., kein regulärer Oktoberwert. November-Gesamtziel: 250 neue Subs pro Tag × 30. Die Unterlagen definieren keine zusätzliche Bonus-Sperrregel für die Creator-Mindestziele.',
    creators: [
      { id: 'f3e9f10d-58d6-44a1-bd69-e0fd82fbad8e', name: 'Sasha', target: 5182, minimum: true },
      { id: 'cce0982c-07e4-4ab0-850d-8c0d56e353d7', name: 'Jenna', target: 1438, minimum: true },
    ] },
]
export const RULES = [
  'Bonus: Wer sein individuelles Ziel an neuen Subs im November erreicht, bekommt 250 € (Devyn und Jolena: 250 $).',
  'Gewinner: Jeder, der sein Ziel erreicht, gewinnt die Challenge – das gilt für das gesamte Team. Der Overall-Gewinner (höchste Zielerreichung in %) bekommt zusätzlich ein Geschenk und eine Siegerehrung. Das Geschenk wird angekündigt, bleibt aber geheim.',
  'Ziele: +20 % auf die Oktober-Subs; bei Tom +30 %, da sein Oktober deutlich unter seinem Niveau lag (Ziel bleibt 8 % unter September). Jolena (Full AI: Sasha + Jenna): 250 neue Subs/Tag gesamt = 7.500 im November (≈ +47 % auf das aktuelle Niveau); zusätzlich Mindestziele je Creator (+30 % auf das aktuelle Niveau), damit kein Creator vernachlässigt wird.',
  'Account-Bans: Gebannte Accounts zählen voll mit – die Account-Sicherheit liegt in der Mitverantwortung jedes Mitarbeiters.',
  'Zwischenstand: Jeder Mitarbeiter gibt seinen Stand (Subs bisher, Soll, Abweichung) jeden Montag mit dem Wochenbericht ab: 09.11., 16.11., 23.11. – Fazit am 01.12. Daraus wird jeweils das Zwischen-Ranking (Platz 1–6) erstellt.',
]
