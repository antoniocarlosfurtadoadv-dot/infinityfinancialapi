import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  IStorageAdapter,
  UploadFileDto,
  UploadResponse,
  DeleteFileDto,
  DeleteResponse,
  GetFileDto,
  GetFileResponse,
  ListFilesDto,
  ListFilesResponse,
  FileInfo,
} from '../interfaces/storage-adapter.interface';

@Injectable()
export class CloudflareR2Adapter implements IStorageAdapter {
  private readonly logger = new Logger(CloudflareR2Adapter.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly publicUrl: string | undefined;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
      this.logger.error(
        'Cloudflare R2 credentials not found in environment variables. Please configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.',
      );
      this.isConfigured = false;
    } else {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      this.isConfigured = true;
      this.logger.log('Cloudflare R2 adapter initialized successfully');
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured || !this.s3Client) {
      throw new Error(
        'Cloudflare R2 não está configurado. Defina as variáveis de ambiente R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e R2_BUCKET_NAME.',
      );
    }
  }

  async uploadFile(data: UploadFileDto): Promise<UploadResponse> {
    try {
      this.ensureConfigured();

      const key = data.folder
        ? `${data.folder}/${data.filename}`
        : data.filename;

      this.logger.log(`Uploading file to R2: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: data.file,
        ContentType: data.contentType,
        Metadata: data.metadata,
      });

      await this.s3Client!.send(command);

      const url = this.publicUrl ? `${this.publicUrl}/${key}` : undefined;

      this.logger.log(`File uploaded successfully to R2: ${key}`);

      return {
        success: true,
        key,
        url,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to upload file to R2: ${err.message}`,
        err.stack,
      );
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async deleteFile(data: DeleteFileDto): Promise<DeleteResponse> {
    try {
      this.ensureConfigured();

      if (!data.key || data.key.trim() === '') {
        throw new Error('A chave do arquivo é obrigatória e não pode estar vazia');
      }

      this.logger.log(
        `Deleting file from R2 - Bucket: ${this.bucketName}, Key: ${data.key}`,
      );

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: data.key,
      });

      await this.s3Client!.send(command);

      this.logger.log(`File deleted successfully from R2: ${data.key}`);

      return {
        success: true,
      };
    } catch (error) {
      const err = error as Error & { name?: string };
      const errorMessage = err.message || 'Unknown error';
      const isAccessDenied =
        errorMessage.includes('Access Denied') || err.name === 'AccessDenied';

      if (isAccessDenied) {
        this.logger.error(
          `Access Denied when deleting file from R2: ${data.key}. `,
        );
        return {
          success: false,
          error:
            'Access Denied: R2 API token lacks delete permissions. Please update token permissions in Cloudflare dashboard.',
        };
      }

      this.logger.error(
        `Failed to delete file from R2: ${errorMessage}`,
        err.stack,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getFile(data: GetFileDto): Promise<GetFileResponse> {
    try {
      this.ensureConfigured();

      this.logger.log(`Getting file from R2: ${data.key}`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: data.key,
      });

      const response = await this.s3Client!.send(command);

      if (!response.Body) {
        throw new Error('Corpo do arquivo está vazio');
      }

      const file = Buffer.from(await response.Body.transformToByteArray());

      this.logger.log(`File retrieved successfully from R2: ${data.key}`);

      return {
        success: true,
        file,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to get file from R2: ${err.message}`,
        err.stack,
      );
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async listFiles(data: ListFilesDto): Promise<ListFilesResponse> {
    try {
      this.ensureConfigured();

      this.logger.log(`Listing files from R2 with prefix: ${data.prefix}`);

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: data.prefix,
        MaxKeys: data.maxKeys || 1000,
        ContinuationToken: data.continuationToken,
      });

      const response = await this.s3Client!.send(command);

      const files: FileInfo[] =
        response.Contents?.filter(
          (item) => item.Key && item.Size !== undefined && item.LastModified,
        ).map((item) => ({
          key: item.Key!,
          size: item.Size!,
          lastModified: item.LastModified!,
        })) || [];

      this.logger.log(`Listed ${files.length} files from R2`);

      return {
        success: true,
        files,
        continuationToken: response.NextContinuationToken,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to list files from R2: ${err.message}`,
        err.stack,
      );
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      this.ensureConfigured();

      this.logger.log(`Generating signed URL for R2 key: ${key}`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client!, command, { expiresIn });

      this.logger.log(`Signed URL generated successfully for: ${key}`);

      return url;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to generate signed URL: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
