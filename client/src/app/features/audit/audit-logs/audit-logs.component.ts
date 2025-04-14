import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuditService } from '@core/services/audit.service';
import { AuditLog, AuditLogParams } from '@core/models/audit.model';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html'
})
export class AuditLogsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'level', 'message', 'timeStamp'];
  dataSource = new MatTableDataSource<AuditLog>([]);
  isLoading = true;
  error = false;
  
  // Pagination settings
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  pageSizeOptions = [5, 10, 25, 50, 100];

  constructor(
    private auditService: AuditService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.error = false;

    const params: AuditLogParams = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex + 1 // API uses 1-based paging
    };

    this.auditService.getRecentLogs(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.totalItems = response.totalItemCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs', error);
        this.isLoading = false;
        this.error = true;
        this.snackBar.open('Failed to load audit logs', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadAuditLogs();
  }

  getLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error-level';
      case 'warning':
        return 'warning-level';
      case 'information':
        return 'info-level';
      default:
        return '';
    }
  }

  parseProperties(propertiesXml: string): { [key: string]: string } {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(propertiesXml, "text/xml");
      const propertyElements = xmlDoc.getElementsByTagName("property");
      
      const properties: { [key: string]: string } = {};
      for (let i = 0; i < propertyElements.length; i++) {
        const key = propertyElements[i].getAttribute("key");
        const value = propertyElements[i].textContent;
        if (key && value) {
          properties[key] = value;
        }
      }
      
      return properties;
    } catch (error) {
      console.error('Error parsing properties XML', error);
      return {};
    }
  }
}
