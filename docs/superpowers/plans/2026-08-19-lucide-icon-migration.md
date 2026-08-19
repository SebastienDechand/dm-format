# Lucide Icon Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every Font Awesome and Angular Material icon usage in the DM Format Angular site with `lucide-angular`, including the icon names driven by admin-edited page content stored in the database.

**Architecture:** `lucide-angular` icons are imported individually (PascalCase icon objects) and registered per-component via `LucideAngularModule.pick({ IconOne, IconTwo })` in each standalone component's `imports` array — the same per-component-imports pattern this codebase already uses everywhere. Static template icons become `<lucide-icon name="kebab-case-name" />`. The five content-driven icon spots (Organisation ×3, About ×2) route through one new shared `DynamicIconComponent` that normalizes the stored Font Awesome class string and resolves it against a fixed lookup table, with a fallback icon for anything unmapped.

**Tech Stack:** Angular 19 (standalone components), `lucide-angular@1.0.0` (already installed — verified compatible with `@angular/core` `13.x`–`21.x`).

**Spec:** `frontend/docs/superpowers/specs/2026-08-19-lucide-icon-migration-design.md`

## Global Constraints

- `lucide-angular@1.0.0` is already in `package.json` (installed during spec verification). Every icon name below was checked against `node_modules/lucide-angular/icons/*.d.ts` — use the exact names given, do not guess or substitute.
- Default Lucide styling (stroke-width 2, `currentColor`) is kept as-is — no custom size/stroke overrides unless a task says so.
- `MatIconModule` is removed from a component's `imports` array only when that component has zero remaining `<mat-icon>` usages. Other Angular Material modules (`MatButtonModule`, `MatCardModule`, etc.) are NOT touched — out of scope.
- `npm run lint` is broken at this repo's baseline for an unrelated, pre-existing reason (ESLint config migration) — every task's verification gate is `npm run build` passing, not lint.
- No automated test suite exists in this repo (zero `.spec.ts` files) — verification is build-pass plus careful diff review, not test runs.
- All commits happen on the existing `redesign` branch (already checked out). Do NOT add a "Co-Authored-By" trailer to any commit message.

---

## Task 1: Install dependency and build the dynamic-icon component

**Files:**
- Modify: `frontend/package.json`, `frontend/package-lock.json` (already updated by `npm install lucide-angular@1.0.0` — verify present, do not re-run unless missing)
- Create: `frontend/src/app/components/dynamic-icon/dynamic-icon.component.ts`
- Create: `frontend/src/app/components/dynamic-icon/dynamic-icon.component.html`

**Interfaces:**
- Produces: `DynamicIconComponent` (selector `app-dynamic-icon`), standalone, with `@Input() faClass: string = ''`. Used by Task 8 in `organisation.component.html` and `about.component.html`.

- [ ] **Step 1: Verify the dependency**

Run: `npm ls lucide-angular` (from `frontend/`)
Expected: prints `lucide-angular@1.0.0`. If missing, run `npm install lucide-angular@1.0.0 --save`.

- [ ] **Step 2: Create the dynamic icon component**

Create `frontend/src/app/components/dynamic-icon/dynamic-icon.component.ts`:

