# Device optimisation

ShiftStart is optimised for operational use on phones, tablets, laptops, desktop monitors, ultrawide screens and printed escalation packs without reducing the knowledge-base content.

## Device behaviour

- **Phones:** compact sticky header, accessible navigation menu, full-width actions, safe-area support, collapsed symptom categories, 48-pixel touch targets on coarse pointers and sticky wizard/procedure actions.
- **Tablets:** two-column symptom and catalogue layouts, touch-friendly controls and landscape-safe navigation.
- **Laptops/desktops:** permanent search, keyboard shortcuts, multi-column catalogues and readable article widths.
- **Large monitors:** bounded reading measure with wider data grids instead of stretched paragraphs.
- **Short landscape screens:** non-sticky controls prevent the header and action bars from consuming the working area.
- **Print:** navigation and interactive controls are removed while commands, warnings, verification and escalation evidence remain readable.

## Accessibility and resilience

- Skip-to-content link and semantic landmarks.
- Keyboard-operable search, navigation, command scrolling and wizard controls.
- Reduced-motion, high-contrast and Windows forced-colour handling.
- Safe-area insets for notched and rounded-screen devices.
- Clipboard fallback for browsers where the modern Clipboard API is unavailable.
- Horizontal containment for commands, tables and long technical values.
- Dynamic viewport units for mobile browser chrome.

## Validation

Run:

```bash
npm run responsive:check
```

The check confirms responsive structure and verifies that all 421 procedures and 446 symptoms remain present.
