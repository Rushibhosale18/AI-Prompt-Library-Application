import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Tag {
  name: string;
}

export interface Prompt {
  id: number;
  title: string;
  complexity: number;
  created_at: string;
  tags: string[];
}

export interface PromptDetail extends Prompt {
  content: string;
  view_count: number;
}

export interface CreatePromptPayload {
  title: string;
  content: string;
  complexity: number;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPrompts(tag?: string): Observable<Prompt[]> {
    let params = new HttpParams();
    if (tag) {
      params = params.set('tag', tag);
    }
    return this.http.get<Prompt[]>(`${this.baseUrl}/prompts/`, { params, withCredentials: true });
  }

  getPrompt(id: number): Observable<PromptDetail> {
    return this.http.get<PromptDetail>(`${this.baseUrl}/prompts/${id}/`, { withCredentials: true });
  }

  createPrompt(data: CreatePromptPayload): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.baseUrl}/prompts/`, data, { withCredentials: true });
  }

  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/tags/`, { withCredentials: true });
  }
}