```typescript
import { Component, Input } from '@angular/core';
import {
  LucideAngularModule,
  Presentation,
  Users,
  Shield,
  Accessibility,
  Clock,
  ClipboardCheck,
  UserCheck,
  CircleCheckBig,
  PhoneCall,
  CircleQuestionMark,
  File,
  Hourglass,
  CalendarDays,
  Briefcase,
  GraduationCap,
  CreditCard,
  Banknote,
  HeartPulse,
} from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';

const FA_TO_LUCIDE: Record<string, LucideIconData> = {
  'chalkboard-teacher': Presentation,
  users: Users,
  shield: Shield,
  wheelchair: Accessibility,
  clock: Clock,
  'clipboard-check': ClipboardCheck,
  'user-check': UserCheck,
  'circle-check': CircleCheckBig,
  'phone-volume': PhoneCall,
  'circle-question': CircleQuestionMark,
  file: File,
  'hourglass-half': Hourglass,
  'calendar-days': CalendarDays,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  'credit-card': CreditCard,
  'sack-dollar': Banknote,
  'heart-pulse': HeartPulse,
};

const FALLBACK_ICON = CircleQuestionMark;

@Component({
  selector: 'app-dynamic-icon',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './dynamic-icon.component.html',
})
export class DynamicIconComponent {
  @Input() faClass: string = '';

  get icon(): LucideIconData {
    const token = this.faClass
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.replace(/^fa-/, ''))
      .find((part) => !['solid', 'regular', 'brands', 'light', 'thin', 'duotone'].includes(part));

    if (!token) {
      return FALLBACK_ICON;
    }

    const resolved = FA_TO_LUCIDE[token];
    if (!resolved) {
      console.warn(`[DynamicIconComponent] No Lucide mapping for icon "${token}" (raw: "${this.faClass}")`);
      return FALLBACK_ICON;
    }
    return resolved;
  }
}
```

Create `frontend/src/app/components/dynamic-icon/dynamic-icon.component.html`:

