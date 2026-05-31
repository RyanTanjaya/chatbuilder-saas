// Top-level router. Real routes are wired up in Step 3 (auth) onward.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function ScaffoldPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-surface border border-border rounded-card p-8 shadow-md text-center">
        <div className="mx-auto w-12 h-12 rounded-card bg-primary text-white flex items-center justify-center mb-4 text-xl font-bold">
          C
        </div>
        <h1 className="text-2xl font-bold text-text-strong mb-2">ChatBuilder</h1>
        <p className="text-text-muted text-sm">
          Scaffold is up. Routes &amp; pages land in the next steps.
        </p>
        <div className="mt-6 flex gap-2 justify-center flex-wrap text-xs text-text-muted">
          <span className="px-2 py-1 rounded-pill bg-primary-light text-primary-dark font-semibold">
            Vite + React
          </span>
          <span className="px-2 py-1 rounded-pill bg-success-soft text-success font-semibold">
            Tailwind ready
          </span>
          <span className="px-2 py-1 rounded-pill bg-accent-purple-soft text-accent-purple font-semibold">
            shadcn next
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScaffoldPlaceholder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
