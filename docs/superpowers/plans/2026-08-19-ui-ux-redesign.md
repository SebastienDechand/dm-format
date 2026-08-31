# UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the new DM Format visual language (Poppins/Inter typography, blue/white palette with a minimal terracotta accent, soft rounded shapes) across the whole Angular site, and fix several color-token bugs discovered while auditing the current styles.

**Architecture:** Nearly all of the retheming is achieved by editing CSS custom properties in one root stylesheet (`frontend/src/styles.scss`) - because every component already consumes colors via `var(--token)`, changing a token's _value_ once cascades everywhere without touching component files. The remaining, genuinely per-component work is: (a) reclassifying two overloaded/mislabeled tokens (`--icon-color`, `--danger-color`) whose _meaning_ differs by call site, (b) converting hardcoded card borders/shadows/radii to the new `--radius-card` / `--radius-control` / `--shadow-soft` tokens, and (c) two small template additions (a duration badge on program cards, a corrected cancel/confirm color scheme on the gallery delete dialog).

**Tech Stack:** Angular 19, SCSS, Angular Material 19 (MDC-based components, styled via `::ng-deep` targeting stable `.mat-mdc-*` DOM classes - the pattern already used in `header.component.scss:317`), CSS custom properties.

**Spec:** `frontend/docs/superpowers/specs/2026-08-19-ui-ux-redesign-design.md`

## Global Constraints

- Brand blue `--primary-color: #316095` must not change value - only new tokens are added around it.
- Fond blanc/bleu dominant: the new `--accent` (terracotta `#e07856`) is used **only** for badges, one highlighted keyword, and secondary CTAs on a dark background - never as a primary button color or a default card background.
- Soft shape language: `--radius-card: 10px` on card/panel containers, `--radius-control: 8px` on buttons/inputs/badges, `--shadow-soft: 0 4px 16px rgba(15, 41, 66, 0.08)` replacing gray `1px solid var(--border-color)` borders on card-like containers. Circular elements (`border-radius: 50%` avatars, icon buttons, carousel dots) are untouched - they're not part of this system.
- Typography: Poppins 600/700 for `h1`–`h4`, Inter 400/500/600 for body text - set once globally, not per component.
- Every task ends with `npm run lint`, `npm run build` passing, and a manual check of the touched page(s)/component(s) via `npm start` (`http://localhost:4200`) against the spec.
- Commit after every task (small, working diffs - never a mega-commit at the end).
- All commits happen on the existing `redesign` branch (already checked out, tracks `origin/redesign`).

---

## Task 1: Design tokens, global typography, and base styles

**Files:**

- Modify: `frontend/src/styles.scss`
- Modify: `frontend/src/index.html`

**Interfaces:**

- Produces: the full token set every later task consumes - `--primary-color` (unchanged `#316095`), `--primary-dark` (`#0f2942`), `--primary-tint` (`#e7eef5`), `--accent` (`#e07856`), `--accent-tint` (`#fdece5`), `--danger` (`#c9503f`), `--danger-tint` (`#f7e6e3`), `--shadow-soft` (`0 4px 16px rgba(15, 41, 66, 0.08)`), `--radius-card` (`10px`), `--radius-control` (`8px`), `--space-1` through `--space-16`. Repoints (same name, new value): `--dark-color` → `#0f2942`, `--secondary-color` → `#5a6a78`, `--button-color` → `#316095`, `--button-color-hover` → `#24476f`, `--success-color` → `#2f9e5c`, `--warning-color` → `#e0a13c`, and the seven `--*-size-desktop` tokens switch from fixed px to `clamp()` rem values. `--icon-color` and `--danger-color` are left untouched for now (still `#dc3545` / `#abc1db`) - they're deprecated in Task 9 once every consumer has been reclassified.

- [ ] **Step 1: Swap the Google Fonts link in `index.html`**

In `frontend/src/index.html`, replace:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap"
  rel="stylesheet"
