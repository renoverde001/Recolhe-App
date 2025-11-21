import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  MessageSquareText, 
  History, 
  Menu, 
  X, 
  LogOut, 
  Recycle,
  Moon,
  Sun,
  Gift,
  Trash2,
  Map,
  Repeat
} from 'lucide-react';
import { View, User, UserRole, Language } from '../types';
import { translations } from '../utils/translations';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  user: User;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onToggleRole: () => void;
  language: Language;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate, 
  onLogout, 
  user, 
  isDarkMode, 
  toggleTheme,
  onToggleRole,
  language
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  // Define navigation items
  const allNavItems = [
    { id: View.DASHBOARD, label: t.nav.dashboard, icon: LayoutDashboard, roles: [UserRole.USER, UserRole.COLLECTOR] },
    { id: View.PICKUP, label: t.nav.pickup, icon: Truck, roles: [UserRole.USER] },
    { id: View.SMART_BIN, label: t.nav.smartBin, icon: Trash2, roles: [UserRole.USER] },
    { id: View.MAP, label: user.role === UserRole.COLLECTOR ? t.nav.routeMap : t.nav.liveMap, icon: Map, roles: [UserRole.USER, UserRole.COLLECTOR] },
    { id: View.REWARDS, label: t.nav.rewards, icon: Gift, roles: [UserRole.USER, UserRole.COLLECTOR] }, 
    { id: View.ASSISTANT, label: t.nav.assistant, icon: MessageSquareText, roles: [UserRole.USER, UserRole.COLLECTOR] },
    { id: View.HISTORY, label: t.nav.history, icon: History, roles: [UserRole.USER, UserRole.COLLECTOR] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex transition-colors duration-200 font-sans text-slate-900 dark:text-slate-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Floating Style on Desktop */}
      <aside 
        className={`
          fixed lg:sticky top-0 h-screen z-50 w-72 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 ease-out flex flex-col shadow-2xl lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:bg-opacity-95 lg:backdrop-blur-xl lg:m-4 lg:h-[calc(100vh-32px)] lg:rounded-3xl
        `}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <div>
               <span className="text-2xl font-extrabold tracking-tight leading-none block">Recolhe<span className="text-emerald-400">+</span></span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-0.5">Renoverde</span>
            </div>
          </div>
          <button 
            className="lg:hidden p-1 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-100 -z-10" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`} />
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 mt-auto space-y-4">
          <div className="bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-slate-700/50">
             {/* Role Switcher */}
             <button 
              onClick={onToggleRole}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-xl transition-colors group"
            >
               <div className="flex items-center gap-3">
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.role === UserRole.USER ? 'Go to Collector' : 'Go to User'}</span>
               </div>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
            >
               <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isDarkMode ? t.common.darkMode : t.common.lightMode}</span>
               </div>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-2 pt-2 pb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase shadow-lg ring-2 ring-offset-2 ring-offset-slate-900 ${user.role === UserRole.COLLECTOR ? 'bg-blue-600 ring-blue-600' : 'bg-emerald-600 ring-emerald-600'}`}>
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title={t.common.signOut}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen relative overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30 transition-colors shadow-sm">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
             <Recycle className="w-6 h-6 text-emerald-500" />
             <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Recolhe<span className="text-emerald-500">+</span></span>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
             <header className="mb-10 hidden lg:block animate-slide-up">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                      {currentView === View.DASHBOARD && `${t.dashboard.welcomeBack}, ${user.name.split(' ')[0]}!`}
                      {currentView === View.PICKUP && t.pickup.title}
                      {currentView === View.REWARDS && t.rewards.title}
                      {currentView === View.ASSISTANT && t.assistant.title}
                      {currentView === View.HISTORY && t.history.title}
                      {currentView === View.SMART_BIN && t.smartBin.title}
                      {currentView === View.MAP && (user.role === UserRole.COLLECTOR ? t.map.routeTitle : t.map.title)}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                       {currentView === View.DASHBOARD && (user.role === UserRole.COLLECTOR ? t.auth.roleCollectorDesc : t.auth.roleUserDesc)}
                       {currentView === View.PICKUP && t.pickup.subtitle}
                       {currentView === View.REWARDS && t.rewards.subtitle}
                       {currentView === View.ASSISTANT && t.assistant.subtitle}
                       {currentView === View.HISTORY && t.history.subtitle}
                       {currentView === View.SMART_BIN && t.smartBin.subtitle}
                       {currentView === View.MAP && t.map.subtitle}
                    </p>
                  </div>
                </div>
             </header>
             
             <div className="animate-fade-in pb-10">
                {children}
             </div>
          </div>

          {/* Renoverde Footer */}
          <footer className="py-8 text-center border-t border-slate-200/60 dark:border-slate-800/60 mt-8">
             <div className="flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
               <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.common.poweredBy}</span>
               <div className="flex items-center gap-1.5 select-none">
                <div className="w-5 h-5 bg-emerald-600 rounded-tl-lg rounded-br-lg flex items-center justify-center shadow-sm">
                  <Recycle className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tracking-tight text-sm">Renoverde</span>
              </div>
             </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Layout;