import { describe, it, expect } from 'vitest'
import { matchScore, suggestAccountForLink } from '@/lib/infloww'

// The team names Infloww links by hand — "IG sophiaawesst 11.10". Matching that
// back to an IG account is a suggestion, never a silent decision, so the tests
// pin down both what must match and what must NOT.

describe('matchScore', () => {
  it('matches the handle in the usual "PLATFORM handle date" shape', () => {
    expect(matchScore('IG sophiaawesst 11.10', 'sophiaawesst')).toBe(100)
    expect(matchScore('FB jennasmomdiary 14.10', 'jennasmomdiary')).toBe(100)
    expect(matchScore('IG onlychloemiller 19.10', 'onlychloemiller')).toBe(100)
  })

  it('still matches when punctuation is dropped, but ranks it lower', () => {
    expect(matchScore('IG its.sophiawest 03.10', 'its.sophiawest')).toBe(100)
    expect(matchScore('IG itssophiawest 03.10', 'its.sophiawest')).toBe(90)
    expect(matchScore('IG its_sophia_west', 'its.sophiawest')).toBe(90)
  })

  it('keeps two handles that differ only by a dot apart', () => {
    // Sophia runs both of these; they are different Instagram accounts.
    expect(matchScore('sophiaa.wesst IG', 'sophiaa.wesst')).toBe(100)
    expect(matchScore('sophiaa.wesst IG', 'sophiaawesst')).toBe(90)
    expect(matchScore('IG sophiaawesst 11.10', 'sophiaawesst')).toBe(100)
    expect(matchScore('IG sophiaawesst 11.10', 'sophiaa.wesst')).toBe(90)
    // The exact spelling must outrank the punctuation-stripped one.
    expect(matchScore('IG sophiaawesst 11.10', 'sophiaawesst'))
      .toBeGreaterThan(matchScore('sophiaa.wesst IG', 'sophiaawesst'))
  })

  it('does not treat the date as a handle', () => {
    expect(matchScore('IG sophiaawesst 11.10', '11.10')).toBe(0)
    expect(matchScore('IG sophiaawesst 2025-10-11', '20251011')).toBe(0)
  })

  it('does not match a different account of the same creator', () => {
    expect(matchScore('IG sophiaawesst 11.10', 'sophialateagain')).toBe(0)
    expect(matchScore('IG jessysranch 01.09', 'jessyoutwest')).toBe(0)
  })

  it('scores a near-miss below an exact hit', () => {
    const partial = matchScore('IG sophiaawesst2 11.10', 'sophiaawesst')
    expect(partial).toBe(75)
    expect(partial).toBeLessThan(matchScore('IG sophiaawesst 11.10', 'sophiaawesst'))
  })

  it('does not let the creator name claim every one of her accounts', () => {
    // Real link names from Infloww that carry no handle at all.
    expect(matchScore('Sophia Tiktok', 'sophiaawesst')).toBe(0)
    expect(matchScore('Sophia Facebook 2', 'sophiaawesst')).toBe(0)
    expect(matchScore('Sophia Tiktok', 'sophialateagain')).toBe(0)
    // A substring far shorter than the handle is not evidence.
    expect(matchScore('IG lilybrownsdiary 02.10', 'lilybrowns')).toBe(0)
  })

  it('returns 0 for the placeholder names left in Infloww', () => {
    expect(matchScore('IG "account name" "Datum"', 'lilybrownsdiary')).toBe(0)
    expect(matchScore('IG', 'lilybrownsdiary')).toBe(0)
    expect(matchScore('', 'lilybrownsdiary')).toBe(0)
  })

  it('never matches an empty username', () => {
    expect(matchScore('IG sophiaawesst 11.10', '')).toBe(0)
  })
})

describe('suggestAccountForLink', () => {
  const accounts = [
    { id: 'a1', username: 'sophiaawesst' },
    { id: 'a2', username: 'its.sophiawest' },
    { id: 'a3', username: 'sophialateagain' },
  ]

  it('picks the exact account', () => {
    expect(suggestAccountForLink('IG sophiaawesst 11.10', accounts)?.account.id).toBe('a1')
    expect(suggestAccountForLink('IG its.sophiawest 03.10', accounts)?.account.id).toBe('a2')
  })

  it('prefers the exactly-spelled handle over its dotted twin', () => {
    const twins = [
      { id: 'dotted', username: 'sophiaa.wesst' },
      { id: 'plain', username: 'sophiaawesst' },
    ]
    expect(suggestAccountForLink('IG sophiaawesst 11.10', twins)?.account.id).toBe('plain')
    expect(suggestAccountForLink('sophiaa.wesst IG', twins)?.account.id).toBe('dotted')
  })

  it('returns null when nothing clears the floor', () => {
    expect(suggestAccountForLink('IG "account name" "Datum"', accounts)).toBeNull()
    expect(suggestAccountForLink('FB someoneelse 01.01', accounts)).toBeNull()
  })

  it('prefers the exact match over a merely contained one', () => {
    const withPrefix = [...accounts, { id: 'a4', username: 'sophiaawesstbackup' }]
    expect(suggestAccountForLink('IG sophiaawesst 11.10', withPrefix)?.account.id).toBe('a1')
  })
})