/>
```

with:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

(Leave the Material Icons and Font Awesome links untouched - that's a separate icon-migration chantier.)

- [ ] **Step 2: Add and repoint tokens in `styles.scss`**

In `frontend/src/styles.scss`, replace the `:root { ... }` block with:

```scss
:root {
  /* Colors */
  --primary-color: #316095;
  --primary-dark: #0f2942;
  --primary-tint: #e7eef5;
  --accent: #e07856;
  --accent-tint: #fdece5;
  --secondary-color: #5a6a78;
  --border-color: #e0e0e0;
  --success-color: #2f9e5c;
  --info-color: #0c498f;
  --warning-color: #e0a13c;
  --danger: #c9503f;
  --danger-tint: #f7e6e3;
  --danger-color: #abc1db; /* deprecated - remove in Task 9 once all call sites are reclassified */
  --light-color: white;
  --dark-color: #0f2942;
  --background-color: #f9f9f9;
  --background-color-dark: #f4f4f4;
  --button-color: #316095;
  --button-color-hover: #24476f;
  --icon-color: #dc3545; /* deprecated - remove in Task 9 once all call sites are reclassified */

  /* Shape */
  --radius-card: 10px;
  --radius-control: 8px;
  --shadow-soft: 0 4px 16px rgba(15, 41, 66, 0.08);

  /* Sizes - fluid rem clamps instead of fixed px, so they scale between the
     current mobile and desktop values and respect the browser's zoom/root
     font size (accessibility requirement from the spec) */
  --title-size-desktop: clamp(1.75rem, 1.2rem + 2.5vw, 3.125rem);
  --subtitle-size-desktop: clamp(1.5rem, 1.1rem + 2vw, 2.5rem);
  --h2-size-desktop: clamp(1.375rem, 1.05rem + 1.6vw, 2.25rem);
  --h3-size-desktop: clamp(1.25rem, 1rem + 1.2vw, 1.75rem);
  --h4-size-desktop: clamp(1.125rem, 0.95rem + 0.8vw, 1.5rem);
  --text-size-desktop: clamp(1rem, 0.92rem + 0.4vw, 1.25rem);
  --small-text-size-desktop: clamp(0.875rem, 0.83rem + 0.2vw, 1rem);

  /* Margins */
  --margin-big: 50px;
  --margin-medium: 25px;
  --margin-small: 15px;

  /* Paddings */
  --padding-big: 32px;
  --padding-medium: 16px;
  --padding-small: 8px;

  /* Finer spacing scale (base 4/8px) - additive, for new/touched components
     going forward. Does not replace --margin-*/--padding-* everywhere in
     this plan; see the scope note at the end of Task 1. */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Breakpoints */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}
```

- [ ] **Step 3: Set global typography**

In `frontend/src/styles.scss`, replace:

```scss
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 70px 0 0 0;
  background: var(--background-color);
  line-height: 1.6;
  color: var(--secondary-color);
  overflow-x: hidden;
}

h1,
h2,
h3,
h4 {
  color: var(--dark-color);
}
```

with:

```scss
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 70px 0 0 0;
  background: var(--background-color);
  line-height: 1.6;
  color: var(--secondary-color);
  overflow-x: hidden;
}

