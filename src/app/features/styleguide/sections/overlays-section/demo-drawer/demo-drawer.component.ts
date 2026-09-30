import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';

export interface DemoDrawerData {
  readonly heading: string;
}

interface DemoDrawerRow {
  readonly title: string;
  readonly detail: string;
}

const ROW_COUNT = 18;

function createRows(): DemoDrawerRow[] {
  return Array.from({ length: ROW_COUNT }, (_, index) => ({
    title: `Shared item ${index + 1}`,
    detail: 'The body scrolls while the header and footer stay in place.',
  }));
}

@Component({
  selector: 'app-styleguide-demo-drawer',
  imports: [ButtonComponent, DrawerComponent],
  templateUrl: './demo-drawer.component.html',
  styleUrl: './demo-drawer.component.scss',
})
export class DemoDrawerComponent {
  private readonly dialogRef = inject(DialogRef);

  protected readonly data = inject<DemoDrawerData>(DIALOG_DATA);
  protected readonly rows = createRows();

  protected close(): void {
    this.dialogRef.close();
  }
}
