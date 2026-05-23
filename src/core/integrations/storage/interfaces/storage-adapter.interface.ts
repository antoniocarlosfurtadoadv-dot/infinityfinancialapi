export interface UploadFileDto {
  file: Buffer;
  filename: string;
  contentType?: string;
  metadata?: Record<string, string>;
  folder?: string;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface DeleteFileDto {
  key: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

export interface GetFileDto {
  key: string;
}

export interface GetFileResponse {
  success: boolean;
  file?: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
  error?: string;
}

export interface ListFilesDto {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
}

export interface ListFilesResponse {
  success: boolean;
  files?: FileInfo[];
  continuationToken?: string;
  error?: string;
}

export interface IStorageAdapter {
  uploadFile(data: UploadFileDto): Promise<UploadResponse>;
  deleteFile(data: DeleteFileDto): Promise<DeleteResponse>;
  getFile(data: GetFileDto): Promise<GetFileResponse>;
  listFiles(data: ListFilesDto): Promise<ListFilesResponse>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}
