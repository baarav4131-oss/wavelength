import React from 'react';
import { Menu, Terminal, Network } from 'lucide-react';
import { getSchema } from '../../data/schema';

export const Topbar = ({
  currentView,
  onOpenMobileMenu,
  onOpenConnectionModal,
  apiConfig,
  onNavigate,
}) => {
  const schema = getSchema(currentView);

  const viewTitles = {
    dashboard: 'Studio Overview',
    sql: 'SQL Studio',
    'er-diagram': 'Entity Relationship Model',
    integration: 'API & Backend Integration',
  };

  const title = viewTitles[currentView] || (schema ? schema.label : 'Wavelength');

  return (
    <header className="h-16 border-b border-white/[0.07] bg-[#090a0d]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile trigger & view indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/5 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#686e7d] hidden sm:inline">Wavelength</span>
          <span className="text-[#5c6070] hidden sm:inline">/</span>
          <h2 className="font-semibold text-[#f1eee6] text-sm tracking-tight">{title}</h2>
          {schema && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/5 text-[#9aa0ae] rounded border border-white/5 ml-1 hidden md:inline">
              Table: {schema.sqlTable}
            </span>
          )}
        </div>
      </div>

      {/* Right: Tools & Connection status badge */}
      <div className="flex items-center gap-2.5">
        {/* Quick link to SQL */}
        <button
          onClick={() => onNavigate('sql')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
          title="Open SQL Studio"
        >
          <Terminal className="w-3.5 h-3.5 text-[#3fc9b0]" />
          <span>SQL Studio</span>
        </button>

        {/* Quick link to ER Diagram */}
        <button
          onClick={() => onNavigate('er-diagram')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
          title="View Relational Schema"
        >
          <Network className="w-3.5 h-3.5 text-[#e8a33d]" />
          <span>ER Diagram</span>
        </button>

        {/* Connection status badge (Interactive button to open modal) */}
        <button
          onClick={onOpenConnectionModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium border transition-all cursor-pointer ${
            apiConfig.mode === 'live'
              ? 'bg-[#3fc9b0]/10 border-[#3fc9b0]/30 text-[#3fc9b0] hover:bg-[#3fc9b0]/20'
              : 'bg-[#e8a33d]/10 border-[#e8a33d]/30 text-[#e8a33d] hover:bg-[#e8a33d]/20'
          }`}
          title="Click to configure backend connection"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              apiConfig.mode === 'live'
                ? 'bg-[#3fc9b0] shadow-sm shadow-[#3fc9b0] animate-pulse'
                : 'bg-[#e8a33d]'
            }`}
          />
          <span className="font-mono text-[11px] tracking-tight">
            {apiConfig.mode === 'live' ? 'LIVE DATABASE' : 'DEMO MODE'}
          </span>
        </button>
      </div>
    </header>
  );
};
