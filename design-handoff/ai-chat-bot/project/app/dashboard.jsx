// dashboard.jsx — Screen 3: Dashboard
const { useState: useStateD } = React;

function BotCard({ bot, go }) {
  return (
    <div className="bot-card">
      <Avatar color={bot.color} icon="bot" />
      <div className="bot-name">{bot.name}</div>
      <div className="bot-desc">{bot.desc}</div>
      <div className="bot-chips">
        <span className="chip"><Icon name="fileText" />{bot.docs} docs</span>
        <span className="chip"><Icon name="messageSquare" />{bot.msgs} msgs</span>
      </div>
      <div className="bot-actions">
        <Btn variant="primary" size="sm" onClick={() => go('detail', { bot: bot.id })}>Open</Btn>
        <Btn variant="outline" size="sm" icon="settings" onClick={() => go('settings', { bot: bot.id })}>Settings</Btn>
      </div>
    </div>
  );
}

function Dashboard({ go }) {
  const [q, setQ] = useStateD('');
  const filtered = BOTS.filter(b => b.name.toLowerCase().includes(q.toLowerCase()) || b.desc.toLowerCase().includes(q.toLowerCase()));
  const totalDocs = BOTS.reduce((s, b) => s + b.docs, 0);
  const totalMsgs = BOTS.reduce((s, b) => s + b.msgs, 0);

  const actions = (
    <>
      <div className="input-wrap" style={{ width: 240 }}>
        <span className="input-icon"><Icon name="search" size={18} /></span>
        <input className="input" placeholder="Search chatbots…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <Btn variant="primary" icon="plus" onClick={() => go('detail', { bot: 'support', create: true })}>New Chatbot</Btn>
    </>
  );

  return (
    <Shell screen="dashboard" go={go} title="Your Chatbots" sub="Manage, train, and deploy your AI assistants" actions={actions}>
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatTile icon="bot" color="indigo" num={BOTS.length} label="Total Chatbots" trend={+2} />
        <StatTile icon="fileText" color="purple" num={totalDocs} label="Total Documents" trend={+9} />
        <StatTile icon="messageSquare" color="green" num={totalMsgs.toLocaleString()} label="Messages This Month" trend={+18} />
        <StatTile icon="messagesSquare" color="amber" num="24" label="Active Conversations" trend={+5} />
      </div>

      {q && filtered.length === 0 ? (
        <div className="card card-pad muted" style={{ textAlign: 'center', padding: 48 }}>
          No chatbots match "<b>{q}</b>".
        </div>
      ) : (
        <div className="bot-grid">
          {filtered.map(b => <BotCard key={b.id} bot={b} go={go} />)}
          {!q && (
            <div className="bot-card bot-card-empty" onClick={() => go('detail', { bot: 'support', create: true })}>
              <div>
                <span className="plus"><Icon name="plus" size={22} /></span>
                <div style={{ fontWeight: 600, color: 'inherit' }}>Create new chatbot</div>
                <div style={{ fontSize: 12.5, marginTop: 4 }}>Upload docs &amp; go live in minutes</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

window.Dashboard = Dashboard;
window.BotCard = BotCard;
