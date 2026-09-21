# Signpost Field Notes Theme

Signpost uses a warm editorial/postmodern print system rather than a conventional dark developer-tool interface.

The design goal is **editorial trust document**: the interface should feel like a well-edited technical field note that clearly separates applicable guidance from plausible-but-wrong advice.

## Theme tokens

The live app uses these same values in `app/globals.css`. A matching `tailwind.config.ts` is included as the token contract for future Tailwind-based components.

### Color

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#F5F1E8` | Main page background |
| `paper-raised` | `#FBF8F0` | Inputs and answer surfaces |
| `paper-deep` | `#ECE5D8` | Secondary print-like bands |
| `ink` | `#2A2724` | Primary body text |
| `ink-soft` | `#6B645D` | Secondary copy |
| `direction` | `#B85C38` | Right Direction marker |
| `direction-soft` | `#F1E2D7` | Right Direction wash |
| `wrong` | `#8B4A47` | Wrong Turns marker |
| `wrong-soft` | `#F0E2E0` | Wrong Turns wash |
| `sage` | `#7A8B6F` | Confidence / metadata |
| `sage-soft` | `#E7ECE2` | Confidence / sources footer |
| `rule` | `#CFC7BB` | Default 1px print rule |
| `rule-strong` | `#B8AEA1` | Emphasized rule |

## Typography

- **Editorial / headings:** Source Serif 4
- **System context / metadata:** IBM Plex Mono
- **Body / controls:** Inter

Rules:
- Large serif type is for thesis statements, questions, and answer hierarchy.
- Monospace is reserved for system context, timing, labels, and machine-readable details.
- Sans-serif handles controls and explanatory prose.
- Avoid using monospace as decorative “developer” styling. It should signal concrete system information.

## Component specs

### System profile input

Purpose: make system context feel like evidence, not form bureaucracy.

- Container: `1px` `rule-strong` border, no shadow.
- Background: transparent against paper.
- Radius: `18px`.
- Internal spacing: ~22px.
- Header: Source Serif 4, 22px.
- Labels: Inter, 11px, uppercase, 0.075em tracking.
- Inputs: `paper-raised`, 1px rule, 10px radius.
- Focus: clay rule + restrained 2px clay focus ring.
- Active profile displayed as IBM Plex Mono pill chips:
  - `Fedora 44`
  - `GNOME`
  - `Wayland`
- Chips must be informational, not bright badges.

### Answer card: Right Direction + Why it fits

Purpose: make applicability legible before the user reads every sentence.

- Outer card: `paper-raised`, 1px `rule-strong`, no shadow.
- **Right Direction** section:
  - 5px left clay rule.
  - very soft clay wash fading into paper.
  - label in IBM Plex Mono, uppercase, 10px.
  - circular arrow marker `↗`.
  - first paragraph may use Source Serif 4 at ~22px to establish the recommendation.
- **Why it fits** belongs inside the same semantic block rather than as an unrelated card.
  - separated by a thin clay-tinted top rule.
  - label uses the same clay semantic color.
  - should explicitly connect distro / DE / session / hardware context to the recommendation.

### Wrong Turns

Purpose: treat rejected advice as a first-class product feature.

- Separate section directly below Right Direction.
- 5px left rust-red rule.
- subtle rust wash fading into paper.
- IBM Plex Mono uppercase label.
- circular `×` marker.
- Avoid alarm-red or destructive-error styling; these are plausible directions that fail the current context check, not application errors.
- Every wrong turn should state **why** it does not fit the supplied system.

### Confidence + Sources footer

Purpose: close the response like a technical document, not a chatbot message.

- Shared footer band using `sage-soft`.
- Desktop: two-column split.
  - left: Confidence
  - right: Sources
- Mobile: stacked with 1px horizontal rule.
- Labels: IBM Plex Mono, uppercase, 10px.
- Text: normal body type.
- Sources use clay links with restrained underline treatment.
- Confidence should stay visually quieter than the recommendation itself.

## Layout rules

- Maximum page width: 1120px.
- Main content uses generous print-style side margins.
- 1px rules replace drop shadows.
- Major sections should breathe; avoid compact dashboard density.
- Cards are structural pages/panels, not floating glass surfaces.
- The hero and thesis sections use negative space as a design element.
- Responsive layout collapses profile + question from two columns to one.

## Refinements that strengthen the editorial trust-document feel

### 1. Keep Source Serif 4 over Lora

Source Serif 4 feels slightly more technical/editorial and less lifestyle-magazine than Lora. It pairs especially well with IBM Plex Mono because both feel utilitarian without becoming cold.

### 2. Keep the clay muted

`#B85C38` should behave like an editor's annotation mark, not a CTA brand orange. Most controls remain charcoal; clay is reserved for semantic direction and emphasis.

### 3. Use rust-red only for applicability rejection

`#8B4A47` should never be used for generic errors or destructive UI unless the meaning genuinely overlaps. Its strongest job is making **Wrong Turns** instantly legible.

### 4. Sage should feel evidentiary

The sage family belongs to confidence, provenance, and source metadata. It should read as “supporting evidence,” not success-green.

### 5. Avoid decorative postmodernism that hurts scanning

The design can use oversized serif type and editorial labels, but Signpost is still a troubleshooting tool. Avoid rotated cards, strong textures, stickers, or ornamental shapes around the answer itself. The personality should come from typography, whitespace, semantic color, and rules.

## Tailwind examples

```tsx
<section className="rounded-card border border-rule-strong bg-paper-raised">
  <div className="border-l-[5px] border-direction bg-gradient-to-r from-direction-soft to-transparent p-section-md">
    <div className="font-mono text-[10px] font-semibold uppercase tracking-label text-direction">
      ↗ Right direction
    </div>
  </div>
</section>
```

```tsx
<div className="flex flex-wrap gap-2 font-mono text-[10px]">
  <span className="rounded-full border border-rule bg-paper-raised px-2 py-1.5">Fedora 44</span>
  <span className="rounded-full border border-rule bg-paper-raised px-2 py-1.5">GNOME</span>
  <span className="rounded-full border border-rule bg-paper-raised px-2 py-1.5">Wayland</span>
</div>
```

The live app currently implements these concepts with CSS variables/classes rather than Tailwind utilities. The Tailwind config exists so new components can use the same design language without inventing new values.
