// Document metadata — matches the projection returned by the documents routes
// (GET /api/chatbots/:id/documents and the upload response's `document`).
export interface DocumentMeta {
  id: string;
  filename: string;
  fileType: 'pdf' | 'txt' | 'docx' | 'url';
  source?: string | null; // original URL when fileType is "url"
  byteSize: number;
  chunkCount: number;
  createdAt: string;
}