h1,
h2,
h3,
h4 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: var(--dark-color);
}
```

Also replace the second, duplicate `body` rule further down:

```scss
body {
  margin: 0;
  font-family: Roboto, 'Helvetica Neue', sans-serif;
}
```

with:

```scss
body {
  margin: 0;
  font-family: 'Inter', 'Helvetica Neue', sans-serif;
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run build` (from `frontend/`)
Expected: build succeeds with no SCSS errors.

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 5: Visual check**

Run: `npm start`, open `http://localhost:4200`.
Expected: headings now render in Poppins (bolder, geometric), body text in Inter. Colors look close to before (tokens repointed to similar-but-warmer values) - nothing should look broken or unstyled. Existing buttons should already look slightly bluer (brand blue `#316095` instead of bootstrap `#007bff`) since `--button-color` now cascades to every button using it.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/styles.scss frontend/src/index.html
git commit -m "feat(design): add redesign tokens, switch to Poppins/Inter"
```

---

## Task 2: Header and footer

**Files:**

- Modify: `frontend/src/app/components/header/header.component.scss`
- Modify: `frontend/src/app/components/footer/footer.component.scss`

**Interfaces:**

- Consumes: tokens from Task 1 (`--light-color`, `--shadow-soft`, `--primary-tint`, `--primary-dark`).

- [ ] **Step 1: Header - replace border with a soft shadow, fix the active-nav-link background**

In `frontend/src/app/components/header/header.component.scss`, in the `nav { ... }` rule (line 2), replace:

```scss
background-color: var(--background-color);
border-bottom: 1px solid var(--border-color);
```

with:

```scss
background-color: var(--light-color);
box-shadow: var(--shadow-soft);
```

Then find `.nav-active` (around line 113-116):

```scss
      &.nav-active {
        font-weight: bold;
        background-color: var(--danger-color);
        color: var(--primary-color);
```

Replace with:

```scss
      &.nav-active {
        font-weight: bold;
        background-color: var(--primary-tint);
        color: var(--primary-color);
```

(This was a bug: `--danger-color` is a light-blue token despite its name, being used here as the "active" chip background. `--primary-tint` is the correctly-named token for exactly this use and has the same visual effect.)

Also replace the second `border-bottom: 1px solid var(--border-color);` around line 180 (mobile side-nav divider) with `box-shadow: var(--shadow-soft);` for consistency.

- [ ] **Step 2: Footer - fix the background/text contrast bug, drop the hardcoded font**

In `frontend/src/app/components/footer/footer.component.scss`, replace:

```scss
.footer {
  background: var(--background-color-dark);
  color: var(--light-color);
  padding: 50px 0 0;
  font-family: 'Arial', sans-serif;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
```

with:

```scss
.footer {
  background: var(--primary-dark);
  color: var(--light-color);
  padding: 50px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
```

(`--background-color-dark` is `#f4f4f4` - a _light_ gray. Combined with white text, this made footer text very low-contrast. `--primary-dark` is a real dark navy, which is also what the CTA-bandeau design in the spec calls for. Dropping the hardcoded `Arial` lets the footer inherit the global Inter body font from Task 1.)

- [ ] **Step 3: Verify**

Run: `npm run build` - expect PASS.
Run: `npm start`, check the header (white, soft shadow instead of a hard line, active nav item shows a light-blue chip) and footer (dark navy background, white text now clearly legible) on any page.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/header/header.component.scss frontend/src/app/components/footer/footer.component.scss
git commit -m "fix(design): header shadow + fix footer low-contrast background bug"
```

---

## Task 3: Hero banner and certification section

**Files:**

- Modify: `frontend/src/app/components/banner/banner.component.scss`
- Modify: `frontend/src/app/components/certification/certification.component.scss`

**Interfaces:**

- Consumes: `--radius-card`, `--radius-control` from Task 1.

- [ ] **Step 1: Banner - align radii to the token scale**

In `frontend/src/app/components/banner/banner.component.scss`:

Replace (line ~91, `::ng-deep .hero-banner-image`):

```scss
::ng-deep .hero-banner-image {
  width: 100%;
  max-height: 70vh;
  border-radius: 10px;
}
```

with:

```scss
::ng-deep .hero-banner-image {
  width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-card);
}
```

Replace (line ~70, `.edit-textarea`):

```scss
.edit-textarea {
  border: 2px solid var(--primary-color);
  padding: 5px;
  font-size: var(--text-size-desktop);
  border-radius: 5px;
}
```

with the same block but `border-radius: var(--radius-control);`.

- [ ] **Step 2: Certification - align radii/shadow to the token scale**

In `frontend/src/app/components/certification/certification.component.scss`, apply this rule consistently to every `border-radius` / `box-shadow` declaration in the file: values on **card/panel-level containers** (backgrounds, padded blocks) become `border-radius: var(--radius-card);`, values on **buttons/badges/small controls** become `border-radius: var(--radius-control);`, and any `box-shadow: 0 ... rgba(0, 0, 0, ...)` on a card container becomes `box-shadow: var(--shadow-soft);`. Concretely:

- Line 12 (`.edit-textarea`, control) → `border-radius: var(--radius-control);`
- Line 49 (button-like element, control) → `border-radius: var(--radius-control);`
- Line 75 (card container, `background: var(--background-color); border-radius: 10px;`) → `border-radius: var(--radius-card);`
- Lines 104-105 (`background: white; padding: 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`) → `border-radius: var(--radius-card); box-shadow: var(--shadow-soft);`
- Line 138 (card container) → `border-radius: var(--radius-card);`
- Line 152 (button, control) → `border-radius: var(--radius-control);`

- [ ] **Step 3: Verify**

Run: `npm run build` - expect PASS.
Run: `npm start`, view the home page. Expect: hero image and certification blocks have the same soft ~10px rounding and light shadow as the rest of the new system, buttons/badges use the tighter 8px radius.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/banner/banner.component.scss frontend/src/app/components/certification/certification.component.scss
git commit -m "style(design): apply radius/shadow tokens to hero and certification"
```

---

## Task 4: Programs, partner, and gallery

**Files:**

- Modify: `frontend/src/app/components/programs/programs.component.scss`
- Modify: `frontend/src/app/components/programs/programs.component.html`
- Modify: `frontend/src/app/components/partner/partner.component.scss`
- Modify: `frontend/src/app/components/gallery/gallery.component.scss`

**Interfaces:**

- Consumes: `--radius-card`, `--radius-control`, `--shadow-soft`, `--accent`, `--accent-tint`, `--danger`, `--primary-dark` from Task 1.
- Produces: `.program-badge` CSS class (used only within `programs.component.html`).

- [ ] **Step 1: Programs - card shape**

In `frontend/src/app/components/programs/programs.component.scss`:

Replace line 21 `border-radius: 20px;` and line 27 `border-radius: 12px;` (both on the `mat-card`/`program-card` container) with `border-radius: var(--radius-card);`.
Replace line 25 `box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);` with `box-shadow: var(--shadow-soft);`.
Replace line 79 `border-radius: 5px;` (a button/control) with `border-radius: var(--radius-control);`.

Because `mat-card` renders Material's own DOM (`.mat-mdc-card`), also add, at the end of the file:

```scss
::ng-deep .program-card.mat-mdc-card {
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft) !important;
}

.program-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-control);
  font-size: 11px;
  font-weight: 700;
  background: var(--accent-tint);
  color: var(--accent);
  margin: 12px 12px 0;
}
```

- [ ] **Step 2: Programs - add a duration badge to each card**

`Program` (see `frontend/src/app/models/programs.models.ts`) already has a `duration: string` field that the card doesn't currently show. In `frontend/src/app/components/programs/programs.component.html`, replace:

```html
<img
  mat-card-image
  [src]="training.banner.src"
  [alt]="stripHtmlTags(training.title)"
/>
<mat-card-title>{{ stripHtmlTags(training.title) }}</mat-card-title>
```

with:

```html
<img
  mat-card-image
  [src]="training.banner.src"
  [alt]="stripHtmlTags(training.title)"
/>
<span class="program-badge" *ngIf="training.duration"
  >{{ training.duration }}</span
>
<mat-card-title>{{ stripHtmlTags(training.title) }}</mat-card-title>
```

(A "category" badge like the "Certifiant / Recyclage / Formateur" shown in the design mockups isn't possible without adding a new field to the `Program` model and backend - that's out of scope for a frontend-only visual redesign. `duration` is real, existing data that serves the same "at-a-glance tag" purpose the mockups were going for.)

- [ ] **Step 3: Partner - no color-token bugs found; align any card radius/shadow**

In `frontend/src/app/components/partner/partner.component.scss`, apply the same rule as certification (Step 2 of Task 3): card-level `border-radius`/`box-shadow` → `var(--radius-card)` / `var(--shadow-soft)`, control-level → `var(--radius-control)`. (If the file has none, no change needed - confirm by reading the file before editing.)

- [ ] **Step 4: Gallery - fix the delete/close hover colors**

In `frontend/src/app/components/gallery/gallery.component.scss`:

Replace (around line 104-119, `.delete-btn`):

```scss
&:hover {
  background-color: var(--icon-color);
  color: var(--light-color);
}
```

with:

```scss
&:hover {
  background-color: var(--danger);
  color: var(--light-color);
}
```

(This button genuinely deletes an image - `--danger` is the correct semantic token, `--icon-color` was just the old, misleadingly-named token that happened to hold a red.)

Replace (around line 155-157, `.close-lightbox-btn:hover`):

```scss
.close-lightbox-btn:hover {
  background: var(--icon-color);
}
```

with:

```scss
.close-lightbox-btn:hover {
  background: var(--primary-dark);
}
```

(Closing the lightbox isn't a destructive action - it shouldn't turn red on hover.)

Then apply the card-shape rule (as in Task 3 Step 2) to any remaining `border-radius`/`box-shadow` in the file that sits on a card/panel container (not on the circular `.close-lightbox-btn`, which keeps its `border-radius: 50%`).

- [ ] **Step 5: Verify**

Run: `npm run build` - expect PASS.
Run: `npm start`, view the home page. Expect: program cards show a small terracotta duration badge, soft shadow/rounding; gallery delete button turns red-ish (`--danger`) on hover, lightbox close button turns dark navy on hover (not red).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/components/programs frontend/src/app/components/partner frontend/src/app/components/gallery
git commit -m "style(design): restyle program cards, add duration badge, fix gallery hover colors"
```

---

## Task 5: Training testimonials and testimonial dialog

**Files:**

- Modify: `frontend/src/app/components/training-testimonials/training-testimonials.component.scss`
- Modify: `frontend/src/app/components/testimonial-dialog/testimonial-dialog.component.scss`

**Interfaces:**

- Consumes: `--danger`, `--secondary-color`, `--primary-color`, `--radius-card`, `--shadow-soft` from Task 1.

- [ ] **Step 1: Fix the literal hardcoded blue**

In `frontend/src/app/components/training-testimonials/training-testimonials.component.scss` line 160, replace:

```scss
background-color: #316095;
```

with:

```scss
background-color: var(--primary-color);
```

- [ ] **Step 2: Reclassify `--icon-color` usages**

Same file - these are all genuine validation/error states, so `--icon-color` → `--danger` (rename only, same red family, correctly-named token):

- Line 137 `.is-invalid { border-color: var(--icon-color); }` → `border-color: var(--danger);`
- Line 142 `.invalid-feedback { color: var(--icon-color); }` → `color: var(--danger);`
- Lines 188-189 (`.alert-danger`):
  ```scss
  &.alert-danger {
    background-color: rgba(220, 53, 69, 0.1);
    border: 1px solid var(--icon-color);
    color: var(--icon-color);
  }
  ```
  becomes:
  ```scss
  &.alert-danger {
    background-color: var(--danger-tint);
    border: 1px solid var(--danger);
    color: var(--danger);
  }
  ```

Line 73 `.delete-btn { ... color: var(--icon-color); ... }` (comment above it: "Bouton de suppression pour admins") is a genuine delete action → `color: var(--danger);` (rename only).

- [ ] **Step 3: Card shape and border-color cleanup**

Lines 31, 107, 123 use `border: 1px solid var(--border-color);` on testimonial card containers - replace each with the soft-card treatment: remove the `border` line, add `box-shadow: var(--shadow-soft);`, and set/replace any `border-radius` on that same container to `var(--radius-card)`.

- [ ] **Step 4: Testimonial dialog - close button shouldn't default to red**

In `frontend/src/app/components/testimonial-dialog/testimonial-dialog.component.scss`, replace:

```scss
  .close-button {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 8px;
    color: var(--icon-color);
    background: none;
    border: none;
```

with:

```scss
  .close-button {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 8px;
    color: var(--secondary-color);
    background: none;
    border: none;
```

(Leave the `:hover` rule below untouched - it already uses a neutral `rgba(0, 0, 0, 0.1)` background, which is fine.)

- [ ] **Step 5: Verify**

Run: `npm run build` - expect PASS.
Run: `npm start`, open a page showing testimonials (home, program-detail). Trigger a validation error in the testimonial form if easily reachable - expect red (`--danger`) borders/text, not the old bootstrap red. Testimonial cards should have soft shadows, no gray border.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/components/training-testimonials frontend/src/app/components/testimonial-dialog
git commit -m "fix(design): reclassify icon-color to danger tokens in testimonials, soft-card shape"
```

---

## Task 6: Public pages - About, Organisation, Contact, Program-detail

**Files:**

- Modify: `frontend/src/app/pages/about/about.component.scss`
- Modify: `frontend/src/app/pages/organisation/organisation.component.scss`
- Modify: `frontend/src/app/pages/contact/contact.component.scss`
- Modify: `frontend/src/app/pages/program-detail/program-detail.component.scss`

**Interfaces:**

- Consumes: `--danger`, `--primary-tint`, `--radius-card`, `--shadow-soft` from Task 1.

- [ ] **Step 1: Organisation - fix the mislabeled danger-color card border**

In `frontend/src/app/pages/organisation/organisation.component.scss`, around line 121-126:

```scss
    .condition-item,
    .obligation-item,
    .finance-item {
      margin-bottom: 75px;
      border: 2px solid var(--danger-color);
      border-radius: 20px;
```

replace with:

```scss
    .condition-item,
    .obligation-item,
    .finance-item {
      margin-bottom: 75px;
      background: var(--primary-tint);
      border: none;
      box-shadow: var(--shadow-soft);
      border-radius: var(--radius-card);
```

(These are informational boxes, not error states - `--danger-color` was just an accidentally-light-blue token that happened to look OK as a thin border. Converting to the soft-card treatment matches the rest of the redesign instead of keeping a stray thick border.)

- [ ] **Step 2: Contact - fix validation colors**

In `frontend/src/app/pages/contact/contact.component.scss`:

```scss
  .invalid {
    border-color: var(--icon-color);
  }

  .error-message {
    color: var(--icon-color);
```

replace both `var(--icon-color)` with `var(--danger)`.

- [ ] **Step 3: Program-detail - fix the info/testimonials panel color, fix the delete button**

In `frontend/src/app/pages/program-detail/program-detail.component.scss`:

Line 297 `.program-info { background: var(--danger-color); ... }` → `background: var(--primary-tint);`
Line 347 `.testimonials { background: var(--danger-color); ... }` → `background: var(--primary-tint);`
Line 521 `.delete-btn { background: var(--danger-color); color: white; ... }` → `background: var(--danger);` (this one _is_ a real delete action - the surrounding comment says "❌ Bouton de suppression" - so it should actually be red, not light blue.)

- [ ] **Step 4: About, and any remaining radius/shadow in this task's files**

Read `about.component.scss` and confirm whether it has any `border-radius`/`box-shadow` on card-like containers; if so, apply the same token substitution rule as Task 3 Step 2 (card-level → `var(--radius-card)` / `var(--shadow-soft)`, control-level → `var(--radius-control)`). Do the same pass over any remaining hardcoded radius/shadow left in `organisation.component.scss`, `contact.component.scss`, and `program-detail.component.scss` after the fixes above.

- [ ] **Step 5: Verify**

Run: `npm run build` - expect PASS.
Run: `npm start`, visit `/about`, `/organisation`, `/contact`, and a program detail page. Expect: organisation's condition/obligation/finance boxes now show a light-blue soft card instead of a thick border; contact form invalid states show red, not the old red (should look the same since `--danger` ≈ old `--icon-color` hex-wise, this is a rename not a visual change here); program-detail info/testimonials panels show light blue instead of light blue-that-was-mislabeled (visually near-identical, now correctly named); program-detail's actual delete button is now red instead of light blue.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/pages/about frontend/src/app/pages/organisation frontend/src/app/pages/contact frontend/src/app/pages/program-detail
git commit -m "fix(design): reclassify danger-color/icon-color tokens across public pages"
```

---

## Task 7: Calendar

**Files:**

- Modify: `frontend/src/app/components/calendar/calendar.component.scss`

**Interfaces:**

- Consumes: `--radius-card`, `--radius-control`, `--shadow-soft` from Task 1.

- [ ] **Step 1: Align radii/shadows to tokens**

In `frontend/src/app/components/calendar/calendar.component.scss`, apply the standard substitution rule:

- Lines 7-8 (`border-radius: 4px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);`) - if this is a card/panel-level container, → `border-radius: var(--radius-card); box-shadow: var(--shadow-soft);`. If it's a small control, use `var(--radius-control)` for the radius and drop/lighten the shadow to `var(--shadow-soft)`. Read the surrounding selector to decide.
- Lines 37-38 (`border-radius: 8px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);`) - same rule (this looks like a modal/popover panel - card-level).
- Line 53 (`border-radius: 8px 8px 0 0;`) - a panel header, keep the token but preserve the asymmetric corners: `border-radius: var(--radius-card) var(--radius-card) 0 0;`.
- Lines 90, 96, 165 (`border-radius: 50% !important;`) - leave untouched (circular day cells, not part of the card/control system).
- Lines 174-175 (same pattern as 7-8) - same rule.

- [ ] **Step 2: Verify**

Run: `npm run build` - expect PASS.
Run: `npm start`, open the page that shows the calendar (home page programs / booking flow - check `calendar.component.ts` usages to find it if unsure) and open the calendar picker. Expect: panels have the new soft shadow instead of the heavier `rgba(0,0,0,0.3)` shadow; day cells remain circular.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/components/calendar
git commit -m "style(design): apply radius/shadow tokens to calendar"
```

---

## Task 8: Shared dialogs and admin controls

**Files:**

- Modify: `frontend/src/app/components/modal/modal.component.scss`
- Modify: `frontend/src/app/components/confirm-dialog/confirm-dialog.component.scss`
- Modify: `frontend/src/app/components/confirm-dialog-gallery/confirm-dialog-gallery.component.scss`
- Modify: `frontend/src/app/components/confirm-dialog-gallery/confirm-dialog-gallery.component.html` (no change expected - read to confirm `.cancel-btn`/`.confirm-btn` still map to "Annuler"/"Confirmer")
- Modify: `frontend/src/app/components/login/login.component.scss`
- Modify: `frontend/src/app/components/edit-button/edit-button.component.scss`

**Interfaces:**

- Consumes: `--primary-color`, `--primary-tint`, `--danger`, `--secondary-color`, `--button-color`, `--button-color-hover`, `--radius-control`, `--radius-card`, `--shadow-soft` from Task 1.

- [ ] **Step 1: Modal - close button hover shouldn't be red**

In `frontend/src/app/components/modal/modal.component.scss`, replace:

```scss
&:hover,
&:focus-visible {
  color: var(--icon-color);
}
```

with:

```scss
&:hover,
&:focus-visible {
  color: var(--primary-color);
}
```

(The default color on this button is already `var(--dark-color)` a few lines up - hovering to brand blue is a normal interactive state; there's no reason a plain "close" control should turn red.)

- [ ] **Step 2: Confirm-dialog-gallery - swap the cancel/confirm color scheme**

Read `frontend/src/app/components/confirm-dialog-gallery/confirm-dialog-gallery.component.html` first to confirm current button labels (`Annuler` on `.cancel-btn`, `Confirmer` on `.confirm-btn`, used to confirm deleting a gallery image). Then in `frontend/src/app/components/confirm-dialog-gallery/confirm-dialog-gallery.component.scss`, replace:

```scss
.cancel-btn {
  background: var(--danger-color);
  color: var(--light-color);
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: var(--icon-color);
  }
}

.confirm-btn {
  background: var(--primary-color);
  color: var(--light-color);
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: var(--success-color);
  }
}
```

with:

```scss
.cancel-btn {
  background: transparent;
  color: var(--primary-color);
  border: 1.5px solid var(--primary-color);
  padding: 8px 15px;
  border-radius: var(--radius-control);
  cursor: pointer;

  &:hover {
    background: var(--primary-tint);
  }
}

.confirm-btn {
  background: var(--danger);
  color: var(--light-color);
  padding: 8px 15px;
  border: none;
  border-radius: var(--radius-control);
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
}
```

(This dialog confirms _deleting_ a gallery image. The old scheme had "Annuler" filled with a stray light-blue and "Confirmer" filled with plain brand blue - neither signaled that confirming is destructive. The new scheme gives Cancel the low-emphasis "ghost" treatment from the spec's button pattern, and Confirm the actual `--danger` red, which correctly warns the user before an irreversible delete.)

Also update `.modal` in the same file: replace `border-radius: 8px;` with `border-radius: var(--radius-card);` and `box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);` with `box-shadow: var(--shadow-soft);`.

- [ ] **Step 3: Confirm-dialog - align shape tokens**

Read `frontend/src/app/components/confirm-dialog/confirm-dialog.component.scss` and apply the same card-shape substitution rule used throughout this plan (radius → `var(--radius-card)`/`var(--radius-control)`, shadow → `var(--shadow-soft)`) to whatever container/button radii and shadows it defines.

- [ ] **Step 4: Login - fix the error color**

In `frontend/src/app/components/login/login.component.scss`, replace:

```scss
mat-error {
  font-size: 12px;
  color: var(--icon-color);
}
```

with:

```scss
mat-error {
  font-size: 12px;
  color: var(--danger);
}
```

- [ ] **Step 5: Edit-button - replace hardcoded hex with tokens**

In `frontend/src/app/components/edit-button/edit-button.component.scss`, replace:

```scss
color: #007bff;
```

with:

```scss
color: var(--button-color);
```

and:

```scss
color: #0056b3;
```

with:

```scss
color: var(--button-color-hover);
```

- [ ] **Step 6: Verify**

Run: `npm run build` - expect PASS.
Run: `npm start`. As an admin (or by triggering the relevant dialogs), check: modal close button turns blue (not red) on hover; the gallery image delete-confirmation dialog now shows a blue outlined "Annuler" and a solid red "Confirmer"; login form validation errors are red; edit-button icon is brand blue, darker blue on hover.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/components/modal frontend/src/app/components/confirm-dialog frontend/src/app/components/confirm-dialog-gallery frontend/src/app/components/login frontend/src/app/components/edit-button
git commit -m "fix(design): reclassify icon-color/danger-color in dialogs, fix gallery delete confirmation colors"
```

---

## Task 9: Deprecated token cleanup and final verification

**Files:**

- Modify: `frontend/src/styles.scss`

**Interfaces:**

- Consumes: nothing new - this task only removes `--icon-color` and `--danger-color` from `:root` once nothing references them.

- [ ] **Step 1: Confirm no references remain**

Run (from `frontend/`):

```bash
grep -rn "var(--icon-color)" src/app
grep -rn "var(--danger-color)" src/app
```

Expected: both commands print nothing. If either prints a match, go back and reclassify that occurrence using the same rule applied in Tasks 2–8 (is it a genuine error/destructive state → `--danger`; is it a decorative/interactive accent → `--primary`, `--primary-dark`, or `--primary-tint`; is it an "active/info" surface → `--primary-tint`) before continuing.

- [ ] **Step 2: Remove the deprecated tokens**

In `frontend/src/styles.scss`, delete these two lines from `:root`:

```scss
  --danger-color: #abc1db; /* deprecated - remove in Task 9 once all call sites are reclassified */
  ...
  --icon-color: #dc3545; /* deprecated - remove in Task 9 once all call sites are reclassified */
```

- [ ] **Step 3: Full verification pass**

Run: `npm run build` - expect PASS (this will now fail loudly with an "undefined CSS custom property" - actually SCSS won't error on an unknown CSS var at build time, so also re-run the grep from Step 1 as the real safety net, not the build).
Run: `npm run lint` - expect PASS.
Run: `npm start` and manually click through all 5 public pages (`/`, `/about`, `/organisation`, `/contact`, a program detail page) plus the gallery delete-confirmation dialog, the testimonial dialog, and the login form. Compare against `docs/superpowers/specs/2026-08-19-ui-ux-redesign-design.md`: Poppins headings, Inter body, brand blue buttons, soft shadows/rounded cards, terracotta only on badges/keyword/gallery-delete-confirm CTA, dark-navy footer with legible white text.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles.scss
git commit -m "chore(design): remove deprecated icon-color/danger-color tokens"
```
