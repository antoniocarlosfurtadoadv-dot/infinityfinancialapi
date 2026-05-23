export interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
  role: string;
  password?: string;
  tenantId?: string;
  firstAccessToken?: string;
  createdByUserId?: string;
  timestamp: Date;
}

export interface EmployeeAddedEvent {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  teamId: string;
  teamName: string;
  tenantId: string;
  addedById: string;
  timestamp: Date;
}
