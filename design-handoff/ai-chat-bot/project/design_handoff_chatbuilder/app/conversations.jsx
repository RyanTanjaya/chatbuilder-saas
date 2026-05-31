// conversations.jsx — Screen 5: Chat Interface / Conversations inbox
const { useState: useStateCv } = React;

function ConvListItem({ c, active, onClick }) {
  const bot = botById(c.bot);
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', gap: 11, alignItems: 'flex-start', width: '100%', textAlign: 'left',
        padding: '13px 14px', border: 'none', borderBottom: '1px solid var(--border)',
        background: active ? 'var(--primary-light)' : 'transparent', cursor: 'pointer',
      }}>
      <span className="t-av" style={{ background: ACCENTS[bot.color].bg, width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flex: 'none' }}>
        <Icon name="bot" size={17} />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <b style={{ fontSize: 13.5, color: 'var(--text-strong)' }}>{bot.name}</b>
          <span style={{ fontSize: 11.5, color: 'var(--muted)', flex: 'none' }}>{c.last}</span>
        </span>
        <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.first}</span>
      </span>
    </button>
  );
}

function Conversations({ go }) {
  const [sel, setSel] = useStateCv(0);
  const conv = CONVERSATIONS[sel];
  const bot = botById(conv.bot);

  return (
    <Shell screen="conversations" go={go} title="Conversations" sub="Live and recent chats across all your bots"
      actions={<Btn variant="outline" icon="barChart" onClick={() => go('stats')}>View analytics</Btn>}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 640, overflow: 'hidden' }}>
        {/* inbox list */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="card-head" style={{ padding: '14px 16px' }}>
            <div className="card-title" style={{ fontSize: 14 }}>Recent</div>
            <span className="chip chip-indigo">{CONVERSATIONS.length}</span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {CONVERSATIONS.map((c, i) => (
              <ConvListItem key={i} c={c} active={i === sel} onClick={() => setSel(i)} />
            ))}
          </div>
        </div>
        {/* active thread */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="card-head">
            <div className="flex items-center gap-12">
              <Avatar color={bot.color} icon="bot" size={38} className="" />
              <div>
                <div className="card-title">{bot.name}</div>
                <div className="card-sub" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                  Started {conv.started} · {conv.msgs} messages
                </div>
              </div>
            </div>
            <Btn variant="ghost" size="sm" icon="settings" onClick={() => go('settings', { bot: bot.id })}>Settings</Btn>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <LiveChat
              key={sel}
              accent={bot.color}
              placeholder={`Reply as ${bot.name}…`}
              showAttach
              initial={SAMPLE_CHAT}
            />
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12, textAlign: 'center' }}>
        Tip: send a message to see the live typing indicator and source citations in action.
      </p>
    </Shell>
  );
}

window.Conversations = Conversations;
