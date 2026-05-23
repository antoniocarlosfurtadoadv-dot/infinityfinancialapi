export interface FileUploadEvent {
  fileId: string;
  taskId: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export interface FileDeleteEvent {
  fileId: string;
  filepath: string;
  taskId: string;
}
