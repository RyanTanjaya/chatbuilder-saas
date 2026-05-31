// detail.jsx — Screen 4: Chatbot Detail
const { useState: useStateDt, useRef: useRefDt } = React;

const DOC_ICON = {
  pdf:  { color: 'danger',  soft: 'var(--danger-soft)',  fg: '#dc2626' },
  docx: { color: 'indigo',  soft: 'var(--primary-light)', fg: '#4f46e5' },
  txt:  { color: 'muted',   soft: '#f1f5f9',             fg: '#64748b' },
};

function DocRow({ doc, onDelete }) {
  const s = DOC_ICON[doc.type] || DOC_ICON.txt;
  return (
    <div className="doc-row fade-in">
      <span className="doc-icon" style={{ background: s.soft, color: s.fg }}><Icon name="fileText" size={19} /></span>
      <div style={{ minWidth: 0 }}>
        <div className="doc-name">{doc.name}</div>
        <div className="doc-meta">{doc.size} · {doc.chunks} chunks · {doc.type.toUpperCase()}</div>
      </div>
      <button className="doc-del" title="Delete" onClick={onDelete}><Icon name="trash" size={17} /></button>
    </div>
  );
}

function ChatbotDetail({ go, params }) {
  const bot = botById(params.bot);
  const [docs, setDocs] = useStateDt(DOC_DEFAULT.slice(0, 4));
  const [drag, setDrag] = useStateDt(false);
  const fileRef = useRefDt(null);

  const addFiles = (fileList) => {
    const types = { pdf: 'pdf', txt: 'txt', doc: 'docx', docx: 'docx' };
    const next = Array.from(fileList || []).map((f, i) => {
      const ext = (f.name.split('.').pop() || 'txt').toLowerCase();
      const kb = f.size ? Math.max(1, Math.round(f.size / 1024)) : 40 + i * 12;
      return { name: f.name, type: types[ext] || 'txt', size: kb + ' KB', chunks: Math.max(4, Math.round(kb / 6)) };
    });
    if (next.length) setDocs(d => [...next, ...d]);
  };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };
  // simulate a doc if user drops nothing real / clicks in empty area
  const simulate = () => addFiles([{ name: 'new-upload.pdf', size: 74000 }]);

  const totalChunks = docs.reduce((s, d) => s + d.chunks, 0);

  const actions = (
    <>
      <Btn variant="outline" icon="code" onClick={() => go('embed', { bot: bot.id })}>Embed</Btn>
      <Btn variant="outline" icon="settings" onClick={() => go('settings', { bot: bot.id })}>Settings</Btn>
      <Btn variant="danger" icon="trash">Delete</Btn>
    </>
  );

  const header = (
    <div>
      <div className="crumbs">
        <a onClick={() => go('dashboard')}>Chatbots</a>
        <Icon name="chevronRight" />
        <span className="cur">{bot.name}</span>
      </div>
      <div className="flex items-center gap-12">
        <h1 style={{ whiteSpace: 'nowrap' }}>{bot.name}</h1>
        {bot.live
          ? <span className="pill pill-live"><span className="dot" />Live</span>
          : <span className="pill" style={{ background: '#f1f5f9', color: '#64748b' }}>Draft</span>}
      </div>
    </div>
  );

  return (
    <Shell screen="detail" go={go} headerContent={header} actions={actions}>
      <div className="grid-2 detail-split" style={{ gridTemplateColumns: '2fr 3fr', marginTop: 8 }}>
        {/* LEFT — knowledge base */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Knowledge Base</div>
              <div className="card-sub">Documents your bot answers from</div>
            </div>
          </div>
          <div className="card-pad">
            <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.docx,.doc" style={{ display: 'none' }}
              onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            <div className={'dropzone' + (drag ? ' drag' : '')}
              onClick={() => fileRef.current && fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}>
              <div className="dz-icon"><Icon name="upload" size={22} /></div>
              <div><strong>Drop PDF, TXT, or DOCX here</strong>, or click to browse</div>
              <div style={{ fontSize: 12.5, marginTop: 4 }}>Up to 25 MB per file</div>
            </div>

            <div style={{ marginTop: 18 }}>
              {docs.map((d, i) => (
                <DocRow key={d.name + i} doc={d} onDelete={() => setDocs(docs.filter((_, j) => j !== i))} />
              ))}
            </div>
            <div className="doc-foot">{docs.length} document{docs.length !== 1 ? 's' : ''} · {totalChunks} chunks</div>
          </div>
        </div>

        {/* RIGHT — live chat test */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 620 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Test your bot</div>
              <div className="card-sub">Try real questions — answers cite their sources</div>
            </div>
            <span className="pill pill-live"><span className="dot" />Online</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <LiveChat
              accent={bot.color}
              placeholder="Ask your bot a question…"
              initial={[
                { from: 'bot', text: `Hi! I'm ${bot.name} 👋 Ask me anything from my knowledge base.` },
                { from: 'user', text: "What's your refund policy?" },
                { from: 'bot', text: "We offer a full refund within 30 days of purchase, no questions asked. After that, refunds are reviewed case by case from your billing page.", cites: ['refund-policy.pdf'] },
              ]}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

window.ChatbotDetail = ChatbotDetail;
