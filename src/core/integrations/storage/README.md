# Storage Module

A flexible storage module implementing the adapter pattern, allowing easy switching between different storage providers.

## Current Implementations

- **Cloudflare R2**: S3-compatible object storage from Cloudflare

## Architecture

The module follows the adapter pattern used throughout the application:

- `IStorageAdapter`: Interface defining storage operations
- `CloudflareR2Adapter`: Cloudflare R2 implementation using AWS SDK
- `StorageService`: Service that uses the configured adapter
- `StorageModule`: Module with factory pattern for adapter selection

## Configuration

Add these environment variables to your `.env` file:

```env
# Storage Provider (cloudflare-r2)
STORAGE_PROVIDER=cloudflare-r2

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev  # Optional: For public access URLs
```

## Usage

### In a Service

```typescript
import { Injectable } from '@nestjs/common';
import { StorageService } from '@/integrations/storage/storage.service';

@Injectable()
export class MyService {
  constructor(private readonly storageService: StorageService) {}

  async uploadUserAvatar(userId: string, file: Buffer, filename: string) {
    const result = await this.storageService.uploadFile({
      file,
      filename,
      contentType: 'image/jpeg',
      folder: `avatars/${userId}`,
      metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.url;
  }

  async deleteUserAvatar(key: string) {
    const result = await this.storageService.deleteFile({ key });
    return result.success;
  }

  async getTemporaryDownloadUrl(key: string) {
    // Generate a signed URL valid for 1 hour
    return await this.storageService.getSignedUrl(key, 3600);
  }
}
```

### API Endpoints

The module provides ready-to-use endpoints:

- `POST /storage/upload` - Upload a file
- `GET /storage/files` - List files
- `GET /storage/:key/signed-url` - Get temporary signed URL
- `DELETE /storage/:key` - Delete a file

## API Reference

### StorageService Methods

#### `uploadFile(data: UploadFileDto): Promise<UploadResponse>`

Upload a file to storage.

```typescript
interface UploadFileDto {
  file: Buffer;
  filename: string;
  contentType?: string;
  metadata?: Record<string, string>;
  folder?: string;
}
```

#### `deleteFile(data: DeleteFileDto): Promise<DeleteResponse>`

Delete a file from storage.

```typescript
interface DeleteFileDto {
  key: string;
}
```

#### `getFile(data: GetFileDto): Promise<GetFileResponse>`

Retrieve a file from storage.

```typescript
interface GetFileDto {
  key: string;
}
```

#### `listFiles(data: ListFilesDto): Promise<ListFilesResponse>`

List files in storage.

```typescript
interface ListFilesDto {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}
```

#### `getSignedUrl(key: string, expiresIn?: number): Promise<string>`

Generate a temporary signed URL for secure file access.

- `key`: File key/path
- `expiresIn`: URL expiration time in seconds (default: 3600)

## Adding New Storage Providers

To add a new storage provider (e.g., AWS S3, Google Cloud Storage):

1. Create a new adapter in `adapters/` directory:

```typescript
// adapters/aws-s3.adapter.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageAdapter } from '../interfaces/storage-adapter.interface';

@Injectable()
export class AwsS3Adapter implements IStorageAdapter {
  constructor(private readonly configService: ConfigService) {
    // Initialize S3 client
  }

  async uploadFile(data: UploadFileDto): Promise<UploadResponse> {
    // Implementation
  }

  // Implement other required methods...
}
```

2. Update `storage.module.ts` to include the new adapter:

```typescript
{
  provide: 'STORAGE_ADAPTER',
  useFactory: (configService: ConfigService) => {
    const storageProvider = configService.get<string>('STORAGE_PROVIDER');
    
    if (storageProvider === 'aws-s3') {
      return new AwsS3Adapter(configService);
    }
    if (storageProvider === 'cloudflare-r2') {
      return new CloudflareR2Adapter(configService);
    }
    return new CloudflareR2Adapter(configService); // default
  },
  inject: [ConfigService],
}
```

## Cloudflare R2 Setup

1. Create a Cloudflare account and navigate to R2 Object Storage
2. Create a new bucket
3. Generate API tokens with R2 read/write permissions
4. (Optional) Set up a custom domain or use the default R2.dev domain for public access
5. Add the credentials to your `.env` file

## Best Practices

- Use folders to organize files by type/user/context
- Add meaningful metadata for better file management
- Use signed URLs for temporary access to private files
- Implement proper error handling
- Consider file size limits based on your infrastructure
- Clean up unused files regularly

## Dependencies

- `@aws-sdk/client-s3` - AWS SDK for S3-compatible operations
- `@aws-sdk/s3-request-presigner` - Generate signed URLs
