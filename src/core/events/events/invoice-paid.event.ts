export class InvoicePaidEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
