export class SubscriptionCreatedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly tenantId: string,
    public readonly planId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
