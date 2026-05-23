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
export class MinioAdapter implements IStorageAdapter {
  private readonly logger = new Logger(MinioAdapter.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly publicUrl: string | undefined;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = this.configService.get<string>('MINIO_PORT') || '9000';
    const useSsl = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const accessKeyId = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('MINIO_SECRET_KEY');
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || '';
    this.publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      this.logger.error(
        'MinIO credentials not found in environment variables. Please configure MINIO_ACCESS_KEY, MINIO_SECRET_KEY, and MINIO_BUCKET_NAME.',
      );
      this.isConfigured = false;
    } else {
      const protocol = useSsl ? 'https' : 'http';
      this.s3Client = new S3Client({
        region: 'us-east-1',
        endpoint: `${protocol}://${endpoint}:${port}`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true,
      });

      this.isConfigured = true;
      this.logger.log(`MinIO adapter initialized — endpoint: ${protocol}://${endpoint}:${port}`);
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured || !this.s3Client) {
      throw new Error(
        'MinIO não está configurado. Defina as variáveis de ambiente MINIO_ACCESS_KEY, MINIO_SECRET_KEY e MINIO_BUCKET_NAME.',
      );
    }
  }

  async uploadFile(data: UploadFileDto): Promise<UploadResponse> {
    try {
      this.ensureConfigured();

      const key = data.folder
        ? `${data.folder}/${data.filename}`
        : data.filename;

      this.logger.log(`Uploading file to MinIO: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: data.file,
        ContentType: data.contentType,
        Metadata: data.metadata,
      });

      await this.s3Client!.send(command);

      const url = this.publicUrl ? `${this.publicUrl}/${key}` : undefined;

      this.logger.log(`File uploaded successfully to MinIO: ${key}`);

      return {
        success: true,
        key,
        url,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to upload file to MinIO: ${err.message}`,
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
        `Deleting file from MinIO - Bucket: ${this.bucketName}, Key: ${data.key}`,
      );

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: data.key,
      });

      await this.s3Client!.send(command);

      this.logger.log(`File deleted successfully from MinIO: ${data.key}`);

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
          `Access Denied when deleting file from MinIO: ${data.key}. `,
        );
        return {
          success: false,
          error:
            'Access Denied: MinIO user lacks delete permissions. Please check MinIO bucket policies.',
        };
      }

      this.logger.error(
        `Failed to delete file from MinIO: ${errorMessage}`,
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

      this.logger.log(`Getting file from MinIO: ${data.key}`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: data.key,
      });

      const response = await this.s3Client!.send(command);

      if (!response.Body) {
        throw new Error('Corpo do arquivo está vazio');
      }

      const file = Buffer.from(await response.Body.transformToByteArray());

      this.logger.log(`File retrieved successfully from MinIO: ${data.key}`);

      return {
        success: true,
        file,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to get file from MinIO: ${err.message}`,
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

      this.logger.log(`Listing files from MinIO with prefix: ${data.prefix}`);

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

      this.logger.log(`Listed ${files.length} files from MinIO`);

      return {
        success: true,
        files,
        continuationToken: response.NextContinuationToken,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to list files from MinIO: ${err.message}`,
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

      this.logger.log(`Generating signed URL for MinIO key: ${key}`);

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
