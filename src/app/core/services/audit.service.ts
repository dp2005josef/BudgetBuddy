import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogResponse, AuditLogParams } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private baseUrl = `${environment.apiUrl}/api/Audit`;

  constructor(private http: HttpClient) {}

  getRecentLogs(params: AuditLogParams): Observable<AuditLogResponse> {
    return this.http.get<AuditLogResponse>(`${this.baseUrl}/recent`, {
      params: {
        PageSize: params.pageSize.toString(),
        PageIndex: params.pageIndex.toString()
      }
    });
  }
}