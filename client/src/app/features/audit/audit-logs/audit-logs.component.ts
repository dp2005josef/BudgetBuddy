import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLog } from '../../../core/models/audit.model';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
  dataSource: MatTableDataSource<AuditLog> = new MatTableDataSource<AuditLog>([]);
  displayedColumns: string[] = ['timestamp', 'level', 'message', 'actions'];
  isLoading = false;
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  selectedLog: AuditLog | null = null;
  detailsVisible = false;

  constructor(private auditService: AuditService) { }

  ngOnInit(): void {
    this.loadAuditLogs(0, this.pageSize);
  }
  
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadAuditLogs(pageIndex: number, pageSize: number): void {
    this.isLoading = true;
    
    this.auditService.getRecentLogs({ pageIndex, pageSize }).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.totalItems = response.totalItemCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.isLoading = false;
      }
    });
  }
  
  onPageChange(event: any): void {
    this.loadAuditLogs(event.pageIndex, event.pageSize);
  }
  
  showLogDetails(log: AuditLog): void {
    this.selectedLog = log;
    this.detailsVisible = true;
  }
  
  closeDetails(): void {
    this.detailsVisible = false;
    this.selectedLog = null;
  }
  
  getLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error': return 'level-error';
      case 'warning': return 'level-warning';
      case 'information': return 'level-info';
      default: return 'level-default';
    }
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  parseProperties(propertiesJson: string): any {
    try {
      return JSON.parse(propertiesJson);
    } catch (error) {
      return null;
    }
  }
  
  getPropertyEntries(properties: any): [string, any][] {
    if (!properties) return [];
    return Object.entries(properties);
  }
  
  refresh(): void {
    this.loadAuditLogs(this.paginator ? this.paginator.pageIndex : 0, this.pageSize);
  }
}