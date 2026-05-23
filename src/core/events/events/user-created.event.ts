export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
    public readonly password?: string,
    public readonly tenantId?: string,
    public readonly firstAccessToken?: string,
    public readonly createdByUserId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
