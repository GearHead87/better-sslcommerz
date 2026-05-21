# SSLCOMMERZ — Design Tokens

Color palette derived from the SSLCOMMERZ logo, payment UI, and marketing page screenshots. All hex values were sampled directly from the source images.

---

## Brand Colors

| Token | Hex | Preview | Source |
|---|---|---|---|
| `--brand-blue` | `#295CAB` | ![#295CAB](https://placehold.co/40x20/295CAB/295CAB.png) | Logo background, feature icons |
| `--brand-blue-deep` | `#2259A7` | ![#2259A7](https://placehold.co/40x20/2259A7/2259A7.png) | Darker shade for hover / pressed states |
| `--brand-blue-soft` | `#5E7DB1` | ![#5E7DB1](https://placehold.co/40x20/5E7DB1/5E7DB1.png) | Anti-aliased edges, disabled brand elements |

**Primary brand color is `#295CAB`** — this is the exact blue pulled from the logo plate and the feature icons on the marketing page. Use it for headings on white backgrounds, iconography, and brand-locked surfaces (logo plate, hero blocks).

---

## Action / Interactive Colors

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `--action-blue` | `#0173D3` | ![#0173D3](https://placehold.co/40x20/0173D3/0173D3.png) | Primary CTA button ("Pay ৳320,000"), active tab/tile ("Card"), inline links ("Participating Banks", "Other cards") |
| `--surface-blue-tint` | `#ECF6FF` | ![#ECF6FF](https://placehold.co/40x20/ECF6FF/ECF6FF.png) | Info banner background ("You are paying ৳320,000.00") |

**Note the two-blue system:** `#295CAB` is the *brand* (identity), `#0173D3` is the *action* (UI). They are intentionally distinct in the source — keep them separate. Don't substitute one for the other.

---

## Neutrals

| Token | Hex | Preview | Usage |
|---|---|---|---|
| `--bg` | `#FFFFFF` | ![#FFFFFF](https://placehold.co/40x20/FFFFFF/FFFFFF.png?text=+) | Page & card background |
| `--text-primary` | `#000000` | ![#000000](https://placehold.co/40x20/000000/000000.png) | Headings, body copy, "G Pay" button background |
| `--text-secondary` | `#5A6A7A` | ![#5A6A7A](https://placehold.co/40x20/5A6A7A/5A6A7A.png) | Helper text, footer copy, placeholders |
| `--border` | `#E2E2E2` | ![#E2E2E2](https://placehold.co/40x20/E2E2E2/E2E2E2.png) | Input field borders, tile borders, dividers |
| `--surface-muted` | `#F5F5F5` | ![#F5F5F5](https://placehold.co/40x20/F5F5F5/F5F5F5.png) | Inactive tile background |

---

## Quick CSS Variables

```css
:root {
  /* Brand */
  --brand-blue:       #295CAB;
  --brand-blue-deep:  #2259A7;
  --brand-blue-soft:  #5E7DB1;

  /* Action */
  --action-blue:      #0173D3;
  --surface-blue-tint:#ECF6FF;

  /* Neutrals */
  --bg:               #FFFFFF;
  --text-primary:     #000000;
  --text-secondary:   #5A6A7A;
  --border:           #E2E2E2;
  --surface-muted:    #F5F5F5;
}
```

---

## Component Mapping (from the screenshots)

**Logo plate (Image 1)**
- Background: `--brand-blue` `#295CAB`
- Wordmark: `--bg` `#FFFFFF`

**Payment screen (Image 2)**
- Page background: `--bg`
- Top info strip: `--surface-blue-tint` background, `--text-primary` text, `--action-blue` for the "Participating Banks" link
- GPay button: `--text-primary` background, white text/logo
- Payment method tiles: `--border` outline on white; active tile fills with `--action-blue`
- Input fields: `--border` outline, `--text-secondary` placeholder
- Primary CTA "Pay ৳320,000": `--action-blue` background, white text
- Footer copy: `--text-secondary`

**Marketing feature grid (Image 3)**
- Background: `--bg`
- Icons: `--brand-blue` `#295CAB`
- Headings: `--text-primary`
- Body copy: `--text-secondary`
- Column dividers: `--border`

---

## Usage Rules

1. **Never mix the two blues in one component.** A CTA inside a brand-blue hero stays `#0173D3`; a logo on a payment screen stays `#295CAB`.
2. **CTA contrast:** white text on `--action-blue` only. Don't put `--brand-blue` text on `--surface-blue-tint` — contrast is too low.
3. **Borders are the only gray UI element.** Avoid gray fills for buttons or tiles; use white with a `--border` outline, matching the source UI.
4. **Black, not dark blue, for body text.** The source uses true `#000000` for primary copy and the GPay button.