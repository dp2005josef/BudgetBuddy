import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = `${environment.apiUrl}/api/Configuration`;

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  getClient(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
  }

  createClient(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, client);
  }

  updateClient(id: string, client: UpdateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/clients/${id}`, client);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clients/${id}`);
  }

  forceExecute(id: string): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients/${id}/execute`, {});
  }
}