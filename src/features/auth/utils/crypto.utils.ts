import * as crypto from 'crypto';

/** SHA-256 of a token — deterministic, so we can look up by hash with @unique */
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
