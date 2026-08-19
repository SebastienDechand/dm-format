# Refonte UI/UX — DM Format

Date: 2026-08-19
Branche: `redesign`
Statut: approuvé, prêt pour plan d'implémentation

## Contexte

DM Format est un centre de formation SST (Sauveteur Secouriste du Travail).
Ce document cadre la refonte visuelle du site public (Angular, `frontend/`),
premier sous-chantier du chantier plus large "refonte du site" (qui inclut
aussi : page admin dédiée, SEO, accessibilité, migration Angular 19→21 avec
signals/store, migration icônes vers Lucide, performance — chacun traité
séparément).

**Contrainte non négociable** : identité "blanc et bleu" conservée, couleur
de marque `#316095` inchangée.

**Tonalité retenue** : rassurant & humain (plutôt qu'institutionnel/corporate)
— cohérent avec un centre de formation qui met en avant l'accompagnement
humain et les formateurs.

Toutes les décisions ci-dessous ont été validées via des maquettes
comparatives (compagnon visuel de brainstorming) avant rédaction de cette
spec.

## Design tokens

### Typographie

- Titres : **Poppins** (600, 700)
- Texte courant : **Inter** (400, 500, 600)
- Remplace Roboto partout (styles.scss, `index.html`, meta/CDN Google Fonts)

### Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--primary` | `#316095` | Couleur de marque, boutons primaires, liens, header du logo |
| `--primary-dark` | `#0f2942` | Titres foncés, fonds sombres (bandeaux CTA, footer) |
| `--primary-tint` | `#e7eef5` | Fonds de carte, zones douces |
| `--accent` | `#e07856` | Terracotta — usage **minimal** : badges, mot-clé mis en avant, CTA secondaire sur fond sombre |
| `--accent-tint` | `#fdece5` | Fond des badges accent |
| Texte fort | `#0f2942` | — |
| Texte secondaire | `#5a6a78` | Remplace le gris froid actuel `#696969` |

Règle d'usage de l'accent : jamais sur un CTA principal ni un fond de carte
par défaut — réservé aux badges et à un point de couleur ponctuel. Le bleu
reste la couleur dominante du site.

Nettoyage à faire : les couleurs sémantiques actuelles sont incohérentes
(`--danger-color: #abc1db` est bleu clair — résidu de bug) et `--icon-color:
#dc3545` (rouge) n'a plus de raison d'être. À redéfinir proprement : succès
vert sobre, alerte ambre, erreur rouge — sans dominer la palette.

### Formes

- Rayon de bordure : ~10px (cartes), ~7–8px (boutons, badges, inputs)
- Élévation : ombre légère `0 4px 16px rgba(15, 41, 66, 0.08)` à la place des
  bordures grises
- Pas de coins vifs, pas d'arrondi prononcé (le "très arrondi" a été écarté)

### Espacements & tailles

- Étendre l'échelle actuelle (`--margin-big/medium/small`,
  `--padding-big/medium/small`) vers une échelle plus fine, base 4/8px
- Convertir les tailles de police fixes en px vers `rem`, avec une échelle
  responsive (`clamp()`) plutôt que des jeux de valeurs desktop/mobile
  dupliqués — objectif : respecter le zoom navigateur (accessibilité) et
  réduire la duplication

## Composants

- **Boutons** : primaire = fond bleu plein / texte blanc ; secondaire =
  contour bleu, fond transparent ("ghost"). L'accent terracotta n'est jamais
  un style de bouton par défaut, seulement un CTA ponctuel sur bandeau sombre.
- **Cartes** (formations, témoignages, galerie) : fond blanc ou
  `--primary-tint`, ombre douce, pas de bordure grise. Badge terracotta en
  en-tête pour catégoriser (Certifiant / Recyclage / Formateur).
