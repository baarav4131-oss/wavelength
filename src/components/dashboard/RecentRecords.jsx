import React from 'react';
import { ArrowRight, Music, ListMusic, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RecentRecords = ({
  topArtists = [],
  recentPlaylists = [],
  revenueByMode = [],
  onNavigate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Top Catalogued Artists */}
      <div className="p-5 rounded-md border border-white/[0.07] bg-[#111319] flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[#f1eee6] tracking-tight flex items-center gap-2">
              <Music className="w-4 h-4 text-[#e8a33d]" />
              <span>Top Artists</span>
            </h3>
            <button
              onClick={() => onNavigate('artists')}
              className="text-[11px] text-[#e8a33d] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-[#686e7d]">Artists with highest track attributions</p>

          <div className="divide-y divide-white/[0.04] mt-3">
            {topArtists.slice(0, 5).map((artist, idx) => (
              <div key={artist.name || idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[#5c6070] text-[11px] w-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="text-[#f1eee6] font-medium block">{artist.name}</span>
                    <span className="text-[10px] text-[#686e7d]">{artist.country || 'Global'}</span>
                  </div>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 text-[#e8a33d] font-semibold">
                  {artist.trackCount} {artist.trackCount === 1 ? 'track' : 'tracks'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Created Playlists */}
      <div className="p-5 rounded-md border border-white/[0.07] bg-[#111319] flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[#f1eee6] tracking-tight flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#3fc9b0]" />
              <span>Recent Playlists</span>
            </h3>
            <button
              onClick={() => onNavigate('playlists')}
              className="text-[11px] text-[#3fc9b0] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-[#686e7d]">User collections created recently</p>

          <div className="divide-y divide-white/[0.04] mt-3">
            {recentPlaylists.slice(0, 5).map((pl, idx) => (
              <div key={pl.Playlist_ID || idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[#5c6070] text-[11px] w-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="text-[#f1eee6] font-medium block">{pl.Playlist_Name}</span>
                    <span className="text-[10px] text-[#686e7d]">by {pl.ownerName || 'User'}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    pl.Visibility === 'Public'
                      ? 'bg-[#3fc9b0]/15 text-[#3fc9b0]'
                      : 'bg-white/5 text-[#9aa0ae]'
                  }`}
                >
                  {pl.Visibility}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Payment Mode */}
      <div className="p-5 rounded-md border border-white/[0.07] bg-[#111319] flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-[#f1eee6] tracking-tight flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#5b9bd5]" />
              <span>Revenue by Gateway</span>
            </h3>
            <button
              onClick={() => onNavigate('payments')}
              className="text-[11px] text-[#5b9bd5] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-[#686e7d]">Total receipts processed by gateway mode</p>

          <div className="space-y-3 mt-4">
            {revenueByMode.map((item) => (
              <div key={item.mode} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#f1eee6] font-medium">{item.mode}</span>
                  <span className="font-mono text-[#3fc9b0] font-semibold">{formatCurrency(item.total)}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5b9bd5] to-[#3fc9b0] rounded-full"
                    style={{ width: `${Math.min(100, Math.max(8, item.percent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
