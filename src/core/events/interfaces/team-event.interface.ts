export interface TeamCreatedEvent {
  teamId: string;
  name: string;
  companyId: string;
  createdById: string;
  timestamp: Date;
}
