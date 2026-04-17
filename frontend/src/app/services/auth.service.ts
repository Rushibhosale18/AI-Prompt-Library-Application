import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthState {
  authenticated: boolean;
  username: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private authState$ = new BehaviorSubject<AuthState>({ authenticated: false, username: null });

  constructor(private http: HttpClient) {
    this.checkSession();
  }

  get authState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, credentials).pipe(
      tap((res: any) => {
        this.authState$.next({ authenticated: true, username: res.user });
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout/`, {}).pipe(
      tap(() => {
        this.authState$.next({ authenticated: false, username: null });
      })
    );
  }

  checkSession(): void {
    this.http.get(`${this.baseUrl}/auth/check/`).subscribe({
      next: (res: any) => {
        this.authState$.next({ authenticated: true, username: res.user });
      },
      error: () => {
        this.authState$.next({ authenticated: false, username: null });
      }
    });
  }
}
