import { Component, Input, OnChanges, SimpleChanges, isDevMode } from '@angular/core';
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
export class DynamicIconComponent implements OnChanges {
  @Input() faClass: string = '';
  resolvedIcon: LucideIconData = FALLBACK_ICON;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['faClass']) return;
    this.resolvedIcon = this.resolveIcon(this.faClass);
  }

  private resolveIcon(faClass: string): LucideIconData {
    const token = faClass
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.replace(/^fa-/, ''))
      .find((part) => !['solid', 'regular', 'brands', 'light', 'thin', 'duotone'].includes(part));

    if (!token) {
      return FALLBACK_ICON;
    }

    const resolved = FA_TO_LUCIDE[token];
    if (!resolved) {
      if (isDevMode()) {
        console.warn(`[DynamicIconComponent] No Lucide mapping for icon "${token}" (raw: "${faClass}")`);
      }
      return FALLBACK_ICON;
    }
    return resolved;
  }
}
