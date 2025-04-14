export interface AuditLog {
  id: number;
  message: string;
  messageTemplate: string;
  level: string;
  timeStamp: string;
  exception: string | null;
  properties: string;
}

export interface AuditLogResponse {
  items: AuditLog[];
  pageIndex: number;
  pageSize: number;
  totalItemCount: number;
}

export interface AuditLogParams {
  pageSize: number;
  pageIndex: number;
}