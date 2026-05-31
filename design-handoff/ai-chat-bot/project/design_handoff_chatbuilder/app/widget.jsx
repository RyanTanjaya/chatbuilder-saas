// widget.jsx — Screen 7: Public Chat Widget (reusable WidgetPanel + showcase)
const { useState: useStateW } = React;

// The actual embeddable panel — reused in the Embed preview too
function WidgetPanel({ accent = '#6366f1', botName = 'Support Bot', onClose, interactive = true }) {
  const accentKey = Object.keys(ACCENTS).find(k => ACCENTS[k].bg === accent) || 'indigo';
  const initial = [
    { from: 'bot', text: `Hi there! 👋 I'm ${botName}. How can I help you today?` },
    { from: 'user', text: 'Can I get a refund?' },
    { from: 'bot', text: "Of course — we offer full refunds within 30 days. Want me to start one for you?", cites: ['refund-policy.pdf'] },
  ];
  return (
    <div className="widget-panel">
      <div className="widget-head" style={{ background: accent }}>
        <span className="w-av"><Icon name="bot" size={20} /></span>
        <div>
          <div className="w-name">{botName}</div>
          <div className="w-status"><span className="dot" />Online</div>
        </div>
        <button className="w-close" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {interactive
          ? <LiveChat accent={accentKey} placeholder="Type your message…" initial={initial} />
          : <div className="widget-body">{initial.map((m, i) => <Message key={i} m={m} accent={accentKey} />)}</div>}
      </div>
      <div className="widget-foot-brand">Powered by <b>ChatBuilder</b></div>
    </div>
  );
}

// Standalone showcase: collapsed bubble + expanded panel side by side
function PublicWidget({ go }) {
  return (
    <Shell screen="embed" go={go} title="Widget Preview" sub="Exactly how your chatbot appears to visitors"
      actions={<Btn variant="outline" icon="arrowLeft" onClick={() => go('embed')}>Back to Embed</Btn>}>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* collapsed */}
        <div>
          <div className="section-title" style={{ marginBottom: 4 }}>Collapsed</div>
          <p className="section-sub" style={{ marginBottom: 16 }}>The floating launcher sits in the corner of the page.</p>
          <div style={{ width: 300, height: 600, maxHeight: '70vh', borderRadius: 18, border: '1px solid var(--border)', background: 'var(--surface)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div className="mock-bar"><span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" /></div>
            <div className="mock-body">
              <div className="mock-line" style={{ width: '70%', height: 16 }} />
              <div className="mock-line" style={{ width: '95%' }} />
              <div className="mock-line" style={{ width: '88%' }} />
              <div className="mock-line" style={{ width: '60%' }} />
              <div className="mock-line" style={{ width: '92%', marginTop: 24 }} />
              <div className="mock-line" style={{ width: '80%' }} />
            </div>
            <button className="fab"><Icon name="messageSquare" /></button>
          </div>
        </div>
        {/* expanded */}
        <div>
          <div className="section-title" style={{ marginBottom: 4 }}>Expanded</div>
          <p className="section-sub" style={{ marginBottom: 16 }}>≈ 380 × 600 — fully interactive, try it.</p>
          <WidgetPanel accent="#6366f1" botName="Support Bot" onClose={() => {}} />
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { WidgetPanel, PublicWidget });
