import {
  Component,
  OnChanges,
  SimpleChanges,
  isDevMode,
  input,
} from '@angular/core';
import {
  LucideDynamicIcon,
  LucidePresentation,
  LucideUsers,
  LucideShield,
  LucideAccessibility,
  LucideClock,
  LucideClipboardCheck,
  LucideUserCheck,
  LucideCircleCheckBig,
  LucidePhoneCall,
  LucideCircleQuestionMark,
  LucideFile,
  LucideHourglass,
  LucideCalendarDays,
  LucideBriefcase,
  LucideGraduationCap,
  LucideCreditCard,
  LucideBanknote,
  LucideHeartPulse,
} from '@lucide/angular';
import type { LucideIcon } from '@lucide/angular';

const FA_TO_LUCIDE: Record<string, LucideIcon> = {
  'chalkboard-teacher': LucidePresentation,
  users: LucideUsers,
  shield: LucideShield,
  wheelchair: LucideAccessibility,
  clock: LucideClock,
  'clipboard-check': LucideClipboardCheck,
  'user-check': LucideUserCheck,
  'circle-check': LucideCircleCheckBig,
  'phone-volume': LucidePhoneCall,
  'circle-question': LucideCircleQuestionMark,
  file: LucideFile,
  'hourglass-half': LucideHourglass,
  'calendar-days': LucideCalendarDays,
  briefcase: LucideBriefcase,
  'graduation-cap': LucideGraduationCap,
  'credit-card': LucideCreditCard,
  'sack-dollar': LucideBanknote,
  'heart-pulse': LucideHeartPulse,
};

const FALLBACK_ICON = LucideCircleQuestionMark;

@Component({
  selector: 'app-dynamic-icon',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './dynamic-icon.component.html',
})
export class DynamicIconComponent implements OnChanges {
  readonly faClass = input<string>('');
  resolvedIcon: LucideIcon = FALLBACK_ICON;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['faClass']) return;
    this.resolvedIcon = this.resolveIcon(this.faClass());
  }

  private resolveIcon(faClass: string): LucideIcon {
    const token = faClass
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.replace(/^fa-/, ''))
      .find(
        (part) =>
          !['solid', 'regular', 'brands', 'light', 'thin', 'duotone'].includes(
            part
          )
      );

    if (!token) {
      return FALLBACK_ICON;
    }

    const resolved = FA_TO_LUCIDE[token];
    if (!resolved) {
      if (isDevMode()) {
        console.warn(
          `[DynamicIconComponent] No Lucide mapping for icon "${token}" (raw: "${faClass}")`
        );
      }
      return FALLBACK_ICON;
    }
    return resolved;
  }
}
