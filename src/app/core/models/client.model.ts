export interface ClientSchedule {
  id?: string;
  executionTimes: string[];
  daysOfWeek: number[];
  isEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientDatabase {
  id?: string;
  connectionString: string;
  databaseName: string;
  description: string;
  isMandatory: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client {
  id: string;
  clientName: string;
  dataWarehouseConnectionString: string;
  createdAt: Date;
  updatedAt: Date;
  lastExecutionTime?: Date;
  isActive: boolean;
  schedule: ClientSchedule;
  databases: ClientDatabase[];
}

export interface CreateClientRequest {
  clientName: string;
  dataWarehouseConnectionString: string;
  schedule: {
    executionTimes: string[];
    daysOfWeek: number[];
    isEnabled: boolean;
  };
  databases: {
    connectionString: string;
    databaseName: string;
    description: string;
    isMandatory: boolean;
  }[];
  isActive: boolean;
}

export interface UpdateClientRequest {
  clientName: string;
  dataWarehouseConnectionString: string;
  schedule: {
    executionTimes: string[];
    daysOfWeek: number[];
    isEnabled: boolean;
  };
  databases: {
    id?: string;
    connectionString: string;
    databaseName: string;
    description: string;
    isMandatory: boolean;
  }[];
  isActive: boolean;
}