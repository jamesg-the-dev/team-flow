import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';
import { DEFAULT_USER } from '@shared/mocks/user.mock';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly _session = signal<Session | null>(null);
  private readonly _initialized = signal(false);

  readonly session = this._session.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null);

  constructor() {
    this.supabase.client.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._initialized.set(true);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
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
    await this.supabase.client.auth.getSession();
    this._initialized.set(true);
  }
}
