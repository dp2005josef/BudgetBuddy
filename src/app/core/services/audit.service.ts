import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AuditLogResponse, AuditLogParams } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private baseUrl = `${environment.apiUrl}/api/Audit`;

  constructor(private http: HttpClient) {}

  getRecentLogs(params: AuditLogParams): Observable<AuditLogResponse> {
    let httpParams = new HttpParams()
      .set('PageSize', params.pageSize.toString())
      .set('PageIndex', params.pageIndex.toString());

    return this.http.get<AuditLogResponse>(`${this.baseUrl}/recent`, { params: httpParams });
  }
}
