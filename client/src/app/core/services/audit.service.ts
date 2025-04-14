import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog, AuditLogParams, AuditLogResponse } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private baseUrl = `${environment.apiUrl}/api/Audit`;

  constructor(private http: HttpClient) {}

  getRecentLogs(params: AuditLogParams): Observable<AuditLogResponse> {
    let httpParams = new HttpParams()
      .set('pageIndex', params.pageIndex.toString())
      .set('pageSize', params.pageSize.toString());
      
    return this.http.get<AuditLogResponse>(`${this.baseUrl}/logs`, { params: httpParams });
  }
}