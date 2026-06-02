import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';

import { SupabaseService } from './supabase.service';
import { MeApiService, type UserProfile } from './me-api.service';
import { DEFAULT_USER } from '@shared/mocks/user.mock';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly meApi = inject(MeApiService);

  private readonly _session = signal<Session | null>(null);
  private readonly _initialized = signal(false);
  private readonly _profile = signal<UserProfile | null>(null);

  readonly session = this._session.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null);

  private profileUserId: string | null = null;
  private profileInFlight: Promise<void> | null = null;
  private readonly ready: Promise<void>;

  constructor() {
    this.ready = new Promise<void>(resolve => {
      const { data } = this.supabase.client.auth.onAuthStateChange((_event, session) => {
        this._session.set(session);
        void this.syncProfile(session);
        if (!this._initialized()) {
          this._initialized.set(true);
          resolve();
        }
      });
      void data;
    });
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return data;
  }

  async signUp() {
    return this.signInWithPassword(DEFAULT_USER.email, DEFAULT_USER.password);
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async waitForInit(): Promise<void> {
    if (this._initialized()) {
      return;
    }
    await this.ready;
  }

  private syncProfile(session: Session | null): Promise<void> {
    const userId = session?.user?.id ?? null;
    if (userId === this.profileUserId) {
      return this.profileInFlight ?? Promise.resolve();
    }
    this.profileUserId = userId;
    if (!userId) {
      this._profile.set(null);
      this.profileInFlight = null;
      return Promise.resolve();
    }
    const inflight = this.fetchProfile().catch(() => this._profile.set(null));
    this.profileInFlight = inflight;
    return inflight;
  }

  private async fetchProfile(): Promise<void> {
    const profile = await firstValueFrom(this.meApi.getProfile());
    this._profile.set(profile ?? null);
  }
}
