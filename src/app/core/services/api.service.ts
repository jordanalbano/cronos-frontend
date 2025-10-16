import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    this.logRequest('GET', path, params);
    return this.http.get<T>(`${this.baseUrl}${path}`, { params });
  }

  post<T>(path: string, body: object = {}): Observable<T> {
    this.logRequest('POST', path, body);
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: object = {}): Observable<T> {
    this.logRequest('PUT', path, body);
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    this.logRequest('DELETE', path);
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }

  private logRequest(method: string, path: string, data?: any): void {
    if (environment.debug) {
      console.log(`[ApiService] -> ${method}: ${this.baseUrl}${path}`, data || '');
    }
  }
}
