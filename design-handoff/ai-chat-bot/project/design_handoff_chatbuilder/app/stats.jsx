// stats.jsx — Screen 8: Analytics
const { useState: useStateS } = React;

function LineChart({ data, w = 820, h = 240 }) {
  const pad = { l: 38, r: 16, t: 16, b: 28 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = Math.ceil(Math.max(...data) / 50) * 50, min = 0;
  const x = i => pad.l + (i / (data.length - 1)) * iw;
  const y = v => pad.t + ih - ((v - min) / (max - min)) * ih;
  const line = data.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  const area = line + ` L ${x(data.length - 1)} ${pad.t + ih} L ${x(0)} ${pad.t + ih} Z`;
  const yticks = [0, max / 4, max / 2, (max * 3) / 4, max];
  const labels = ['30d ago', '20d', '10d', 'Today'];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yticks.map((t, i) => (
        <g key={i}>
          <line className="chart-grid-line" x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} />
          <text className="chart-axis" x={pad.l - 8} y={y(t) + 4} textAnchor="end">{t}</text>
        </g>
      ))}
      <path d={area} fill="url(#lcg)" />
      <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (i % 5 === 0 || i === data.length - 1) ? <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke="#6366f1" strokeWidth="2" /> : null)}
      {labels.map((l, i) => <text key={l} className="chart-axis" x={pad.l + (i / (labels.length - 1)) * iw} y={h - 8} textAnchor="middle">{l}</text>)}
    </svg>
  );
}

function BarChart({ data, w = 820, h = 260 }) {
  const pad = { l: 130, r: 24, t: 8, b: 8 };
  const iw = w - pad.l - pad.r;
  const max = Math.max(...data.map(d => d.v));
  const rowH = (h - pad.t - pad.b) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
      {data.map((d, i) => {
        const bw = (d.v / max) * iw;
        const cy = pad.t + i * rowH + rowH / 2;
        return (
          <g key={d.name}>
            <text className="chart-axis" x={pad.l - 12} y={cy + 4} textAnchor="end" style={{ fontWeight: 600, fontSize: 12.5, fill: '#334155' }}>{d.name}</text>
            <rect x={pad.l} y={cy - 11} width={iw} height={22} rx="6" fill="#f1f5f9" />
            <rect x={pad.l} y={cy - 11} width={Math.max(bw, 6)} height={22} rx="6" fill={ACCENTS[d.color].bg} />
            <text className="chart-axis" x={pad.l + Math.max(bw, 6) + 8} y={cy + 4} style={{ fontWeight: 700, fill: '#334155' }}>{d.v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Analytics({ go }) {
  return (
    <Shell screen="stats" go={go} title="Analytics" sub="Performance across all your chatbots — last 30 days"
      actions={<Btn variant="outline" icon="messagesSquare" onClick={() => go('conversations')}>Conversations</Btn>}>
      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {KPIS.map(k => {
          const positive = k.good === 'down' ? k.trend < 0 : k.trend > 0;
          return (
            <div className="kpi" key={k.label}>
              <div className="k-label">{k.label}</div>
              <div className="k-num">{k.num}</div>
              <div className="k-foot">
                <span className={'s-trend ' + (positive ? 'up' : 'down')} style={{ fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icon name={k.trend >= 0 ? 'trendingUp' : 'trendingDown'} size={13} /><span>{Math.abs(k.trend)}%</span>
                </span>
                <Sparkline data={k.spark} color={ACCENTS[k.color].bg} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-card card-pad" style={{ marginBottom: 22 }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div>
            <div className="card-title">Messages over time</div>
            <div className="card-sub">Last 30 days</div>
          </div>
          <span className="chip chip-indigo"><Icon name="trendingUp" />+18% vs prior period</span>
        </div>
        <LineChart data={MSGS_30D} />
      </div>

      <div className="chart-card card-pad" style={{ marginBottom: 22 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Messages per chatbot</div>
        <BarChart data={MSGS_PER_BOT} />
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Recent Conversations</div>
          <Btn variant="ghost" size="sm" onClick={() => go('conversations')} iconRight="chevronRight">View all</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Chatbot</th><th>First message</th><th>Started</th><th>Messages</th><th>Last activity</th></tr>
            </thead>
            <tbody>
              {CONVERSATIONS.map((c, i) => {
                const bot = botById(c.bot);
                return (
                  <tr key={i}>
                    <td><div className="t-bot"><span className="t-av" style={{ background: ACCENTS[bot.color].bg }}><Icon name="bot" /></span><span className="t-strong">{bot.name}</span></div></td>
                    <td style={{ maxWidth: 280 }}>{c.first}</td>
                    <td className="muted">{c.started}</td>
                    <td><span className="chip">{c.msgs}</span></td>
                    <td className="muted">{c.last}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

window.Analytics = Analytics;
