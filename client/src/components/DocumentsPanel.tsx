// Knowledge Base card for the chatbot detail page. Lists uploaded documents
// and handles upload (click-to-browse + drag-drop) and delete against the
// documents API. Uploading is synchronous from the user's POV — the server
// extracts, chunks, and embeds before responding — so we surface a clear
// "uploading & embedding" state. Mutations refresh the global chatbot list so
// the dashboard's doc counts and this page's Live/Draft pill stay in sync.
import { useEffect, useRef, useState } from 'react';
import { FileText, Trash2, UploadCloud, Loader2, Link2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { normaliseError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useChatbots } from '@/stores/chatbots';
import type { DocumentMeta } from '@/types/document';

interface DocumentsPanelProps {
  chatbotId: string;
}

const TYPE_STYLE: Record<DocumentMeta['fileType'], string> = {
  pdf: 'bg-danger-soft text-danger',
  docx: 'bg-primary-light text-primary-dark',
  txt: 'bg-surface-muted text-text-muted',
  url: 'bg-success-soft text-success',
};

function formatBytes(n: number): string {
  if (!n) return '—';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// Display just the host for URL-sourced documents (falls back to the raw string
// if it somehow isn't a parseable URL).
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function DocumentsPanel({ chatbotId }: DocumentsPanelProps) {
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get<{ documents: DocumentMeta[] }>(`/chatbots/${chatbotId}/documents`)
      .then(({ data }) => {
        if (alive) setDocs(data.documents);
      })
      .catch(() => {
        if (alive) setError('Could not load documents.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [chatbotId]);

  const handleFiles = async (list: FileList | null) => {
    const files = Array.from(list || []);
    if (!files.length || uploading) return;
    setError(null);
    setUploading(true);
    try {
      // The server accepts one file per request, so upload sequentially.
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post<{ document: DocumentMeta }>(
          `/chatbots/${chatbotId}/documents`,
          form
        );
        setDocs((d) => [data.document, ...d]);
      }
      void useChatbots.getState().load(); // refresh dashboard counts + Live pill
    } catch (err) {
      const { message } = normaliseError(err);
      setError(message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async () => {
    const url = urlInput.trim();
    if (!url || addingUrl || uploading) return;
    setError(null);
    setAddingUrl(true);
    try {
      const { data } = await api.post<{ document: DocumentMeta }>(
        `/chatbots/${chatbotId}/documents/url`,
        { url }
      );
      setDocs((d) => [data.document, ...d]);
      setUrlInput('');
      void useChatbots.getState().load(); // refresh dashboard counts + Live pill
    } catch (err) {
      const { message } = normaliseError(err);
      setError(message || 'Could not ingest that URL. Please try again.');
    } finally {
      setAddingUrl(false);
    }
  };

  const remove = async (id: string) => {
    const prev = docs;
    setDocs((d) => d.filter((x) => x.id !== id)); // optimistic
    try {
      await api.delete(`/documents/${id}`);
      void useChatbots.getState().load();
    } catch {
      setDocs(prev); // roll back on failure
      setError('Could not delete that document.');
    }
  };

  const totalChunks = docs.reduce((s, d) => s + d.chunkCount, 0);

  return (
    <div className="bg-surface border border-border rounded-card flex flex-col">
      <div className="flex-none px-5 py-4 border-b border-border">
        <div className="font-serif text-[17px] font-semibold text-text-strong">Knowledge Base</div>
        <div className="text-[13px] text-text-muted">Documents your bot answers from</div>
      </div>

      <div className="p-5">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.txt,.docx"
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            'rounded-card border-2 border-dashed p-6 text-center cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            drag
              ? 'border-primary bg-primary/5'
              : 'border-border-strong hover:border-primary hover:bg-primary/5',
            uploading && 'opacity-60 pointer-events-none'
          )}
        >
          <div className="grid place-items-center w-11 h-11 rounded-full bg-primary-light text-primary-dark mx-auto mb-2">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
          </div>
          <div className="text-sm text-text-strong font-semibold">
            {uploading ? (
              'Uploading & embedding…'
            ) : (
              <>
                Drop PDF, TXT, or DOCX here, or{' '}
                <span className="text-primary-dark">click to browse</span>
              </>
            )}
          </div>
          <div className="text-xs text-text-muted mt-1">Up to 10 MB per file</div>
        </div>

        {/* Ingest a web page by URL — same chunk → embed pipeline as a file. */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Link2
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="url"
              inputMode="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddUrl();
                }
              }}
              disabled={addingUrl || uploading}
              placeholder="Add a page by URL — https://…"
              className="h-[42px] w-full rounded-input bg-surface pl-9 pr-3 text-sm text-text-strong border border-border outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleAddUrl()}
            disabled={addingUrl || uploading || !urlInput.trim()}
            className="grid place-items-center h-[42px] px-3.5 rounded-input bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:pointer-events-none flex-none"
          >
            {addingUrl ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="mt-4 space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[58px] rounded-lg bg-surface-muted animate-pulse" />
            ))
          ) : docs.length === 0 ? (
            <div className="text-center text-sm text-text-muted py-8">
              No documents yet. Upload a file to train your bot.
            </div>
          ) : (
            docs.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 group"
              >
                <span
                  className={cn(
                    'grid place-items-center w-9 h-9 rounded-lg flex-none',
                    TYPE_STYLE[d.fileType]
                  )}
                >
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-strong truncate">{d.filename}</div>
                  <div className="text-xs text-text-muted truncate">
                    {formatBytes(d.byteSize)} · {d.chunkCount} chunk{d.chunkCount === 1 ? '' : 's'} ·{' '}
                    {d.fileType === 'url' && d.source ? hostnameOf(d.source) : d.fileType.toUpperCase()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(d.id)}
                  title="Delete document"
                  aria-label={`Delete ${d.filename}`}
                  className="grid place-items-center w-8 h-8 rounded-lg text-text-muted hover:text-danger hover:bg-danger-soft transition-colors flex-none"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {!loading && docs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border text-xs text-text-muted">
            {docs.length} document{docs.length === 1 ? '' : 's'} · {totalChunks} chunk
            {totalChunks === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </div>
  );
}
