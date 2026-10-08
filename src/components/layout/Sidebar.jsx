import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  BarChart3,
  User,
  Zap
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/tasks', label: 'Tasks & Kanban', icon: CheckSquare },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-57px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50 flex items-center space-x-3">
          <Zap className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-100">Smart Workspace</p>
            <p className="text-[10px] text-slate-400">Live STOMP Active</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-center">
        <p className="text-[11px] font-semibold text-slate-400">TaskFlow TT Academic Project</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Spring Boot 3 + React 18</p>
      </div>
    </aside>
  );
};
