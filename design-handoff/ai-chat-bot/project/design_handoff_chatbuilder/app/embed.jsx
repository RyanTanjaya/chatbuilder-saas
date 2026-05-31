// embed.jsx — Screen 6: Embed page
const { useState: useStateE } = React;

const POSITIONS = ['bottom-right', 'bottom-left'];

function CodeBlock({ botId }) {
  const [copied, setCopied] = useStateE(false);
  const copy = () => {
    const text = `<script src="https://api.chatbuilder.app/widget.js" data-chatbot-id="${botId}"></script>`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-file"><Icon name="code" size={14} />index.html</span>
        <button className={'copy-btn' + (copied ? ' done' : '')} onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={15} />{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
<span className="tok-punct">&lt;</span><span className="tok-tag">script</span> <span className="tok-attr">src</span><span className="tok-punct">=</span><span className="tok-str">"https://api.chatbuilder.app/widget.js"</span>{'\n  '}<span className="tok-attr">data-chatbot-id</span><span className="tok-punct">=</span><span className="tok-str">"{botId}"</span><span className="tok-punct">&gt;&lt;/</span><span className="tok-tag">script</span><span className="tok-punct">&gt;</span>
      </pre>
    </div>
  );
}

function MockSite({ accent, pos, open }) {
  return (
    <div className="mock-site" style={{ height: 420 }}>
      <div className="mock-bar"><span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" /></div>
      <div className="mock-body">
        <div className="mock-line" style={{ width: '55%', height: 18 }} />
        <div className="mock-line" style={{ width: '92%' }} />
        <div className="mock-line" style={{ width: '85%' }} />
        <div className="mock-line" style={{ width: '70%' }} />
        <div className="mock-line" style={{ width: '95%', marginTop: 22 }} />
        <div className="mock-line" style={{ width: '60%' }} />
        <div className="mock-line" style={{ width: '80%' }} />
      </div>
      {open ? (
        <div style={{ position: 'absolute', bottom: 16, [pos === 'bottom-left' ? 'left' : 'right']: 16,
          width: 300, height: 360, transform: 'scale(.92)', transformOrigin: pos === 'bottom-left' ? 'bottom left' : 'bottom right' }}>
          <div className="widget-panel" style={{ width: 300, height: 360, borderRadius: 16 }}>
            <div className="widget-head" style={{ background: accent, padding: '12px 14px' }}>
              <span className="w-av" style={{ width: 32, height: 32 }}><Icon name="bot" size={17} /></span>
              <div><div className="w-name" style={{ fontSize: 14 }}>Support Bot</div><div className="w-status"><span className="dot" />Online</div></div>
              <button className="w-close" style={{ width: 28, height: 28 }}><Icon name="x" size={16} /></button>
            </div>
            <div className="widget-body" style={{ padding: 14, gap: 10 }}>
              <div className="msg-row bot"><span className="msg-av" style={{ background: accent, width: 26, height: 26 }}><Icon name="bot" size={14} /></span><div className="bubble" style={{ fontSize: 13 }}>Hi! 👋 How can I help?</div></div>
              <div className="msg-row user"><div className="bubble" style={{ background: accent, fontSize: 13 }}>Do you offer refunds?</div></div>
            </div>
            <div className="widget-foot-brand">Powered by <b>ChatBuilder</b></div>
          </div>
        </div>
      ) : (
        <button className={'fab' + (pos === 'bottom-left' ? ' left' : '')} style={{ background: accent }}><Icon name="messageSquare" /></button>
      )}
    </div>
  );
}

function Embed({ go, params }) {
  const bot = botById(params.bot || 'support');
  const botId = 'bot_abc123';
  const [pos, setPos] = useStateE('bottom-right');
  const [accent, setAccent] = useStateE('indigo');
  const [domains, setDomains] = useStateE('example.com, app.example.com');
  const [open, setOpen] = useStateE(true);

  return (
    <Shell screen="embed" go={go} title="Embed your chatbot on any website"
      sub="Add a few lines to your site and your bot goes live"
      actions={<Btn variant="outline" icon="messageSquare" onClick={() => go('widget')}>Full preview</Btn>}>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* LEFT — install snippet */}
        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 4 }}>Install snippet</div>
          <p className="section-sub" style={{ marginBottom: 16 }}>Paste this once and the widget appears on every page.</p>
          <CodeBlock botId={botId} />
          <ol className="steps">
            <li>Copy the snippet above.</li>
            <li>Paste it just before your closing <code>&lt;/body&gt;</code> tag.</li>
            <li>Save and refresh — your bot is live. 🎉</li>
          </ol>
        </div>

        {/* RIGHT — live preview */}
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 4 }}>Live preview</div>
              <p className="section-sub mb-0">How it looks on your site.</p>
            </div>
            <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 9 }}>
              <button className={'btn btn-sm ' + (!open ? 'btn-primary' : 'btn-ghost')} onClick={() => setOpen(false)}>Bubble</button>
              <button className={'btn btn-sm ' + (open ? 'btn-primary' : 'btn-ghost')} onClick={() => setOpen(true)}>Open</button>
            </div>
          </div>
          <MockSite accent={ACCENTS[accent].bg} pos={pos} open={open} />
        </div>
      </div>

      {/* settings card */}
      <div className="card card-pad">
        <div className="card-title" style={{ marginBottom: 18 }}>Widget settings</div>
        <div className="grid-2" style={{ gap: 32 }}>
          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>Position</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {POSITIONS.map(p => (
                <button key={p} onClick={() => setPos(p)}
                  className={'btn ' + (pos === p ? 'btn-primary' : 'btn-outline')} style={{ flex: 1, textTransform: 'capitalize' }}>
                  {p.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="field-label" style={{ margin: '22px 0 8px' }}>Accent color</div>
            <div className="swatch-row">
              {Object.entries(ACCENTS).map(([k, v]) => (
                <span key={k} className={'swatch' + (accent === k ? ' sel' : '')} style={{ background: v.bg }} onClick={() => setAccent(k)} title={k} />
              ))}
              <span className="muted" style={{ fontSize: 13, marginLeft: 4, fontFamily: 'var(--mono)' }}>{ACCENTS[accent].bg}</span>
            </div>
          </div>
          <div>
            <Field label="Allowed domains" hint="Comma-separated. The widget only loads on these domains.">
              <textarea className="textarea" rows={3} value={domains} onChange={e => setDomains(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>
    </Shell>
  );
}

window.Embed = Embed;
