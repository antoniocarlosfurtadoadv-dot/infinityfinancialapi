export class NewDeviceAccessEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly deviceLabel: string,
    public readonly ipAddress?: string,
    public readonly tenantId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
