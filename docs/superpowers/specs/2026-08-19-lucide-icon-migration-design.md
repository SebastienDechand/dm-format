# Migration des icônes vers Lucide — DM Format

Date: 2026-08-19
Branche: `redesign`
Statut: approuvé, prêt pour plan d'implémentation

## Contexte

Premier sous-chantier du chantier global (après la refonte visuelle UI/UX,
terminée) dans l'ordre choisi par l'utilisateur : Lucide → migration
Angular 19→21 → accessibilité → page admin → SEO → performance.

Le site utilise aujourd'hui deux systèmes d'icônes en parallèle :
Font Awesome (CDN, `frontend/src/index.html`) et Angular Material Icons
(`<mat-icon>`, police Google Material Icons). Cette migration les remplace
tous les deux par [Lucide](https://lucide.dev) via le package
`lucide-angular` (`1.0.0`, compatible `@angular/core` `13.x`–`21.x` —
vérifié sur le registre npm, donc valable aussi pour le futur chantier de
migration Angular).

## Inventaire (vérifié dans le code et, pour le contenu dynamique, via
l'API backend)

### Icônes statiques (codées en dur dans les templates)

~24 icônes Font Awesome uniques réparties sur 12 fichiers, + 4 icônes
Material uniques sur 4 fichiers (`calendar`, `header`, `testimonial-dialog`,
`login`).

| Fichier(s) | Icône FA/Material | Usage |
|---|---|---|
| program-detail, contact | `fa-clock` | durée / horaires |
| program-detail | `fa-check` | validation |
| program-detail | `fa-people-group` | public visé |
| program-detail, home, organisation, about | `fa-floppy-disk` | bouton sauvegarder (admin) |
| training-testimonials, gallery | `fa-trash-can` | supprimer |
| training-testimonials | `fa-shield-check` | badge vérifié |
| training-testimonials, organisation | `fa-shield` | sécurité |
| footer, contact | `fa-lock` | mentions légales / confidentialité |
| footer | `fa-location-dot` | adresse |
| footer | `fa-earth-europe` | zone d'intervention |
| footer, contact | `fa-phone` | téléphone |
| footer, contact | `fa-envelope` | email |
| footer | `fa-scale-balanced` | mentions légales |
| contact | `fa-building` | entreprise |
| contact | `fa-user` | nom |
| contact | `fa-message` | message |
| contact | `fa-paper-plane` | envoyer |
| contact | `fa-house` | adresse |
| editable-image | `fa-spinner` + `fa-spin` | chargement upload |
| editable-image | `fa-camera` | changer photo |
| gallery | `fa-xmark` | fermer (lightbox) |
| gallery | `fa-upload` | uploader |
| edit-button | `fa-pen` | éditer (admin) |
| admin-toggle | `fa-user` / `fa-user-shield` | bascule visiteur/admin (conditionnel en template, pas en base) |
| calendar, header, testimonial-dialog | `close` (mat-icon) | fermer |
| calendar | `event` (mat-icon) | date |
| calendar | `refresh` (mat-icon) | rafraîchir |
| header | `menu` (mat-icon) | menu mobile |

### Icônes dynamiques (contenu admin stocké en base)

5 emplacements dans `organisation.component.html` (×3) et
`about.component.html` (×2), qui rendent un nom d'icône venant du contenu
(`point.icon`, `step.icon`, `risk.icon`) plutôt que du template. Aucun
champ d'édition visible dans l'éditeur inline actuel pour ce champ — ces
valeurs sont donc stables sauf modification directe en base.

En interrogeant `GET /api/pages/organisation` et `GET /api/pages/about`,
l'ensemble actuel des valeurs (deux formats coexistent en base : suffixe
seul `"fa-users"` ou classe complète `"fa-solid fa-users"`) est :

`fa-chalkboard-teacher`, `fa-users`, `fa-shield`, `fa-wheelchair`,
`fa-clock`, `fa-clipboard-check`, `fa-user-check`, `fa-circle-check`,
`fa-phone-volume`, `fa-circle-question`, `fa-file`, `fa-hourglass-half`,
`fa-calendar-days`, `fa-briefcase`, `fa-graduation-cap`, `fa-credit-card`,
`fa-sack-dollar`, `fa-heart-pulse` — 18 valeurs uniques.

## Architecture

### Icônes statiques

Remplacement direct dans chaque template : `<i class="fa-solid fa-xxx">`
ou `<mat-icon>xxx</mat-icon>` → `<lucide-icon [img]="XxxIcon" [size]="..." />`,
avec un import de l'icône Lucide correspondante dans le composant
(pattern standard `lucide-angular` : chaque icône est importée
individuellement, pas de police/sprite globale — tree-shakable).

### Icônes dynamiques

Un composant partagé `app-dynamic-icon` (nouveau, à créer), qui :
1. Reçoit la chaîne brute stockée en base via un `@Input() faClass: string`.
2. La normalise : retire un éventuel préfixe `fa-solid`/`fa-regular`/
   `fa-brands`, ne garde que le dernier segment `fa-xxx`.
