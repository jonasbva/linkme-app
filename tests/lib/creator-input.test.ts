import { describe, expect, it } from 'vitest'
import { parseNewCreator } from '@/lib/creator-input'

describe('parseNewCreator', () => {
  it('allows name-only creation and derives a public slug from the name', () => {
    expect(parseNewCreator({ display_name: ' Fernanda Silva ' })).toEqual({
      ok: true,
      data: { display_name: 'Fernanda Silva', slug: 'fernanda-silva', of_handle: null, is_active: true },
    })
  })

  it.each(['', '   ', null, undefined])('treats an omitted or blank handle as optional: %j', (of_handle) => {
    expect(parseNewCreator({ display_name: 'Fernanda', of_handle })).toEqual({
      ok: true,
      data: { display_name: 'Fernanda', slug: 'fernanda', of_handle: null, is_active: true },
    })
  })

  it.each([
    '@Fernanda.Real_2', ' Fernanda.Real_2 ', 'onlyfans.com/Fernanda.Real_2',
    'https://www.onlyfans.com/Fernanda.Real_2/',
  ])('normalizes a handle or OnlyFans profile URL: %s', (of_handle) => {
    expect(parseNewCreator({ display_name: 'Fernanda', of_handle })).toEqual({
      ok: true,
      data: { display_name: 'Fernanda', slug: 'fernanda.real_2', of_handle: 'fernanda.real_2', is_active: true },
    })
  })

  it('whitelists supported fields and preserves an explicit inactive state', () => {
    expect(parseNewCreator({
      display_name: 'Fernanda', of_handle: '@Fernanda', is_active: false,
      id: 'chosen-id', slug: 'different-slug', is_super_admin: true,
    })).toEqual({
      ok: true,
      data: { display_name: 'Fernanda', slug: 'fernanda', of_handle: 'fernanda', is_active: false },
    })
  })

  it.each([
    null, [], 'Fernanda', {}, { display_name: '' }, { display_name: '   ' }, { display_name: 123 },
    { display_name: '你好' },
    { display_name: 'Fernanda', is_active: 'false' },
    { display_name: 'Fernanda', is_active: 0 },
    { display_name: 'Fernanda', of_handle: 123 },
    { display_name: 'Fernanda', of_handle: { handle: 'fernanda' } },
  ])('rejects invalid creator fields: %j', (input) => {
    expect(parseNewCreator(input)).toEqual({ ok: false, error: expect.any(String) })
  })

  it.each([
    'fern anda', 'fernanda!', '@', 'https://example.com/fernanda',
    'https://onlyfans.com.example.com/fernanda', 'https://onlyfans.com/fernanda/posts',
    'onlyfans.com/fernanda/posts', 'https://onlyfans.com/',
  ])('rejects malformed handles and non-profile URLs: %s', (of_handle) => {
    expect(parseNewCreator({ display_name: 'Fernanda', of_handle })).toEqual({
      ok: false, error: expect.any(String),
    })
  })

  it('allows a non-ASCII creator name when a valid handle supplies the slug', () => {
    expect(parseNewCreator({ display_name: '你好', of_handle: 'fernanda' })).toEqual({
      ok: true,
      data: { display_name: '你好', slug: 'fernanda', of_handle: 'fernanda', is_active: true },
    })
  })
})
