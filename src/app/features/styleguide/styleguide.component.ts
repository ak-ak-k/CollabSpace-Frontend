import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeMode, ThemePreference, ThemeState } from '../../core/state/theme.state';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { TabItem, TabsComponent } from '../../shared/ui/tabs/tabs.component';
import { FoundationsComponent } from './foundations/foundations.component';
import { DisplaySectionComponent } from './sections/display-section/display-section.component';
import { FormsSectionComponent } from './sections/forms-section/forms-section.component';
import { OverlaysSectionComponent } from './sections/overlays-section/overlays-section.component';
import { PrimitivesSectionComponent } from './sections/primitives-section/primitives-section.component';

interface PreferenceOption {
  readonly value: ThemePreference;
  readonly label: string;
}

const SECTIONS: readonly TabItem[] = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'primitives', label: 'Buttons and avatars' },
  { id: 'forms', label: 'Forms' },
  { id: 'display', label: 'Display' },
  { id: 'overlays', label: 'Overlays' },
];

@Component({
  selector: 'app-styleguide',
  imports: [
    RouterLink,
    IconComponent,
    TabsComponent,
    FoundationsComponent,
    PrimitivesSectionComponent,
    FormsSectionComponent,
    DisplaySectionComponent,
    OverlaysSectionComponent,
  ],
  templateUrl: './styleguide.component.html',
  styleUrl: './styleguide.component.scss',
})
export class StyleguideComponent {
  protected readonly theme = inject(ThemeState);
  protected readonly sections = SECTIONS;
  protected readonly section = signal('foundations');
  protected readonly panels: readonly ThemeMode[] = ['light', 'dark'];
  protected readonly preferences: readonly PreferenceOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];
}
