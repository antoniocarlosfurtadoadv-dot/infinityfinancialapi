import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file before reading process.env
// This ensures environment variables are available on all platforms (Windows, Linux, macOS)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${key}. Verifique seu arquivo .env.`,
    );
  }
  return value;
};

export const jwtConstants = {
  secret: getEnvOrThrow('JWT_SECRET'),
  secretRefresh: getEnvOrThrow('JWT_SECRET_REFRESH'),
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
