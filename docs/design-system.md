# Design system

## Phase 2 implementation

The wordmark pairs wide lettering with two slanted champagne strokes. The display heading uses heavy system sans-serif with tight tracking. Body copy uses a muted text token (#B5B1AA) and a short line length. The stylesheet defines the palette, decorative rules, fluid gutters, section spacing and 180 ms control feedback.

`Container` aligns header, main and footer to a shared 88 rem maximum. `SectionHeading` provides an h2 for named sections. `ButtonLink` uses a native anchor for navigation, with solid champagne and bordered variants. Use native buttons for future in-place actions. The 44 px minimum target and offset champagne focus ring apply to the current controls. Reduced motion removes the button transitions.

The header wraps while keeping both navigation links visible. Editorial sections stack on small screens and use a 5:7 split at 64 rem. The decorative studio surface reserves its geometry for a future renderer with a 16:9 aspect ratio when stacked and 4:3 in the split layout.

Start with near-black studio surroundings (#101114), graphite control surfaces (#202226), warm white text (#F4F1EB) and a restrained champagne accent (#E1C590). Reserve the accent for focus and selected controls. Keep text on an opaque surface when reflections move behind it.

Use a system sans-serif initially. Pair prominent model names with smaller sentence-case labels and tabular figures for specifications. Group related controls with an 8 px spacing rhythm. Keep the vehicle visible beside a desktop options panel and above a single-column panel on phones.

Give each finish a visible name, selection indicator and keyboard focus ring. Use native radio groups for mutually exclusive options. Target 44 px touch controls, 4.5:1 contrast for body text and 3:1 for control boundaries. Verify with actual states, narrow widths and 200% zoom. Provide labeled rotate and reset buttons alongside dragging.
