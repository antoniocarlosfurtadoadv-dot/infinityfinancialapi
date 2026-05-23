export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly isFirstTimeChange: boolean,
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
    public readonly tenantId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
