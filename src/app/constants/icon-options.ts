// The public site only ever resolves one of these 18 tokens (see
// DynamicIconComponent's FA_TO_LUCIDE map) - anything else silently falls
// back to a question-mark icon. Admin forms must only ever offer this exact
// list, never free text, since there is no way for someone editing content
// to know which arbitrary string happens to be mapped.
export interface IconOption {
  value: string;
  label: string;
}

export const ICON_OPTIONS: IconOption[] = [
  { value: 'chalkboard-teacher', label: 'Formateur' },
  { value: 'users', label: 'Groupe / participants' },
  { value: 'shield', label: 'Sécurité' },
  { value: 'wheelchair', label: 'Accessibilité' },
  { value: 'clock', label: 'Durée / horaire' },
  { value: 'clipboard-check', label: 'Feuille validée' },
  { value: 'user-check', label: 'Personne validée' },
  { value: 'circle-check', label: 'Validation' },
  { value: 'phone-volume', label: 'Téléphone' },
  { value: 'circle-question', label: 'Question' },
  { value: 'file', label: 'Document' },
  { value: 'hourglass-half', label: 'Délai' },
  { value: 'calendar-days', label: 'Date / calendrier' },
  { value: 'briefcase', label: 'Session / mission' },
  { value: 'graduation-cap', label: 'Certification / diplôme' },
  { value: 'credit-card', label: 'Paiement' },
  { value: 'sack-dollar', label: 'Financement' },
  { value: 'heart-pulse', label: 'Premiers secours' },
];
