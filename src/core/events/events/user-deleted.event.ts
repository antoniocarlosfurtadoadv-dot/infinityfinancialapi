export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly tenantId?: string,
    public readonly deletedAt: Date = new Date(),
  ) {}
}