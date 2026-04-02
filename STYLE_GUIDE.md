# LinkMe Admin Dashboard — Style Guide

## Theme System

The app uses a ThemeProvider with light/dark mode support. Always use the `useTheme()` hook:

```tsx
import { useTheme } from './ThemeProvider'

const { resolved } = useTheme()
const isLight = resolved === 'light'
```

All colors must be conditional on `isLight`. Never hardcode dark-only or light-only colors.

## Color Tokens

### Text Hierarchy

| Token | Light Mode           | Dark Mode            | Usage                        |
|-------|----------------------|----------------------|------------------------------|
| text1 | `text-black/90`      | `text-white/90`      | Primary text, headings       |
| text2 | `text-black/50`      | `text-white/50`      | Secondary text, descriptions |
| text3 | `text-black/30`      | `text-white/30`      | Tertiary text, labels        |

### Backgrounds & Cards

| Element    | Light Mode                              | Dark Mode                               |
|------------|-----------------------------------------|-----------------------------------------|
| Card       | `bg-black/[0.03] border border-black/[0.06]` | `bg-white/[0.04] border border-white/[0.06]` |
| Card hover | `hover:bg-black/[0.02]`                | `hover:bg-white/[0.03]`                |
| Subtle bg  | `bg-black/[0.06]`                      | `bg-white/[0.08]`                      |

### Input Fields

```tsx
const inputCls = isLight
  ? 'bg-white border border-black/10 text-black/80 placeholder:text-black/25 focus:border-black/30'
  : 'bg-white/[0.05] border border-white/10 text-white/90 placeholder:text-white/20 focus:border-white/30'
```

### Select Fields

```tsx
const selectCls = isLight
  ? 'bg-white border border-black/10 text-black/80'
  : 'bg-white/[0.05] border border-white/10 text-white/90'
```

### Table Borders

```tsx
const tableBorder = isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
const tableRowHover = isLight ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.03]'
```

## Navigation & Tabs

Active tab:
```
isLight ? 'text-black/90 bg-black/[0.06]' : 'text-white/95 bg-white/[0.08]'
```

Inactive tab:
```
isLight ? 'text-black/40 hover:text-black/70 hover:bg-black/[0.03]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
```

Font: `text-[13px] font-medium`
Corner radius: `rounded-lg`

## Buttons

### Primary (Save / Apply)

```tsx
isLight ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'
```
Size: `px-5 py-2 text-[13px] font-medium rounded-lg`

### Secondary (Ghost)

```tsx
isLight ? 'bg-black/[0.06] hover:bg-black/[0.10] text-black/80' : 'bg-white/[0.08] hover:bg-white/[0.12] text-white/90'
```

### Small Pill (Date picker, quick select)

Active: `bg-white text-black` (dark) / `bg-black text-white` (light)
Inactive: `bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60`

## Charts

### Colors (consistent across all pages)

| Data Type     | Color     | Hex       |
|---------------|-----------|-----------|
| Revenue       | Blue      | `#3b82f6` |
| Subscriptions | Purple    | `#a855f7` |
| Tips          | Teal      | `#14b8a6` |
| Danger/Red    | Rose      | `#f43f5e` |

### Line Charts

- Stroke width: `2.5`
- Add gradient fill below line: `opacity 0.15 → 0`
- Grid lines: dashed, `strokeDasharray="4"`
- Grid color: `isLight ? '#e5e7eb' : '#1f2937'`
- Label color: `#6b7280` (both themes)

## Toast Notifications

Position: `fixed bottom-8 right-8 z-[100]`
Style: `backdrop-blur-xl rounded-xl shadow-lg`

| Type    | Background           |
|---------|----------------------|
| Success | `bg-emerald-500/90`  |
| Error   | `bg-red-500/90`      |
| Info    | `bg-white/10 border border-white/10` |

Auto-dismiss: 5 seconds
Include: icon + message + close button

## Date Picker

Matches the Link Analysis popup pattern:

- Trigger: Calendar icon + label + chevron in a bordered pill
- Popup: `rounded-2xl` with 3 sections separated by `border-b`
- Sections: Quick Select (4 presets), By Month (4×3 grid), Custom Range (From/To + Apply)
- Labels: `text-[11px] uppercase tracking-widest font-medium` with text3 color

## Progress Bar

Used during long API fetches:

- Container: `w-80 h-2 rounded-full` with card background color
- Fill: `bg-blue-500` with `transition-all duration-300`
- Message below: text2 color, `text-sm`
- Percentage below: text3 color, `text-xs`

## Typography Scale

| Size     | Usage                        |
|----------|------------------------------|
| `text-3xl font-bold` | Hero stats           |
| `text-2xl font-bold` | Page headings        |
| `text-lg font-bold`  | Section headings     |
| `text-lg font-semibold` | Stat labels       |
| `text-[13px] font-medium` | Nav, buttons, tabs |
| `text-sm`            | Body text, descriptions |
| `text-xs`            | Labels, captions     |
| `text-[11px]`        | Micro labels (date picker) |
| `text-[10px]`        | Tiny labels          |

## Spacing

- Page padding: `px-6 py-8`
- Max width: `max-w-7xl mx-auto`
- Card padding: `p-4` to `p-6`
- Grid gaps: `gap-4` (cards), `gap-1` (tabs), `gap-1.5` (pill buttons)
- Section margin: `mb-6` to `mb-10`

## Avatar Pattern

```tsx
{avatarUrl
  ? <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
  : <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
      isLight ? 'bg-black/[0.06] text-black/40' : 'bg-white/[0.08] text-white/50'
    }`}>{name.charAt(0)}</div>}
```

## Status Colors (Performance %)

```tsx
const pctColor = (pct: number | null, isLight: boolean) => {
  if (pct === null) return ''
  if (pct >= 10) return isLight ? 'bg-green-100 text-green-800' : 'bg-green-900/40 text-green-300'
  if (pct >= 0) return isLight ? 'bg-green-50 text-green-700' : 'bg-green-900/20 text-green-400'
  if (pct >= -20) return isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-300'
  return isLight ? 'bg-red-100 text-red-800' : 'bg-red-900/40 text-red-400'
}
```

## Warning / Info Banners

```tsx
// Warning (amber)
isLight ? 'bg-amber-50 border border-amber-200' : 'bg-yellow-900/15 border border-yellow-700/30'

// Error (red)
isLight ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-900/20 border border-red-800/40 text-red-300'
```

## Key Principles

1. **Opacity-based theming** — Use `black/[opacity]` for light and `white/[opacity]` for dark. Never use named gray colors (e.g. `gray-500`).
2. **Subtle borders** — Always use `0.06` opacity for borders on cards and tables.
3. **Consistent rounding** — `rounded-lg` for buttons/inputs, `rounded-xl` for cards, `rounded-2xl` for popups.
4. **Minimal contrast** — Backgrounds should barely differ from the page. Cards at `0.03`/`0.04`, hover at `0.02`/`0.03`.
5. **Font weight hierarchy** — `font-bold` for headings, `font-semibold` for stat values, `font-medium` for buttons/labels.