- **Icônes → Lucide** (migration confirmée dans le chantier global, hors
  scope d'exécution ici) : remplace `mat-icon` et Font Awesome. Le style à
  traits fins de Lucide est cohérent avec le langage "doux" retenu. Couleur
  par défaut `--primary` ou `--primary-dark`.
- **Header/nav** : reste fixe en haut, fond blanc, ombre légère au scroll
  plutôt que bordure. Logo `DM` bleu à gauche.
- **Footer** : fond `--primary-dark`, texte blanc/gris clair — clôt les
  pages sur une note posée, cohérente avec le bandeau CTA.
- **Formulaires** (contact, admin) : inputs à rayon doux assorti aux cartes,
  focus visible bleu.

## Calage par page

- **Accueil** : bannière (hero) → certification/Qualiopi → programmes
  (cartes) → partenaires → galerie. Le bandeau CTA (`--primary-dark` +
  accent terracotta ponctuel) remplace le bloc certification isolé actuel
  comme clôture de page, avant le footer.
- **À propos / Organisation / Contact / Détail formation** : même langage
  visuel (cartes douces, badges terracotta, boutons bleus) appliqué à la
  structure existante — pas de réarchitecture de l'ordre des sections à ce
  stade, sauf besoin identifié en cours de route.
- **Mode admin** : aujourd'hui l'édition est **inline** sur les pages
  publiques (`editable-image`, `edit-button`, `admin-toggle`, bouton
  "Sauvegarder" flottant). Le chantier séparé "page admin dédiée" retire
  cette édition-en-place au profit d'une interface admin autonome, qui
  réutilisera ces mêmes tokens (fond `--primary-tint` ou neutre clair,
  cartes de contenu, actions en bleu). La bascule technique (routing,
  formulaires) n'est pas traitée ici — cette spec fournit le langage visuel
  que la future page admin devra suivre.

## Accessibilité

- Contraste : `--accent` (#e07856) sur blanc passe en AA pour du texte
  large/gras mais est limite en texte normal → réservé aux badges (texte
  accent sur fond `--accent-tint`, contraste correct), jamais en texte fin
  sur fond blanc.
- Focus visible (anneau bleu) obligatoire sur tous les éléments interactifs,
  y compris les futures icônes Lucide cliquables.
- Passage px → rem pour respecter le zoom navigateur.
- Icônes Lucide décoratives en `aria-hidden` ; icônes porteuses de sens avec
  label accessible.
- Un audit a11y complet (contraste global, navigation clavier, ARIA sur
  galerie/carousel/modales) reste un chantier séparé du scope global — cette
  refonte pose des bases saines (contraste, focus, unités) sans s'y
  substituer.

## Implémentation Angular

- Étendre `:root` dans `frontend/src/styles.scss` : ajouter les nouveaux
  tokens (`--primary-dark`, `--primary-tint`, `--accent`, `--accent-tint`,
  échelle d'espacement/rayon/ombre) à côté des tokens existants, remplacer
  les valeurs obsolètes (`--icon-color`, `--danger-color`).
- `frontend/src/index.html` : lien Google Fonts Roboto → Poppins + Inter.
  Le lien Font Awesome CDN est retiré progressivement à mesure que les
  icônes migrent vers Lucide (chantier icônes séparé, pas exécuté ici).
- Angular Material reste utilisé pour certains composants fonctionnels
  (menu, snackbar) — on les fait correspondre au nouveau langage via
  `mat-*-overrides` (pattern déjà en place dans `styles.scss`) plutôt que de
  les retirer. Le retrait éventuel de Material relève du chantier Angular
  19→21.
- Chaque `*.component.scss` migre vers les nouveaux tokens plutôt que des
  couleurs/tailles en dur, composant par composant au fil du travail — pas
  de réécriture globale d'un coup.

## Hors scope (traité dans d'autres sous-chantiers)

- Construction effective de la page admin dédiée (routing, formulaires)
- Migration des icônes Font Awesome/Material vers Lucide
- Audit et mise aux normes d'accessibilité complet
- Migration Angular 19 → 21 (signals, store, effects)
- Travaux de performance (bundle, SSR, libs tierces à retirer)
