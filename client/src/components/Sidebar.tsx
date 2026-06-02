// Persistent navy sidebar — brand at top, two nav sections (Workspace + Settings),
// a theme toggle + user pill at the bottom. Collapses to a 76px icon-only rail
// (state in stores/ui). Active item gets the indigo left-border treatment per
// .nav-item.active in design-handoff/styles.css.
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  MessagesSquare,
  BarChart3,
  User,
  Code2,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { Brand } from '@/components/Brand';
import { useAuth } from '@/stores/auth';
import { useChatbots } from '@/stores/chatbots';
import { useUI } from '@/stores/ui';
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
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
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
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium text-slate-300',
          'border-l-[3px] border-transparent transition-colors mb-0.5',
          'hover:bg-white/5 hover:text-white',
          collapsed ? 'justify-center px-0' : 'px-3',
          active && 'bg-primary/15 text-white border-l-primary font-semibold'
        )}
      >
        <Icon size={18} className="flex-none" />
        {!collapsed && <span className="flex-1">{item.label}</span>}
        {!collapsed && item.badge != null ? (
          <span className="bg-white/10 text-slate-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        ) : null}
      </NavLink>
    );
  }

  function renderSectionLabel(label: string) {
    if (collapsed) {
      return <div className="mx-2 mt-4 mb-1.5 border-t border-white/10" />;
    }
    return (
      <div className="px-2.5 mt-4 mb-1.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
        {label}
      </div>
    );
  }

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('');

  const isDark = theme === 'dark';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 bg-navy text-white flex flex-col transition-[width] duration-200 ease-out',
        collapsed ? 'w-[76px]' : 'w-[260px]'
      )}
    >
      {/* Brand + collapse toggle */}
      <div
        className={cn(
          'flex items-center px-3 pt-5 pb-4 gap-2',
          collapsed ? 'flex-col' : 'justify-between'
        )}
      >
        <Brand variant="dark" compact={collapsed} className={collapsed ? '' : 'pl-2'} />
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-none"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden">
        {renderSectionLabel('Workspace')}
        {workspace.map(renderItem)}

        {renderSectionLabel('Settings')}
        {settings.map(renderItem)}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={cn(
            'flex items-center gap-3 w-full py-2.5 rounded-lg text-sm font-medium text-slate-300',
            'hover:bg-white/5 hover:text-white transition-colors',
            collapsed ? 'justify-center px-0' : 'px-3'
          )}
        >
          {isDark ? <Sun size={18} className="flex-none" /> : <Moon size={18} className="flex-none" />}
          {!collapsed && <span className="flex-1 text-left">{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {/* User pill */}
        <NavLink
          to="/account"
          title={collapsed ? (user?.email ?? 'Account') : undefined}
          className={cn(
            'flex items-center gap-2.5 py-2 rounded-[10px] hover:bg-white/5 transition-colors',
            collapsed ? 'justify-center px-0' : 'px-2.5'
          )}
        >
          <span
            className="grid place-items-center w-[34px] h-[34px] rounded-full text-[13px] font-bold text-white flex-none"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            {initials || 'U'}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white leading-tight truncate">
                {user?.name ?? 'You'}
              </div>
              <div className="text-xs text-slate-400 leading-tight truncate">{user?.email}</div>
            </span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
