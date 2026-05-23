import { Inject, Injectable } from '@nestjs/common';

import type { IStorageAdapter } from './interfaces/storage-adapter.interface';
import {
  UploadFileDto,
  UploadResponse,
  DeleteFileDto,
  DeleteResponse,
  GetFileDto,
  GetFileResponse,
  ListFilesDto,
  ListFilesResponse,
} from './interfaces/storage-adapter.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject('STORAGE_ADAPTER')
    private readonly storageAdapter: IStorageAdapter,
  ) {}

  async uploadFile(data: UploadFileDto): Promise<UploadResponse> {
    return this.storageAdapter.uploadFile(data);
  }

  async deleteFile(data: DeleteFileDto): Promise<DeleteResponse> {
    return this.storageAdapter.deleteFile(data);
  }

  async getFile(data: GetFileDto): Promise<GetFileResponse> {
    return this.storageAdapter.getFile(data);
  }

  async listFiles(data: ListFilesDto): Promise<ListFilesResponse> {
    return this.storageAdapter.listFiles(data);
  }

  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    return this.storageAdapter.getSignedUrl(key, expiresIn);
  }
}
