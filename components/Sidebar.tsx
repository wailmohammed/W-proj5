
import React, { useState } from 'react';
import { LayoutDashboard, PieChart, DollarSign, Search, Users, Settings, LogOut, Activity, ChevronDown, PlusCircle, Check, Shield, Bell, X, BarChart2, Landmark, Crown, Moon, Sun, Cloud, CloudOff, Star } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  // Local state for quick portfolio creation
  const [isCreating, setIsCreating] = useState(false);
  const [newPortName, setNewPortName] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const { 
      portfolios = [], 
      activePortfolioId, 
      defaultPortfolioId,
      switchPortfolio, 
      setDefaultPortfolio,
      addNewPortfolio,
      openAddAssetModal,
      notifications = [],
      markAsRead,
      clearNotifications,
      activeView,
      switchView
  } = usePortfolio();

  const safePortfolios = Array.isArray(portfolios) ? portfolios : [];
  const activePortfolio = safePortfolios.find(p => p.id === activePortfolioId) || safePortfolios[0] || { id: 'default', name: 'My Portfolio', type: 'Mixed' };
  
  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'networth', label: 'Net Worth', icon: Landmark },
    { id: 'holdings', label: 'Portfolio', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'dividends', label: 'Dividends', icon: DollarSign },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'knowledge-base', label: 'Help Center', icon: Shield },
  ];

  const isAdminAccess = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleNavigation = (view: ViewState) => {
    switchView(view);
    if (window.innerWidth < 768) {
        onClose();
    }
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPortName.trim()) {
          setLoadingCreate(true);
          try {
              const newId = await addNewPortfolio(newPortName, 'Mixed');
              if (newId) {
                  switchPortfolio(newId);
                  setIsCreating(false);
                  setNewPortName('');
                  setIsPortfolioMenuOpen(false);
              }
          } catch (error) {
              console.error("Create portfolio failed", error);
          } finally {
              setLoadingCreate(false);
          }
      }
  };

  const handleSetDefault = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDefaultPortfolio(id);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4">
          <div className="flex md:hidden justify-end mb-2">
             <button onClick={onClose} className="p-2 text-slate-500 hover:text-white">
               <X className="w-5 h-5" />
             </button>
          </div>

          {/* Portfolio Switcher */}
          <div className="relative mb-4">
            <button 
              onClick={() => setIsPortfolioMenuOpen(!isPortfolioMenuOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
            >
              <div className="bg-brand-600 p-2.5 rounded-lg shadow-lg shadow-brand-600/20 group-hover:shadow-brand-500/40 transition-all">
                  <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">WealthOS</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{activePortfolio.name}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isPortfolioMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Portfolio Dropdown */}
            {isPortfolioMenuOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
                  {safePortfolios.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchPortfolio(p.id);
                        setIsPortfolioMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm group transition-colors ${
                        activePortfolioId === p.id 
                          ? 'bg-brand-50 text-brand-600 dark:bg-indigo-600/10 dark:text-indigo-400' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1">
                            <span className="font-medium truncate max-w-[140px]">{p.name}</span>
                            {defaultPortfolioId === p.id && <Star className="w-3 h-3 fill-brand-500 text-brand-500" />}
                        </div>
                        <span className="text-[10px] text-slate-500">{p.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          {defaultPortfolioId !== p.id && (
                              <div 
                                onClick={(e) => handleSetDefault(e, p.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-500 transition-all"
                                title="Set as Default Dashboard"
                              >
                                  <Star className="w-3 h-3" />
                              </div>
                          )}
                          {activePortfolioId === p.id && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950/30">
                   {isCreating ? (
                       <form onSubmit={handleCreatePortfolio} className="flex flex-col gap-2 p-1">
                           <input 
                               type="text"
                               autoFocus
                               placeholder="Portfolio Name"
                               className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:border-brand-500 outline-none"
                               value={newPortName}
                               onChange={(e) => setNewPortName(e.target.value)}
                           />
                           <div className="flex gap-1">
                               <button type="submit" disabled={loadingCreate} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-1 rounded disabled:opacity-50">
                                   {loadingCreate ? 'Creating...' : 'Create'}
                               </button>
                               <button type="button" onClick={() => setIsCreating(false)} className="px-2 bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs rounded hover:bg-slate-300 dark:hover:bg-slate-700">Cancel</button>
                           </div>
                       </form>
                   ) : (
                       <button 
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Create Portfolio
                       </button>
                   )}
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Add Button */}
          <button 
              onClick={() => {
                  openAddAssetModal();
                  if(window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-all mb-2"
          >
              <PlusCircle className="w-4 h-4 text-brand-600 dark:text-emerald-400" /> Add Transaction
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeView === item.id
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-500 shadow-sm border border-slate-200 dark:border-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeView === item.id ? 'text-brand-600 dark:text-brand-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          {isAdminAccess && (
              <button
                  onClick={() => handleNavigation('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mt-4 border border-dashed border-brand-200 dark:border-brand-500/30 ${
                    activeView === 'admin'
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
              >
                  {user?.role === 'SUPER_ADMIN' ? <Crown className="w-5 h-5 text-amber-500" /> : <Shield className="w-5 h-5" />}
                  <span className="font-medium">
                      {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Panel'}
                  </span>
              </button>
          )}
        </nav>

        <div className="px-6 pt-2 pb-1">
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                isSupabaseConfigured 
                ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' 
                : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
            }`}>
                {isSupabaseConfigured ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                {isSupabaseConfigured ? 'Cloud Sync Active' : 'Local Demo Mode'}
            </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 relative">
          <div className="mb-1 px-1">
               <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                  <div className="flex items-center gap-3">
                      <div className="relative">
                          <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                          {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                          )}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                      <span className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold px-1.5 py-0.5 rounded">{unreadCount}</span>
                  )}
               </button>
          </div>

          {/* Notifications Popover */}
          {isNotifOpen && (
              <div className="absolute bottom-full left-4 w-[240px] mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fade-in-up">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Alerts</span>
                      {notifications.length > 0 && (
                          <button onClick={clearNotifications} className="text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white">Clear</button>
                      )}
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                      {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-xs">No new notifications</div>
                      ) : (
                          notifications.map(n => (
                              <div 
                                  key={n.id} 
                                  onClick={() => markAsRead(n.id)}
                                  className={`p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${n.read ? 'opacity-50' : 'bg-slate-50 dark:bg-slate-800/20'}`}
                              >
                                  <div className="flex justify-between items-start mb-1">
                                      <span className={`text-xs font-bold ${n.type === 'success' ? 'text-emerald-500 dark:text-emerald-400' : n.type === 'warning' ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400'}`}>
                                          {n.title}
                                      </span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">{n.message}</p>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          )}

          <button 
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button 
            onClick={() => handleNavigation('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === 'settings'
               ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
               : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
