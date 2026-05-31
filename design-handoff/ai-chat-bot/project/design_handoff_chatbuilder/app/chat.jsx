// chat.jsx — reusable chat thread + live chat logic
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

function pickReply(text) {
  const t = text.toLowerCase();
  for (const c of CANNED) { if (c.match.some(m => t.includes(m))) return c; }
  return CANNED_FALLBACK;
}

function Message({ m, accent = 'indigo' }) {
  if (m.typing) {
    return (
      <div className="msg-row bot">
        <span className="msg-av" style={{ background: ACCENTS[accent].bg }}><Icon name="bot" /></span>
        <div className="bubble" style={{ padding: 0 }}>
          <div className="typing"><span /><span /><span /></div>
        </div>
      </div>
    );
  }
  return (
    <div className={'msg-row ' + m.from}>
      {m.from === 'bot' && <span className="msg-av" style={{ background: ACCENTS[accent].bg }}><Icon name="bot" /></span>}
      <div>
        <div className="bubble" style={m.from === 'user' ? { background: ACCENTS[accent].bg } : undefined}>{m.text}</div>
        {m.cites && m.cites.length > 0 && (
          <div className="cite-row">
            {m.cites.map((c, i) => (
              <span className="cite-chip" key={i}><Icon name="fileText" />{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// LiveChat: scrollable message list + working input with canned replies & typing
function LiveChat({ initial, accent = 'indigo', placeholder = 'Ask a question…', showAttach = false }) {
  const [msgs, setMsgs] = useStateC(initial || []);
  const [val, setVal] = useStateC('');
  const [busy, setBusy] = useStateC(false);
  const scrollRef = useRefC(null);
  const taRef = useRefC(null);

  useEffectC(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = () => {
    const text = val.trim();
    if (!text || busy) return;
    setMsgs(m => [...m, { from: 'user', text }]);
    setVal('');
    if (taRef.current) taRef.current.style.height = 'auto';
    setBusy(true);
    setTimeout(() => {
      setMsgs(m => [...m, { typing: true }]);
    }, 250);
    setTimeout(() => {
      const reply = pickReply(text);
      setMsgs(m => [...m.filter(x => !x.typing), { from: 'bot', text: reply.text, cites: reply.cites }]);
      setBusy(false);
    }, 1500);
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };
  const onInput = (e) => {
    setVal(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
  };

  return (
    <div className="chat-wrap">
      <div className="chat-scroll" ref={scrollRef}>
        {msgs.map((m, i) => <Message key={i} m={m} accent={accent} />)}
      </div>
      <div className="chat-input">
        {showAttach && <button className="ci-icon-btn" title="Attach"><Icon name="paperclip" size={18} /></button>}
        <textarea ref={taRef} rows={1} placeholder={placeholder} value={val} onChange={onInput} onKeyDown={onKey} />
        <button className="send-btn" onClick={send} disabled={!val.trim() || busy} aria-label="Send"><Icon name="send" size={18} /></button>
      </div>
    </div>
  );
}

// Static thread (for showcase with a fixed typing bubble)
function StaticThread({ msgs, accent = 'indigo' }) {
  return (
    <div className="chat-scroll" style={{ overflow: 'visible' }}>
      {msgs.map((m, i) => <Message key={i} m={m} accent={accent} />)}
    </div>
  );
}

Object.assign(window, { Message, LiveChat, StaticThread, pickReply });
