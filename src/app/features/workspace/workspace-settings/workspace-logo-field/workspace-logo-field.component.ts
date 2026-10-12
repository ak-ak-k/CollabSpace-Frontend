import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { ConnectionGuard } from '../../../../core/services/connection-guard.service';
import { ToastService } from '../../../../core/services/toast.service';
import { WorkspaceAdminState } from '../../../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { logoFileErrorOf } from '../workspace-settings-view';

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

@Component({
  selector: 'app-workspace-logo-field',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './workspace-logo-field.component.html',
  styleUrl: './workspace-logo-field.component.scss',
})
export class WorkspaceLogoFieldComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly toasts = inject(ToastService);
  private readonly connection = inject(ConnectionGuard);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly logoUrl = computed(() => this.workspace.currentWorkspace()?.logoUrl ?? null);
  protected readonly code = computed(() => this.workspace.currentWorkspace()?.code ?? '');
  protected readonly pickLabel = computed(() => (this.logoUrl() ? 'Replace logo' : 'Upload logo'));

  protected pick(): void {
    if (this.connection.allows('setWorkspaceLogo')) {
      this.fileInput().nativeElement.click();
    }
  }

  protected async useFile(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const error = logoFileErrorOf(file.type, file.size);
    if (error) {
      this.toasts.show(error, { icon: 'circle-alert' });
      return;
    }
    const logoUrl = await readAsDataUrl(file);
    if (logoUrl) {
      this.apply(logoUrl);
    }
  }

  protected remove(): void {
    this.apply(null);
  }

  private apply(logoUrl: string | null): void {
    if (!this.connection.allows('setWorkspaceLogo')) {
      return;
    }
    const previous = this.logoUrl();
    const workspaceId = this.workspace.currentWorkspaceId();
    void this.admin.setLogo(logoUrl, workspaceId);
    this.toasts.show(logoUrl ? 'Logo updated' : 'Logo removed', {
      icon: 'image',
      actionLabel: previous ? 'Undo' : undefined,
      onAction: previous ? () => void this.admin.setLogo(previous, workspaceId) : undefined,
    });
  }
}
