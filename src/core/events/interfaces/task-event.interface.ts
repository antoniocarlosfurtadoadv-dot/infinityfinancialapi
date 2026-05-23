export interface TaskCreatedEvent {
  taskId: string;
  name: string;
  createdById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}

export interface TaskAssignedEvent {
  taskId: string;
  name: string;
  assignedToId: string;
  assignedById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}

export interface TaskStatusUpdatedEvent {
  taskId: string;
  name: string;
  oldStatus: string;
  newStatus: string;
  updatedById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}

export interface TaskCompletedEvent {
  taskId: string;
  name: string;
  completedById: string;
  teamId: string;
  companyId: string;
  timestamp: Date;
}