3. Résout ce nom via une table de correspondance fixe (voir ci-dessous)
   vers le composant icône Lucide correspondant.
4. Si le nom n'est dans aucune des deux tables (statique ou dynamique),
   affiche une icône de repli (`circle-help`) et émet un
   `console.warn` en développement, plutôt qu'un trou vide — pour repérer
   une valeur de contenu qui n'existait pas au moment de la migration.

### Table de correspondance FA → Lucide (à vérifier à l'implémentation)

Les noms d'icônes Lucide ci-dessous sont les correspondances les plus
proches identifiées, mais **n'ont pas été vérifiés un par un contre le
jeu d'icônes réellement exporté par `lucide-angular@1.0.0`** (les noms
changent parfois d'une version à l'autre de Lucide). L'implémentation doit
vérifier chaque import et corriger si le nom exact diffère — un import
invalide échoue à la compilation (échec sûr, pas un bug silencieux).

| Font Awesome | Lucide (à vérifier) |
|---|---|
| `fa-clock` | `clock` |
| `fa-check` | `check` |
| `fa-people-group` | `users` (pas d'équivalent exact, groupe générique) |
| `fa-floppy-disk` | `save` |
| `fa-trash-can` | `trash-2` |
| `fa-shield-check` | `shield-check` |
| `fa-shield` | `shield` |
| `fa-lock` | `lock` |
| `fa-location-dot` | `map-pin` |
| `fa-earth-europe` | `globe` |
| `fa-phone` | `phone` |
| `fa-envelope` | `mail` |
| `fa-scale-balanced` | `scale` |
| `fa-building` | `building-2` |
| `fa-user` | `user` |
| `fa-message` | `message-circle` |
| `fa-paper-plane` | `send` |
| `fa-house` | `home` |
| `fa-spinner` (+`fa-spin`) | `loader-2` (rotation en CSS, remplace `fa-spin`) |
| `fa-camera` | `camera` |
| `fa-xmark` | `x` |
| `fa-upload` | `upload` |
| `fa-pen` | `pen` |
| `fa-user-shield` | `shield-user` (à vérifier — sinon `user-cog`) |
| `fa-chalkboard-teacher` | `presentation` (pas d'équivalent exact) |
| `fa-wheelchair` | `accessibility` |
| `fa-clipboard-check` | `clipboard-check` |
| `fa-user-check` | `user-check` |
| `fa-circle-check` | `circle-check-big` (à vérifier — sinon `circle-check`) |
| `fa-phone-volume` | `phone-call` |
| `fa-circle-question` | `circle-help` |
| `fa-file` | `file` |
| `fa-hourglass-half` | `hourglass` |
| `fa-calendar-days` | `calendar-days` |
| `fa-briefcase` | `briefcase` |
| `fa-graduation-cap` | `graduation-cap` |
| `fa-credit-card` | `credit-card` |
| `fa-sack-dollar` | `banknote` (pas d'équivalent exact) |
| `fa-heart-pulse` | `heart-pulse` |
| `close` (mat-icon) | `x` |
| `event` (mat-icon) | `calendar` |
| `refresh` (mat-icon) | `refresh-cw` |
| `menu` (mat-icon) | `menu` |

## Nettoyage

- `frontend/src/index.html` : retrait du `<link>` Font Awesome CDN.
- Retrait de `MatIconModule` des imports de chaque composant qui
  l'utilisait (`calendar`, `header`, `testimonial-dialog`, `login`) —
  Angular Material lui-même n'est pas retiré du projet (mat-card,
  mat-button, etc. restent utilisés ailleurs, hors périmètre de ce
  chantier).
- Le lien Google Fonts "Material Icons" dans `index.html` peut être retiré
  une fois `MatIconModule` supprimé de tous les composants (à vérifier
  qu'aucun autre usage ne subsiste).

## Style

Taille et épaisseur de trait par défaut de Lucide (`stroke-width: 2`)
conservées telles quelles — cohérentes avec le langage visuel "doux" déjà
en place (tokens de la refonte UI/UX). Couleur héritée via `currentColor`
(comportement par défaut de `lucide-angular`), donc les icônes suivent
déjà les tokens de couleur (`--primary-color`, `--secondary-color`, etc.)
appliqués via `color` en CSS sans changement supplémentaire.

## Tests

Aucune suite de tests automatisés n'existe dans ce repo (confirmé lors du
chantier précédent — zéro fichier `.spec.ts`). Vérification par build
(`npm run build`) et revue de code, comme pour la refonte CSS.

## Hors scope

- Le reste d'Angular Material (mat-card, mat-button, mat-dialog, etc.) —
  relève du chantier de migration Angular 19→21.
- Ajout d'un champ d'édition pour le nom d'icône dans l'éditeur inline
  admin (les 5 emplacements dynamiques restent non éditables via l'UI,
  comme aujourd'hui).
- Toute modification du contenu stocké en base.
