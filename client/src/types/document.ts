// Document metadata — matches the projection returned by the documents routes
// (GET /api/chatbots/:id/documents and the upload response's `document`).
export interface DocumentMeta {
  id: string;
  filename: string;
  fileType: 'pdf' | 'txt' | 'docx' | 'url';
  byteSize: number;
  chunkCount: number;
  createdAt: string;
}
