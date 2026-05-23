export class SubscriptionCanceledEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly tenantId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
