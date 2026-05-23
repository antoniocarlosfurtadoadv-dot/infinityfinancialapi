export class RoleProfileCreatedEvent {
  constructor(
    public readonly roleProfileId: string,
    public readonly name: string,
    public readonly userId?: string,
    public readonly tenantId?: string,
    public readonly metadata?: Record<string, any>,
    public readonly timestamp: Date = new Date(),
  ) {}
}