```html
<lucide-icon [img]="icon"></lucide-icon>
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expect PASS. TypeScript will fail to compile if any imported icon name doesn't exist in `lucide-angular` — treat that as a signal to re-check the name against `node_modules/lucide-angular/icons/*.d.ts`, not to remove the mapping.

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/app/components/dynamic-icon
git commit -m "feat(icons): add lucide-angular and the dynamic FA-to-Lucide icon component"
```

---

## Task 2: Header and footer

**Files:**
- Modify: `frontend/src/app/components/header/header.component.ts`, `frontend/src/app/components/header/header.component.html`
- Modify: `frontend/src/app/components/footer/footer.component.ts`, `frontend/src/app/components/footer/footer.component.html`

- [ ] **Step 1: Header — replace the two `mat-icon` usages**

In `frontend/src/app/components/header/header.component.ts`, replace:
```typescript
import { MatIconModule } from '@angular/material/icon';
```
Remove this line entirely (no other icon import needed — `mat-icon-button` from `MatButtonModule` is untouched and stays).

In the `imports: [...]` array, remove `MatIconModule` from the list and add `LucideAngularModule.pick({ Menu, X })`. Add the import at the top of the file:
```typescript
import { LucideAngularModule, Menu, X } from 'lucide-angular';
```

In `frontend/src/app/components/header/header.component.html`:
- Line ~50: `<mat-icon>menu</mat-icon>` → `<lucide-icon name="menu"></lucide-icon>`
- Line ~101: `<mat-icon>close</mat-icon>` → `<lucide-icon name="x"></lucide-icon>`

(Both are inside `<button mat-icon-button (click)="...">` wrappers — leave those buttons untouched.)

- [ ] **Step 2: Footer — replace all Font Awesome icons**

In `frontend/src/app/components/footer/footer.component.ts`, add the import:
```typescript
import { LucideAngularModule, MapPin, Globe, Lock, Phone, Mail, Scale } from 'lucide-angular';
```
Add `LucideAngularModule.pick({ MapPin, Globe, Lock, Phone, Mail, Scale })` to the component's `imports: [...]` array (read the file first to find its current imports array — it may not currently import `MatIconModule` at all, in which case this is a pure addition).

In `frontend/src/app/components/footer/footer.component.html`, replace each Font Awesome `<i class="fa-solid fa-xxx">` with `<lucide-icon name="kebab-name"></lucide-icon>`, preserving whatever wrapping element/classes surround the `<i>` tag:
- Line ~17: `fa-location-dot` → `map-pin`
- Line ~23: `fa-earth-europe` → `globe`
- Line ~35: `fa-lock` → `lock`
- Line ~44: `fa-phone` → `phone`
- Line ~60: `fa-envelope` → `mail`
- Line ~69: `fa-scale-balanced` → `scale`

Also check `frontend/src/app/components/footer/footer.component.scss` around line 104 — it references `fa-lock` inside a CSS selector (not a template icon), e.g. `i.fa-lock { ... }` or similar. Read the surrounding rule and update the selector to target whatever the new Lucide icon element/class is (Lucide's `<lucide-icon>` renders as a custom element — you can target it via a wrapping class already on the icon's parent, or add a class to the `<lucide-icon>` element itself via its `class` input, e.g. `<lucide-icon name="lock" class="lock-icon"></lucide-icon>` and update the SCSS selector to `.lock-icon`). Use your judgment to preserve the existing visual styling with minimal SCSS changes.

- [ ] **Step 3: Verify**

Run: `npm run build` — expect PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/header frontend/src/app/components/footer
git commit -m "feat(icons): migrate header and footer to lucide-angular"
```

---

## Task 3: Calendar, testimonial dialog, and login

**Files:**
- Modify: `frontend/src/app/components/calendar/calendar.component.ts`, `frontend/src/app/components/calendar/calendar.component.html`
- Modify: `frontend/src/app/components/testimonial-dialog/testimonial-dialog.component.ts`, `frontend/src/app/components/testimonial-dialog/testimonial-dialog.component.html`
- Modify: `frontend/src/app/components/login/login.component.ts`, `frontend/src/app/components/login/login.component.html`

- [ ] **Step 1: Calendar**

`calendar.component.html` has three `<mat-icon>` usages (read the file to find them — approximate locations from the design spec: a close icon, an `event` icon, and a `refresh` icon):
- `<mat-icon>close</mat-icon>` → `<lucide-icon name="x"></lucide-icon>` (two occurrences — this icon appears twice in the file, both should be replaced)
- `<mat-icon>event</mat-icon>` → `<lucide-icon name="calendar"></lucide-icon>`
- `<mat-icon>refresh</mat-icon>` → `<lucide-icon name="refresh-cw"></lucide-icon>`

In `calendar.component.ts`: remove `MatIconModule` import and from `imports: [...]` if present (check first — it may already only import what it needs), add:
```typescript
import { LucideAngularModule, X, Calendar, RefreshCw } from 'lucide-angular';
```
and `LucideAngularModule.pick({ X, Calendar, RefreshCw })` to `imports: [...]`.

- [ ] **Step 2: Testimonial dialog**

`testimonial-dialog.component.html` line ~12: `<mat-icon>close</mat-icon>` → `<lucide-icon name="x"></lucide-icon>`.

In `testimonial-dialog.component.ts`: remove `MatIconModule`, add:
```typescript
import { LucideAngularModule, X } from 'lucide-angular';
```
and `LucideAngularModule.pick({ X })` to `imports: [...]`.

- [ ] **Step 3: Login**

`login.component.html` line ~38-40 has a dynamic interpolated icon:
```html
<mat-icon>{{
  hidePassword ? 'visibility_off' : 'visibility'
}}</mat-icon>
```
This can't become a simple `name="..."` string swap in the template alone, since it's a ternary — replace with an Angular `*ngIf`/`@if` pair (check whether this codebase's Angular version/style uses `*ngIf` or the newer `@if` control-flow syntax — grep `login.component.html` and a couple of neighboring templates for which one is already in use, and match it):

If using `*ngIf`:
```html
<lucide-icon *ngIf="!hidePassword" name="eye"></lucide-icon>
<lucide-icon *ngIf="hidePassword" name="eye-off"></lucide-icon>
```
If using `@if`:
```html
@if (!hidePassword) {
  <lucide-icon name="eye"></lucide-icon>
} @else {
  <lucide-icon name="eye-off"></lucide-icon>
}
```

In `login.component.ts`: remove `MatIconModule`, add:
```typescript
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Eye, EyeOff })` to `imports: [...]`.

- [ ] **Step 4: Verify**

Run: `npm run build` — expect PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/components/calendar frontend/src/app/components/testimonial-dialog frontend/src/app/components/login
git commit -m "feat(icons): migrate calendar, testimonial dialog, and login to lucide-angular"
```

---

## Task 4: Contact page

**Files:**
- Modify: `frontend/src/app/pages/contact/contact.component.ts`, `frontend/src/app/pages/contact/contact.component.html`

- [ ] **Step 1: Replace all Font Awesome icons**

In `contact.component.ts`, add:
```typescript
import { LucideAngularModule, Clock, Building2, User, Mail, Phone, MessageCircle, Send, House, Lock } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Clock, Building2, User, Mail, Phone, MessageCircle, Send, House, Lock })` to `imports: [...]`.

In `contact.component.html`, replace each `<i class="fa-solid fa-xxx">` with `<lucide-icon name="kebab-name"></lucide-icon>`:
- Line ~14: `fa-building` → `building-2`
- Line ~33: `fa-user` → `user`
- Line ~52: `fa-envelope` → `mail`
- Line ~71: `fa-phone` → `phone`
- Line ~89: `fa-message` → `message-circle`
- Line ~107: `fa-paper-plane` → `send`
- Line ~119: `fa-house` → `house`
- Line ~127: `fa-phone` → `phone`
- Line ~135: `fa-lock` → `lock`
- Line ~157: `fa-envelope` → `mail`
- Line ~162: `fa-clock` → `clock`

(Several icons repeat — `phone`, `envelope`/`mail` each appear twice; use the same Lucide name both times.)

- [ ] **Step 2: Verify**

Run: `npm run build` — expect PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/pages/contact
git commit -m "feat(icons): migrate contact page to lucide-angular"
```

---

## Task 5: Gallery, editable-image, edit-button, admin-toggle

**Files:**
- Modify: `frontend/src/app/components/gallery/gallery.component.ts`, `frontend/src/app/components/gallery/gallery.component.html`
- Modify: `frontend/src/app/components/editable-image/editable-image.component.ts`, `frontend/src/app/components/editable-image/editable-image.component.html`
- Modify: `frontend/src/app/components/edit-button/edit-button.component.ts`, `frontend/src/app/components/edit-button/edit-button.component.html`
- Modify: `frontend/src/app/components/admin-toggle/admin-toggle.component.ts`, `frontend/src/app/components/admin-toggle/admin-toggle.component.html`

- [ ] **Step 1: Gallery**

In `gallery.component.ts`, add:
```typescript
import { LucideAngularModule, Trash2, X, Upload } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Trash2, X, Upload })` to `imports: [...]`.

In `gallery.component.html`:
- Line ~28: `fa-trash-can` → `trash-2`
- Line ~47: `fa-trash-can` → `trash-2`
- Line ~57: `fa-xmark` → `x`
- Line ~67: `fa-upload` → `upload`

- [ ] **Step 2: Editable-image**

In `editable-image.component.ts`, add:
```typescript
import { LucideAngularModule, LoaderCircle, Camera } from 'lucide-angular';
```
and `LucideAngularModule.pick({ LoaderCircle, Camera })` to `imports: [...]`.

In `editable-image.component.html`:
- Line ~11: `<i class="fa-solid fa-spinner fa-spin">` (or similar — read the file, the classes may be split across attributes) → `<lucide-icon name="loader-circle" class="spin-icon"></lucide-icon>`. Font Awesome's `fa-spin` class applied a CSS rotation animation that no longer exists once the `fa-spin` class is gone — add a small CSS rule to `editable-image.component.scss` to replace it:
  ```scss
  .spin-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  ```
- Line ~14: `fa-camera` → `camera`

- [ ] **Step 3: Edit-button**

In `edit-button.component.ts`, add:
```typescript
import { LucideAngularModule, Pen } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Pen })` to `imports: [...]`.

In `edit-button.component.html` line ~2: `fa-pen` → `pen`.

- [ ] **Step 4: Admin-toggle**

In `admin-toggle.component.ts`, add:
```typescript
import { LucideAngularModule, User, ShieldUser } from 'lucide-angular';
```
and `LucideAngularModule.pick({ User, ShieldUser })` to `imports: [...]`.

In `admin-toggle.component.html`, there are two occurrences (lines ~3 and ~10) of:
```html
<i class="fa-solid" [ngClass]="(isAdmin$ | async) ? 'fa-user' : 'fa-user-shield'"></i>
```
Replace each with an `*ngIf`/`@if` pair matching the template syntax already used elsewhere in this file (check which one — `*ngIf` or `@if`):
```html
<lucide-icon *ngIf="isAdmin$ | async" name="user"></lucide-icon>
<lucide-icon *ngIf="!(isAdmin$ | async)" name="shield-user"></lucide-icon>
```
(If using the `async` pipe twice like this causes a double-subscription concern, an equally correct alternative is to keep a single `*ngIf="isAdmin$ | async as isAdmin"` on a wrapping element and reference `isAdmin` in both branches — use whichever fits the surrounding template more naturally.)

- [ ] **Step 5: Verify**

Run: `npm run build` — expect PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/components/gallery frontend/src/app/components/editable-image frontend/src/app/components/edit-button frontend/src/app/components/admin-toggle
git commit -m "feat(icons): migrate gallery, editable-image, edit-button, admin-toggle to lucide-angular"
```

---

## Task 6: Program-detail and home

**Files:**
- Modify: `frontend/src/app/pages/program-detail/program-detail.component.ts`, `frontend/src/app/pages/program-detail/program-detail.component.html`
- Modify: `frontend/src/app/pages/home/home.component.ts`, `frontend/src/app/pages/home/home.component.html`

- [ ] **Step 1: Program-detail**

In `program-detail.component.ts`, add:
```typescript
import { LucideAngularModule, Clock, Check, Users, Save } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Clock, Check, Users, Save })` to `imports: [...]`.

In `program-detail.component.html`:
- Line ~63: `fa-clock` → `clock`
- Line ~81: `fa-check` → `check`
- Line ~101: `fa-people-group` → `users`
- Line ~339: `fa-floppy-disk` → `save`

- [ ] **Step 2: Home**

In `home.component.ts`, add:
```typescript
import { LucideAngularModule, Save } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Save })` to `imports: [...]`.

In `home.component.html` line ~20: `fa-floppy-disk` → `save`.

- [ ] **Step 3: Verify**

Run: `npm run build` — expect PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/pages/program-detail frontend/src/app/pages/home
git commit -m "feat(icons): migrate program-detail and home to lucide-angular"
```

---

## Task 7: Training testimonials

**Files:**
- Modify: `frontend/src/app/components/training-testimonials/training-testimonials.component.ts`, `frontend/src/app/components/training-testimonials/training-testimonials.component.html`

- [ ] **Step 1: Replace the three Font Awesome icons**

In `training-testimonials.component.ts`, add:
```typescript
import { LucideAngularModule, Trash2, ShieldCheck, Shield } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Trash2, ShieldCheck, Shield })` to `imports: [...]`.

In `training-testimonials.component.html`:
- Line ~45: `fa-trash-can` → `trash-2`
- Line ~141: `fa-shield-check` → `shield-check`
- Line ~161: `fa-shield` → `shield`

- [ ] **Step 2: Verify**

Run: `npm run build` — expect PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/components/training-testimonials
git commit -m "feat(icons): migrate training-testimonials to lucide-angular"
```

---

## Task 8: Organisation and About — static icons plus the dynamic-icon wiring

**Files:**
- Modify: `frontend/src/app/pages/organisation/organisation.component.ts`, `frontend/src/app/pages/organisation/organisation.component.html`
- Modify: `frontend/src/app/pages/about/about.component.ts`, `frontend/src/app/pages/about/about.component.html`

**Interfaces:**
- Consumes: `DynamicIconComponent` (`app-dynamic-icon`, `@Input() faClass`) from Task 1.

- [ ] **Step 1: Organisation — static icons**

In `organisation.component.ts`, add:
```typescript
import { LucideAngularModule, GraduationCap, Save } from 'lucide-angular';
```
and `LucideAngularModule.pick({ GraduationCap, Save })` to `imports: [...]`. Also add the shared component:
```typescript
import { DynamicIconComponent } from '../../components/dynamic-icon/dynamic-icon.component';
```
and add `DynamicIconComponent` to `imports: [...]`.

In `organisation.component.html`:
- Line ~285: `fa-graduation-cap` → `<lucide-icon name="graduation-cap"></lucide-icon>`
- Line ~559: `fa-floppy-disk` → `<lucide-icon name="save"></lucide-icon>`

- [ ] **Step 2: Organisation — dynamic icons**

In `organisation.component.html`, there are three occurrences of a content-driven icon:
- Line ~185: `<i class="fa-solid" [ngClass]="point.icon"></i>` → `<app-dynamic-icon [faClass]="point.icon"></app-dynamic-icon>`
- Line ~365: `<i class="fa-solid" [ngClass]="point.icon"></i>` → `<app-dynamic-icon [faClass]="point.icon"></app-dynamic-icon>`
- Line ~533: `[ngClass]="step.icon"` (read the surrounding lines — this one may already be split across a multi-line `<i>` tag with a separate `class="fa-solid"`) → replace the whole `<i>` element with `<app-dynamic-icon [faClass]="step.icon"></app-dynamic-icon>`

- [ ] **Step 3: About — static and dynamic icons**

In `about.component.ts`, add:
```typescript
import { LucideAngularModule, Save } from 'lucide-angular';
```
and `LucideAngularModule.pick({ Save })` to `imports: [...]`. Also add `DynamicIconComponent` (same import as Step 1) to `imports: [...]`.

In `about.component.html`:
- Line ~126: `<i class="fa-solid" [ngClass]="step.icon"></i>` → `<app-dynamic-icon [faClass]="step.icon"></app-dynamic-icon>`
- Line ~349: `<i class="fa-solid" [ngClass]="risk.icon"></i>` → `<app-dynamic-icon [faClass]="risk.icon"></app-dynamic-icon>`
- Line ~399: `fa-floppy-disk` → `<lucide-icon name="save"></lucide-icon>` (this one needs `LucideAngularModule` too, already added above)

Note: `about.component.html` also has a `who_we_are.icon` field in the page data (`"fa-solid fa-users"`, full-class format) — check whether the template actually renders it anywhere (grep `who_we_are.icon` in `about.component.html`). If it's rendered, route it through `<app-dynamic-icon [faClass]="...">` the same way; `DynamicIconComponent`'s normalization already strips the `fa-solid`/`fa-regular`/etc. prefix regardless of which format the stored string uses, so no special-casing is needed. If it isn't rendered anywhere in the template, no action needed for that field.

- [ ] **Step 4: Verify**

Run: `npm run build` — expect PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/pages/organisation frontend/src/app/pages/about
git commit -m "feat(icons): migrate organisation and about pages, wire up dynamic icon resolution"
```

---

## Task 9: Cleanup and final verification

**Files:**
- Modify: `frontend/src/index.html`

- [ ] **Step 1: Confirm no Font Awesome or Material Icon usage remains**

Run (from `frontend/`):
```bash
grep -rn "fa-solid\|fa-regular\|fa-brands\|class=\"fa" src/app
grep -rn "<mat-icon" src/app
grep -rn "MatIconModule" src/app
```
Expected: all three commands print nothing. If any prints a match, go back and migrate that occurrence using the same rules as Tasks 2–8 before continuing — do not remove the CDN links or `MatIconModule` while something still depends on them.

- [ ] **Step 2: Remove the Font Awesome CDN link**

In `frontend/src/index.html`, remove:
```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css"
/>
```

- [ ] **Step 3: Remove the Material Icons font link, if safe**

Run: `grep -rn "MatIconModule" src/app` again (should already be empty per Step 1). If empty, remove from `frontend/src/index.html`:
```html
<link
  href="https://fonts.googleapis.com/icon?family=Material+Icons"
  rel="stylesheet"
/>
```
(This is a separate, safe-to-remove-independently link — Angular Material's non-icon components like `mat-card`/`mat-button` don't depend on this font, only `<mat-icon>` with ligature names did.)

- [ ] **Step 4: Full verification**

Run: `npm run build` — expect PASS with no new errors.
Run the three greps from Step 1 one more time — expect all empty.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/index.html
git commit -m "chore(icons): remove Font Awesome CDN and Material Icons font links"
```
