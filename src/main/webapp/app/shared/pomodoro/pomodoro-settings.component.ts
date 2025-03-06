import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PomodoroProfile, PomodoroSettings } from './pomodoro.model';
import { PomodoroStateService } from './pomodoro-state.service';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'jhi-pomodoro-settings',
  templateUrl: './pomodoro-settings.component.html',
  styleUrls: ['./pomodoro-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, NgbTooltipModule, NgbDropdownModule],
})
export class PomodoroSettingsComponent implements OnInit {
  @Output() flipBack = new EventEmitter<boolean>();

  workMinutes = 25;
  workSeconds = 0;
  breakMinutes = 5;
  breakSeconds = 0;
  repeatEnabled = false;
  repeatCount = 0;

  profiles: PomodoroProfile[] = [];
  selectedProfileId?: number;
  editingProfileId?: number;

  private readonly pomodoroStateService = inject(PomodoroStateService);

  ngOnInit(): void {
    // Load current settings
    const settings = this.pomodoroStateService.getSettings();
    this.workMinutes = Math.floor(settings.workTime / 60);
    this.workSeconds = settings.workTime % 60;
    this.breakMinutes = Math.floor(settings.breakTime / 60);
    this.breakSeconds = settings.breakTime % 60;
    this.repeatEnabled = settings.repeatEnabled;
    this.repeatCount = settings.repeatCount;
    this.selectedProfileId = settings.activeProfileId;

    // Load profiles
    this.profiles = this.pomodoroStateService.getProfiles();
  }

  saveSettings(): void {
    const workTime = this.workMinutes * 60 + this.workSeconds;
    const breakTime = this.breakMinutes * 60 + this.breakSeconds;

    const settings: PomodoroSettings = {
      workTime,
      breakTime,
      repeatEnabled: this.repeatEnabled,
      repeatCount: this.repeatCount,
      activeProfileId: this.selectedProfileId,
    };

    // If a profile is selected, update that profile too
    if (this.selectedProfileId) {
      const profileIndex = this.profiles.findIndex(p => p.id === this.selectedProfileId);
      if (profileIndex !== -1) {
        const updatedProfile: PomodoroProfile = {
          ...this.profiles[profileIndex],
          workTime,
          breakTime,
          repeatEnabled: this.repeatEnabled,
          repeatCount: this.repeatCount,
        };
        this.pomodoroStateService.updateProfile(updatedProfile);
      }
    }

    this.pomodoroStateService.updateSettings(settings);
    this.flipBack.emit(true);
  }

  cancel(): void {
    this.flipBack.emit(false);
  }

  selectProfile(profileId: number): void {
    this.selectedProfileId = profileId;
    const profile = this.profiles.find(p => p.id === profileId);

    if (profile) {
      this.workMinutes = Math.floor(profile.workTime / 60);
      this.workSeconds = profile.workTime % 60;
      this.breakMinutes = Math.floor(profile.breakTime / 60);
      this.breakSeconds = profile.breakTime % 60;
      this.repeatEnabled = profile.repeatEnabled;
      this.repeatCount = profile.repeatCount;
    }
  }

  getSelectedProfileName(): string {
    if (this.selectedProfileId) {
      const profile = this.profiles.find(p => p.id === this.selectedProfileId);
      return profile ? profile.name : 'Select Profile';
    }
    return 'Select Profile';
  }

  getProfile(profileId: number): PomodoroProfile {
    const profile = this.profiles.find(p => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    return profile;
  }

  getProfileName(profileId: number): string {
    try {
      return this.getProfile(profileId).name;
    } catch (error) {
      return '';
    }
  }

  startEditingProfile(profileId: number, event: Event): void {
    event.stopPropagation();
    this.editingProfileId = profileId;
  }

  cancelEditing(event: Event): void {
    event.stopPropagation();
    this.editingProfileId = undefined;
  }

  saveProfileName(profile: PomodoroProfile, newName: string, event: Event): void {
    event.stopPropagation();
    if (newName.trim()) {
      this.pomodoroStateService.renameProfile(profile.id, newName);
    }
    this.editingProfileId = undefined;
  }

  handleKeyDown(event: KeyboardEvent, profile: PomodoroProfile, nameInput: HTMLInputElement): void {
    if (event.key === 'Enter') {
      this.saveProfileName(profile, nameInput.value, event);
    } else if (event.key === 'Escape') {
      this.editingProfileId = undefined;
    }
  }
}
