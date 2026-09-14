import React from 'react';
import {
  LayoutDashboard,
  Music,
  Mic2,
  Disc3,
  ListMusic,
  Radio,
  Layers,
  Sparkles,
  Users,
  CreditCard,
  Receipt,
  Laptop,
  Terminal,
  Network,
  Code2,
  X,
  Database,
  RotateCcw,
} from 'lucide-react';
import { NAVIGATION_GROUPS } from '../../data/schema';
import { resetMockData } from '../../services/api';
import { useToast } from '../ui/useToast';


const ICON_MAP = {
  LayoutDashboard,
  Music,
  Mic2,
  Disc3,
  ListMusic,
  Radio,
  Layers,
  Sparkles,
  Users,
  CreditCard,
  Receipt,
  Laptop,
  Terminal,
  Network,
  Code2,
};

export const Sidebar = ({
  currentView,
  onNavigate,
  counts = {},
  isOpen = false,
  onCloseMobile,
  apiMode = 'demo',
}) => {
  const { toast } = useToast();

  const handleReset = () => {
    if (confirm('Reset demo database to original seed records?')) {
      resetMockData();
      toast('Demo database reset to factory seed data');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#090a0d] border-r border-white/[0.07] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.07] bg-[#07080a]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            {/* Wavelength Geometric Waveform Logo */}
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#e8a33d] to-[#b3741d] flex items-center justify-center shadow-md shadow-[#e8a33d]/20 text-[#0c0e12]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 10v4" />
                <path d="M6 7v10" />
                <path d="M10 3v18" />
                <path d="M14 6v12" />
                <path d="M18 8v8" />
                <path d="M22 11v2" />
              </svg>
            </div>
            <div>
              <div className="font-display font-semibold text-sm tracking-wide text-[#f1eee6] flex items-center gap-1.5">
                Wavelength
                <span className="text-[9px] font-mono font-medium px-1 py-0.2 bg-[#e8a33d]/15 text-[#e8a33d] rounded">
                  DBMS
                </span>
              </div>
              <div className="text-[10px] text-[#686e7d] tracking-wider uppercase font-mono">
                Database Studio
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-[#9aa0ae] hover:text-[#f1eee6] lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 select-none">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="px-2.5 mb-1.5 text-[10px] font-mono font-medium text-[#5c6070] tracking-widest uppercase">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] || Database;
                  const isActive = currentView === item.key;
                  const count = counts[item.key];

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onNavigate(item.key);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-[#181b22] text-[#f1eee6] font-semibold border-l-2 border-[#e8a33d] pl-[8px]'
                          : 'text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#e8a33d]'
                              : 'text-[#686e7d] group-hover:text-[#9aa0ae]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Row count pill */}
                      {count !== undefined && count !== null && (
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                            isActive
                              ? 'bg-[#e8a33d]/20 text-[#e8a33d]'
                              : 'text-[#5c6070] group-hover:text-[#9aa0ae]'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/[0.07] bg-[#07080a] space-y-2">
          {apiMode === 'demo' && (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-[#686e7d] hover:text-[#9aa0ae] hover:bg-white/5 rounded border border-white/5 transition-colors cursor-pointer"
              title="Reset mock data to factory defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo Seed Data</span>
            </button>
          )}

          <div className="px-2 py-1 text-[10px] text-[#5c6070] flex items-center justify-between">
            <span>Relational DBMS v1.0</span>
            <span className="font-mono text-[#e8a33d]/80">BCNF Model</span>
          </div>
        </div>
      </aside>
    </>
  );
};
