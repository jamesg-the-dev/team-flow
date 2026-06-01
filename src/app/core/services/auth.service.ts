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

  constructor() {
    this.supabase.client.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._initialized.set(true);
      if (data.session) {
        void this.fetchProfile().catch(() => this._profile.set(null));
      }
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      if (session) {
        void this.fetchProfile().catch(() => this._profile.set(null));
      } else {
        this._profile.set(null);
      }
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
    const { data } = await this.supabase.client.auth.getSession();
    this._session.set(data.session);
    this._initialized.set(true);
    if (data.session) {
      try {
        await this.fetchProfile();
      } catch {
        this._profile.set(null);
      }
    }
  }

  private async fetchProfile(): Promise<void> {
    const profile = await firstValueFrom(this.meApi.getProfile());
    this._profile.set(profile ?? null);
  }
}
