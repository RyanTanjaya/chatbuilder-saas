// settings.jsx — Screen 9: Chatbot Settings
const { useState: useStateSt } = React;

function Section({ icon, title, sub, children }) {
  return (
    <div className="card card-pad settings-section" style={{ marginBottom: 20 }}>
      <div className="flex items-center gap-12" style={{ marginBottom: 16 }}>
        <span className="s-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', width: 36, height: 36, borderRadius: 9, display: 'grid', placeItems: 'center', margin: 0 }}><Icon name={icon} size={18} /></span>
        <div>
          <div className="section-title">{title}</div>
          {sub ? <p className="section-sub mb-0">{sub}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function ChatbotSettings({ go, params }) {
  const bot = botById(params.bot || 'support');
  const [name, setName] = useStateSt(bot.name);
  const [desc, setDesc] = useStateSt(bot.desc);
  const [welcome, setWelcome] = useStateSt(`Hi! I'm ${bot.name} 👋 How can I help you today?`);
  const [accent, setAccent] = useStateSt(bot.color);
  const [pos, setPos] = useStateSt('bottom-right');
  const [docsOnly, setDocsOnly] = useStateSt(true);
  const [memory, setMemory] = useStateSt(10);
  const [temp, setTemp] = useStateSt(0.3);
  const [dirty, setDirty] = useStateSt(false);
  const [saved, setSaved] = useStateSt(false);
  const touch = (fn) => (v) => { fn(v); setDirty(true); setSaved(false); };

  const save = () => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2400); };

  return (
    <Shell screen="detail" go={go} narrow headerContent={
      <div>
        <div className="crumbs">
          <a onClick={() => go('dashboard')}>Chatbots</a><Icon name="chevronRight" />
          <a onClick={() => go('detail', { bot: bot.id })}>{bot.name}</a><Icon name="chevronRight" />
          <span className="cur">Settings</span>
        </div>
        <h1 style={{ whiteSpace: 'nowrap' }}>Chatbot Settings</h1>
      </div>
    }>
      <Section icon="settings" title="General" sub="Basic information about your chatbot">
        <Field label="Name"><input className="input" value={name} onChange={e => touch(setName)(e.target.value)} /></Field>
        <Field label="Description" hint="Shown on your dashboard card.">
          <textarea className="textarea" rows={2} value={desc} onChange={e => touch(setDesc)(e.target.value)} />
        </Field>
        <Field label="Welcome message" hint="The first thing visitors see when they open the chat.">
          <textarea className="textarea" rows={2} value={welcome} onChange={e => touch(setWelcome)(e.target.value)} />
        </Field>
      </Section>

      <Section icon="image" title="Appearance" sub="How the widget looks on your site">
        <div className="field-label" style={{ marginBottom: 8 }}>Avatar</div>
        <div className="uploader-box" style={{ marginBottom: 20 }}>
          <span className="uploader-prev" style={{ background: ACCENTS[accent].bg }}><Icon name="bot" size={26} /></span>
          <div>
            <Btn variant="outline" size="sm" icon="upload">Upload image</Btn>
            <div className="field-hint" style={{ marginTop: 6 }}>PNG or SVG, square, at least 128×128.</div>
          </div>
        </div>

        <div className="field-label" style={{ marginBottom: 8 }}>Accent color</div>
        <div className="swatch-row" style={{ marginBottom: 20 }}>
          {Object.entries(ACCENTS).map(([k, v]) => (
            <span key={k} className={'swatch' + (accent === k ? ' sel' : '')} style={{ background: v.bg }} onClick={() => touch(setAccent)(k)} title={k} />
          ))}
          <input className="input" style={{ width: 120, marginLeft: 6, fontFamily: 'var(--mono)', fontSize: 13 }} value={ACCENTS[accent].bg} readOnly />
        </div>

        <div className="field-label" style={{ marginBottom: 8 }}>Widget position</div>
        <div style={{ display: 'flex', gap: 8, maxWidth: 320 }}>
          {['bottom-right', 'bottom-left'].map(p => (
            <button key={p} onClick={() => touch(setPos)(p)} className={'btn ' + (pos === p ? 'btn-primary' : 'btn-outline')} style={{ flex: 1, textTransform: 'capitalize' }}>{p.replace('-', ' ')}</button>
          ))}
        </div>
      </Section>

      <Section icon="zap" title="Behavior" sub="Control how your bot responds">
        <div className="toggle-row">
          <div>
            <div className="tr-title">Answer only from documents</div>
            <div className="tr-sub">Prevents the bot from making things up — it replies only from your knowledge base.</div>
          </div>
          <Toggle on={docsOnly} onClick={() => touch(setDocsOnly)(!docsOnly)} />
        </div>
        <div className="slider-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <div><div className="tr-title">Conversation memory</div><div className="tr-sub">How many previous messages the bot remembers.</div></div>
            <span className="slider-val">{memory} msgs</span>
          </div>
          <input className="slider" type="range" min="1" max="20" step="1" value={memory} onChange={e => touch(setMemory)(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <div className="row-between" style={{ marginBottom: 10 }}>
            <div><div className="tr-title">Temperature</div><div className="tr-sub">Lower is more precise; higher is more creative.</div></div>
            <span className="slider-val">{temp.toFixed(2)}</span>
          </div>
          <input className="slider" type="range" min="0" max="1" step="0.05" value={temp} onChange={e => touch(setTemp)(+e.target.value)} />
        </div>
      </Section>

      <div className="danger-zone settings-section">
        <div className="row-between">
          <div>
            <div className="section-title" style={{ color: 'var(--danger)' }}>Delete this chatbot</div>
            <p className="section-sub mb-0">Permanently removes the bot, its documents, and all conversations. This cannot be undone.</p>
          </div>
          <Btn variant="danger-solid" icon="trash">Delete chatbot</Btn>
        </div>
      </div>

      <div className="sticky-save">
        {saved && <span className="pill pill-live" style={{ alignSelf: 'center' }}><Icon name="check" size={13} />Saved</span>}
        <Btn variant="ghost" onClick={() => go('detail', { bot: bot.id })}>Cancel</Btn>
        <Btn variant="primary" icon="check" disabled={!dirty} onClick={save}>Save changes</Btn>
      </div>
    </Shell>
  );
}

window.ChatbotSettings = ChatbotSettings;
