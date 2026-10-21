import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  ShieldCheck,
  Database,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UploadCloud,
  Building2,
  X,
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hospitalName: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  hospitalName,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Ringkasan',
      sublabel: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'trends' as NavigationTab,
      label: 'Tren Penyakit',
      sublabel: 'Disease Trends',
      icon: TrendingUp,
    },
    {
      id: 'forecast' as NavigationTab,
      label: 'Prakiraan Kasus',
      sublabel: 'Forecast Explorer',
      icon: LineChart,
    },
    {
      id: 'supply-demand' as NavigationTab,
      label: 'Kebutuhan & Stok',
      sublabel: 'Supply vs Demand',
      icon: ShieldAlert,
    },
    {
      id: 'models' as NavigationTab,
      label: 'Akurasi Model',
      sublabel: 'Model Accuracy',
      icon: ShieldCheck,
    },
    {
      id: 'data-management' as NavigationTab,
      label: 'Rekam Data',
      sublabel: 'Data Catalog',
      icon: Database,
    },
    {
      id: 'csv-import' as NavigationTab,
      label: 'Unggah CSV',
      sublabel: 'Import CSV',
      icon: UploadCloud,
      isAction: true,
    },
    {
      id: 'import-history' as NavigationTab,
      label: 'Riwayat Unggah',
      sublabel: 'Import History',
      icon: History,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Pengaturan',
      sublabel: 'Settings',
      icon: Settings,
    },
  ];

  const handleTabClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 z-50 shrink-0 h-full ${
          isCollapsed ? 'lg:w-18' : 'lg:w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  EpiTrend
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Sistem Prakiraan Rumah Sakit
                </span>
              </div>
            )}
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hospital Sub-header */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate font-medium">{hospitalName.replace(' (Main Campus)', '')}</span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
            {!isCollapsed || isMobileOpen ? 'Menu Utama' : '•'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={isCollapsed && !isMobileOpen ? `${item.label} (${item.sublabel})` : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left group ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${
                  item.isAction
                    ? 'mt-3 border border-dashed border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20'
                    : ''
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <div className="flex flex-col truncate">
                      <span className="truncate font-medium">{item.label}</span>
                      <span className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                        {item.sublabel}
                      </span>
                    </div>
                    {item.isAction && (
                      <span className="text-[9px] font-semibold text-teal-300 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800/80">
                        Baru
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-semibold text-xs shrink-0">
                  EV
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate">Dr. Evelyn Vance</div>
                  <div className="text-[10px] text-slate-400 truncate">Staf Surveilans Medis</div>
                </div>
              </div>
            )}

            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-auto hidden lg:block"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
