// Persistent navy sidebar — brand at top, two nav sections (Workspace + Settings),
// user pill at bottom. Active item gets the indigo left-border treatment per
// .nav-item.active in design-handoff/styles.css.
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  MessagesSquare,
  BarChart3,
  User,
  Code2,
  type LucideIcon,
} from 'lucide-react';
import { Brand } from '@/components/Brand';
import { useAuth } from '@/stores/auth';
import { useChatbots } from '@/stores/chatbots';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  matchPrefix?: string; // e.g. /chatbots highlights for /chatbots/:id
}

export function Sidebar() {
  const user = useAuth((s) => s.user);
  const chatbotCount = useChatbots((s) => s.list.length);
  const location = useLocation();

  const workspace: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/chatbots',
      label: 'My Chatbots',
      icon: Bot,
      badge: chatbotCount || undefined,
      matchPrefix: '/chatbots',
    },
    { to: '/conversations', label: 'Conversations', icon: MessagesSquare },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
  ];
  const settings: NavItem[] = [
    { to: '/account', label: 'Account', icon: User },
    { to: '/embed', label: 'Embed', icon: Code2 },
  ];

  function renderItem(item: NavItem) {
    const Icon = item.icon;
    const active = item.matchPrefix
      ? location.pathname.startsWith(item.matchPrefix)
      : location.pathname === item.to;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300',
          'border-l-[3px] border-transparent transition-colors mb-0.5',
          'hover:bg-white/5 hover:text-white',
          active && 'bg-primary/15 text-white border-l-primary font-semibold'
        )}
      >
        <Icon size={18} />
        <span className="flex-1">{item.label}</span>
        {item.badge != null ? (
          <span className="bg-white/10 text-slate-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        ) : null}
      </NavLink>
    );
  }

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('');

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-[260px] bg-navy text-white flex flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <Brand variant="dark" />
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="px-2.5 mt-3.5 mb-1.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
          Workspace
        </div>
        {workspace.map(renderItem)}

        <div className="px-2.5 mt-4 mb-1.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
          Settings
        </div>
        {settings.map(renderItem)}
      </nav>

      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/account"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] hover:bg-white/5 transition-colors"
        >
          <span
            className="grid place-items-center w-[34px] h-[34px] rounded-full text-[13px] font-bold text-white flex-none"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            {initials || 'U'}
          </span>
          <span className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-white leading-tight truncate">
              {user?.name ?? 'You'}
            </div>
            <div className="text-xs text-slate-400 leading-tight truncate">{user?.email}</div>
          </span>
        </NavLink>
      </div>
    </aside>
  );
}
