import React from 'react';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Settings as SettingsIcon,
  Bot,
  MessageSquare,
  FileText,
  X
} from 'lucide-react';
// @ts-expect-error - image asset
import lionIcon from '../assets/images/lion_icon_1781116211738.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  userName: string;
  onCloseMobile?: () => void;
  isOpenMobile?: boolean;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userEmail, 
  userName,
  onCloseMobile,
  isOpenMobile = false
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: ArrowUpDown },
    { id: 'agent', label: 'Agente Financeiro', icon: Bot },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'reports', label: 'Relatórios & BI', icon: BarChart3 },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'fiscal', label: 'Relatório Fiscal', icon: FileText },
    { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageSquare },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile drawer dark overlay backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 z-40 md:hidden transition-all duration-300" 
        />
      )}

      <aside 
        id="sidebar-panel" 
        className={`w-64 border-r border-white/10 flex flex-col bg-[#080808] shrink-0 h-full transition-transform duration-300 z-50
          fixed inset-y-0 left-0 md:relative md:translate-x-0 ${
            isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand logo header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/35 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0 overflow-hidden">
              <img 
                src={lionIcon} 
                alt="Logo Leão" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xs font-bold font-display tracking-wider text-white">FINANCE CONTROL</h2>
              <span className="text-[9px] text-amber-400 font-mono font-bold tracking-wider uppercase leading-none mt-0.5">Propósito & Prosperidade</span>
            </div>
          </div>

          {/* Close button inside sidebar on mobile only */}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile} 
              className="md:hidden text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              title="Fechar Menu"
            >
              <X className="w-5 h-5 text-amber-400" />
            </button>
          )}
        </div>

        {/* Navigation section */}
        <nav className="flex-1 flex flex-col py-6 px-4 gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAgent = item.id === 'agent';
            
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive 
                    ? isAgent 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
                      : 'bg-purple-600/15 text-purple-400 border border-purple-500/30 font-semibold' 
                    : 'text-white/55 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isAgent ? (
                  <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                    <img 
                      src={lionIcon} 
                      alt="Leão" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-purple-400' : 'text-white/45 group-hover:text-purple-400/80'
                  }`} />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Simplified User profiles details */}
        <div className="p-4 border-t border-white/10 bg-[#060606] mt-auto">
          <div className="flex items-center gap-3 p-1 rounded-xl">
            <div className="w-10 h-10 rounded-full border border-purple-500/40 p-0.5 flex bg-zinc-900 justify-center items-center font-bold text-xs text-purple-400 font-mono select-none">
              {getInitials(userName)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{userName || 'Familia Silva'}</p>
              <p className="text-[10px] text-white/40 truncate">{userEmail || 'email@dominio.com'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
