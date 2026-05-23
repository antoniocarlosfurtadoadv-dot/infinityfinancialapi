export class VerificationCodeEmailEvent {
  constructor(
    public readonly email: string,
    public readonly code: string,
    public readonly userName: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

