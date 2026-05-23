export class PasswordResetEvent {
  constructor(
    public readonly email: string,
    public readonly code: string,
    public readonly name: string,
  ) {}
}

