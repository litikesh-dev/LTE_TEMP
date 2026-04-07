import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Trophy,
  Settings,
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  TrendingUp,
  UserCircle,
  Menu,
  X,
} from 'lucide-react';
import './RootLayout.css';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/courses', label: 'My Courses', icon: BookOpen, end: false },
  { to: '/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/achievements', label: 'Achievements', icon: Trophy, end: false },
  { to: '/progress', label: 'Progress', icon: TrendingUp, end: false },
];

const bottomNav = [
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
  { to: '/help', label: 'Help & Support', icon: HelpCircle, end: false },
];

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/courses': 'My Courses',
  '/explore': 'Explore',
  '/achievements': 'Achievements',
  '/progress': 'Progress',
  '/settings': 'Settings',
  '/help': 'Help & Support',
};

export function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const pageLabel = routeLabels[location.pathname] ?? 'Page';
  const isMobileSidebarOpen = mobileNavOpen ? ' rl-sidebar--mobile-open' : '';

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className={`rl-shell${collapsed ? ' rl-shell--collapsed' : ''}`}>
      <aside className={`rl-sidebar${isMobileSidebarOpen}`}>
        {/* Logo */}
        <div className="rl-logo">
          <img
            src="/RareMinds.webp"
            alt="RareMinds"
            className={`rl-logo-img${collapsed ? ' rl-logo-img--collapsed' : ''}`}
          />
        </div>

        {/* Main nav */}
        <nav className="rl-nav" aria-label="Main navigation">
          {!collapsed && <p className="rl-nav-group-label">MAIN MENU</p>}

          {mainNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `rl-nav-item${isActive ? ' rl-nav-item--active' : ''}`}
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`rl-nav-icon-wrap${isActive ? ' rl-nav-icon-wrap--active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  {!collapsed && <span className="rl-nav-label">{label}</span>}
                  {isActive && !collapsed && <span className="rl-nav-pip" />}
                </>
              )}
            </NavLink>
          ))}

          {!collapsed && <p className="rl-nav-group-label rl-nav-group-label--mt">SUPPORT</p>}

          {bottomNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `rl-nav-item${isActive ? ' rl-nav-item--active' : ''}`}
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`rl-nav-icon-wrap${isActive ? ' rl-nav-icon-wrap--active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  {!collapsed && <span className="rl-nav-label">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {mobileNavOpen && (
        <button
          className="rl-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/*
       * Collapse toggle â€” sits OUTSIDE the sidebar so it isn't
       * clipped by overflow:hidden on the sidebar element.
       * CSS positions it with fixed + left:calc(sidebar-width - 13px)
       */}
      <button
        className="rl-collapse-btn"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="rl-main">
        {/* Topbar */}
        <header className="rl-topbar">
          <button
            className="rl-mobile-menu-btn"
            onClick={() => setMobileNavOpen(open => !open)}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Left: breadcrumb */}
          <div className="rl-topbar-left">
            <span className="rl-breadcrumb-root">Home</span>
            <ChevronRight size={13} className="rl-breadcrumb-sep" />
            <span className="rl-breadcrumb-current">{pageLabel}</span>
          </div>

          {/* Centre: search */}
          <div className="rl-search-wrap">
            <Search size={15} className="rl-search-icon" />
            <input
              id="topbar-search"
              type="search"
              placeholder="Search courses, topics, instructors"
              className="rl-search-input"
              aria-label="Search"
            />
          </div>

          {/* Right: actions */}
          <div className="rl-topbar-right">
            {/* Notifications */}
            <div className="rl-notif-wrap">
              <button
                id="notif-btn"
                className={`rl-icon-btn${notifOpen ? ' rl-icon-btn--active' : ''}`}
                onClick={() => setNotifOpen(o => !o)}
                aria-label="Notifications"
              >
                <Bell size={17} strokeWidth={1.8} />
                <span className="rl-notif-badge">3</span>
              </button>

              {notifOpen && (
                <div className="rl-notif-panel" role="dialog" aria-label="Notifications">
                  <div className="rl-notif-header">
                    <p className="rl-notif-title">Notifications</p>
                    <button className="rl-notif-mark-all">Mark all read</button>
                  </div>
                  {[
                    { text: 'New lesson added to your course', time: '2 min ago', unread: true },
                    { text: 'You earned the "Fast Learner" badge', time: '1 hr ago', unread: true },
                    { text: 'Deadline tomorrow: UI/UX Design', time: '3 hr ago', unread: true },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className={`rl-notif-item${n.unread ? ' rl-notif-item--unread' : ''}`}
                    >
                      <span className="rl-notif-dot" />
                      <div>
                        <p className="rl-notif-text">{n.text}</p>
                        <p className="rl-notif-time">{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <button className="rl-notif-footer-btn">View all notifications</button>
                </div>
              )}
            </div>

            {/* Profile chip */}
            <button id="profile-btn" className="rl-profile-chip" aria-label="User profile">
              <div className="rl-profile-avatar">AJ</div>
              <div className="rl-profile-info">
                <p className="rl-profile-name">Alex Johnson</p>
                <p className="rl-profile-role">UI/UX Designer</p>
              </div>
              <UserCircle size={14} className="rl-profile-chevron" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="rl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
