// shell.jsx — navigation shell, sidebar, topbar, shared primitives
const { useState, useEffect, useRef, createContext, useContext } = React;

const NavCtx = createContext({ screen: 'dashboard', go: () => {} });
const useNav = () => useContext(NavCtx);
window.NavCtx = NavCtx;
window.useNav = useNav;

/* ---------- Sidebar ---------- */
function Sidebar({ screen, go, open, setOpen }) {
  const item = (id, label, icon, target, badge) => {
    const active = screen === id || (Array.isArray(id) && id.includes(screen));
    const key = Array.isArray(id) ? id[0] : id;
    return (
      <a key={key} className={'nav-item' + (active ? ' active' : '')}
         onClick={() => { go(target || key); setOpen(false); }}>
        <Icon name={icon} />
        <span>{label}</span>
        {badge ? <span className="nav-badge">{badge}</span> : null}
      </a>
    );
  };
  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div className="sidebar-brand">
        <span className="brand-logo">
          <Icon name="messageSquare" size={19} />
          <span className="spark"><Icon name="sparkles" size={13} /></span>
        </span>
        <span className="brand-name">Chat<b>Builder</b></span>
      </div>
      <nav className="nav">
        <div className="nav-section">Workspace</div>
        {item('dashboard', 'Dashboard', 'dashboard')}
        {item(['mychatbots'], 'My Chatbots', 'bot', 'mychatbots', '6')}
        {item('conversations', 'Conversations', 'messagesSquare')}
        {item('stats', 'Stats', 'barChart')}
        <div className="nav-section">Settings</div>
        {item('account', 'Account', 'user')}
        {item('embed', 'Embed', 'code')}
      </nav>
      <div className="sidebar-foot">
        <a className="user-pill" onClick={() => { go('account'); setOpen(false); }}>
          <span className="avatar" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>JM</span>
          <span>
            <div className="u-name">Jordan Meyer</div>
            <div className="u-mail">jordan@acme.io</div>
          </span>
        </a>
      </div>
    </aside>
  );
}

/* ---------- App shell with sidebar ---------- */
function Shell({ screen, go, title, sub, actions, narrow, children, noPad, headerContent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <Sidebar screen={screen} go={go} open={open} setOpen={setOpen} />
      <div className={'scrim' + (open ? ' show' : '')} onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen(true)} aria-label="Menu"><Icon name="menu" /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            {headerContent ? headerContent : (
              <>
                {title ? <h1>{title}</h1> : null}
                {sub ? <div className="sub">{sub}</div> : null}
              </>
            )}
          </div>
          {actions ? <div className="topbar-actions">{actions}</div> : null}
        </header>
        <div className={'content' + (noPad ? '' : '') + (narrow ? '' : '')} style={noPad ? { padding: 0 } : undefined}>
          <div className={narrow ? 'content-narrow fade-in' : 'fade-in'}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- primitives ---------- */
function Btn({ variant = 'primary', size, icon, iconRight, children, className = '', ...rest }) {
  const cls = `btn btn-${variant} ${size ? 'btn-' + size : ''} ${className}`;
  return (
    <button className={cls} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} /> : null}
    </button>
  );
}

function Field({ label, hint, error, action, children }) {
  return (
    <div className="field">
      {(label || action) && (
        <div className="field-row">
          {label ? <label className="field-label">{label}</label> : <span />}
          {action || null}
        </div>
      )}
      {children}
      {error ? <span className="field-err">{error}</span> : (hint ? <span className="field-hint">{hint}</span> : null)}
    </div>
  );
}

function Avatar({ color = 'indigo', icon = 'bot', size = 48, className = '' }) {
  const a = ACCENTS[color] || ACCENTS.indigo;
  return (
    <span className={'bot-avatar ' + className} style={{ background: a.bg, width: size, height: size }}>
      <Icon name={icon} size={size * 0.5} />
    </span>
  );
}

function StatTile({ icon, color, num, label, trend }) {
  const a = ACCENTS[color] || ACCENTS.indigo;
  return (
    <div className="stat-tile">
      <div className="s-icon" style={{ background: a.soft, color: a.text }}><Icon name={icon} /></div>
      <div className="s-num">{num}</div>
      <div className="s-label">{label}</div>
      {trend != null && (
        <div className={'s-trend ' + (trend >= 0 ? 'up' : 'down')}>
          <Icon name={trend >= 0 ? 'trendingUp' : 'trendingDown'} size={13} />
          <span>{Math.abs(trend)}% this month</span>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onClick }) {
  return <button className={'toggle' + (on ? ' on' : '')} onClick={onClick} role="switch" aria-checked={on}><span className="knob" /></button>;
}

/* ---------- mini sparkline ---------- */
function Sparkline({ data, color = '#6366f1', w = 90, h = 30 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / rng) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${w} ${h} L 0 ${h} Z`;
  const id = 'sg' + color.replace('#', '');
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

Object.assign(window, { Sidebar, Shell, Btn, Field, Avatar, StatTile, Toggle, Sparkline, useNav });
