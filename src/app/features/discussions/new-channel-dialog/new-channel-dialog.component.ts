import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { WorkspaceMemberDto } from '@core/services/workspace-members-api.service';
import { ChannelType } from '@shared/models/discussions-api';
import { getInitials } from '@shared/utils/initials';

export interface NewChannelDialogData {
  readonly currentUserId: string | null;
  readonly members: readonly WorkspaceMemberDto[];
}

export type NewChannelResult =
  | { kind: 'channel'; name: string; topic: string | null; type: Exclude<ChannelType, 'Direct'> }
  | { kind: 'dm'; userId: string };

@Component({
  selector: 'app-new-channel-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-channel-dialog.component.html',
  styleUrls: ['./new-channel-dialog.component.scss'],
})
export class NewChannelDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef =
    inject<MatDialogRef<NewChannelDialogComponent, NewChannelResult | undefined>>(MatDialogRef);
  private readonly data = inject<NewChannelDialogData>(MAT_DIALOG_DATA);

  readonly tabIndex = signal(0);

  readonly channelForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    topic: [''],
    type: ['Public' as Exclude<ChannelType, 'Direct'>, Validators.required],
  });

  readonly dmForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
  });

  readonly selectableMembers = computed(() =>
    this.data.members.filter(m => m.userId !== this.data.currentUserId),
  );

  initialsFor(member: WorkspaceMemberDto): string {
    return getInitials(member.fullName ?? member.userId);
  }

  submitChannel(): void {
    if (this.channelForm.invalid) {
      this.channelForm.markAllAsTouched();
      return;
    }
    const { name, topic, type } = this.channelForm.getRawValue();
    this.dialogRef.close({
      kind: 'channel',
      name: name.trim(),
      topic: topic.trim() ? topic.trim() : null,
      type,
    });
  }

  submitDm(): void {
    if (this.dmForm.invalid) {
      this.dmForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ kind: 'dm', userId: this.dmForm.controls.userId.value });
  }
}
