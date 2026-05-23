export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly updatedByUserId?: string,
    public readonly tenantId?: string,
    public readonly changes?: Record<string, any>,
    public readonly timestamp: Date = new Date(),
  ) {}
}
