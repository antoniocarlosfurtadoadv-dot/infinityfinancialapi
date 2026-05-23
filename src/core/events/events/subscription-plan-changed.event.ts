export class SubscriptionPlanChangedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly newPlanId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
