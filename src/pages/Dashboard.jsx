import React, { useState, useEffect } from 'react';
import {
  Users,
  Music,
  Radio,
  Receipt,
  Mic2,
  CreditCard,
  Disc3,
  Terminal,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { getSchema } from '../data/schema';
import { apiList } from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { GrowthChart } from '../components/dashboard/GrowthChart';
import { DistributionChart } from '../components/dashboard/DistributionChart';
import { RecentRecords } from '../components/dashboard/RecentRecords';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';

export const Dashboard = ({ onNavigate, apiConfig, onOpenConnectionModal }) => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [revenue, setRevenue] = useState(0);
  const [topArtists, setTopArtists] = useState([]);
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [revenueByMode, setRevenueByMode] = useState([]);

  // Dynamic greeting based on user's current hour
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        users,
        songs,
        podcasts,
        payments,
        artists,
        albums,
        playlists,
        episodes,
        subscriptions,
      ] = await Promise.all([
        apiList(getSchema('users')),
        apiList(getSchema('songs')),
        apiList(getSchema('podcasts')),
        apiList(getSchema('payments')),
        apiList(getSchema('artists')),
        apiList(getSchema('albums')),
        apiList(getSchema('playlists')),
        apiList(getSchema('episodes')),
        apiList(getSchema('subscriptions')),
      ]);

      const countsMap = {
        users: users.length,
        songs: songs.length,
        podcasts: podcasts.length,
        payments: payments.length,
        artists: artists.length,
        albums: albums.length,
        playlists: playlists.length,
        episodes: episodes.length,
        subscriptions: subscriptions.length,
      };
      setCounts(countsMap);

      // Compute Total Revenue
      const totalRev = payments.reduce((sum, p) => sum + Number(p.Amount || 0), 0);
      setRevenue(totalRev);

      // Compute Top Artists from Songs -> Albums -> Artists
      const albumMap = Object.fromEntries(albums.map((a) => [a.Album_ID, a]));
      const artistCounts = {};
      songs.forEach((s) => {
        const al = albumMap[s.Album_ID];
        if (al && al.Artist_ID) {
          artistCounts[al.Artist_ID] = (artistCounts[al.Artist_ID] || 0) + 1;
        }
      });

      const sortedArtists = Object.entries(artistCounts)
        .map(([artId, trackCount]) => {
          const art = artists.find((a) => a.Artist_ID === artId) || {};
          return {
            name: art.Name || artId,
            country: art.Country,
            trackCount,
          };
        })
        .sort((a, b) => b.trackCount - a.trackCount);

      setTopArtists(sortedArtists);

      // Compute Recent Playlists with user names
      const userMap = Object.fromEntries(users.map((u) => [u.User_ID, u]));
      const formattedPlaylists = [...playlists]
        .sort((a, b) => (b.Created_Date || '').localeCompare(a.Created_Date || ''))
        .map((p) => ({
          ...p,
          ownerName: userMap[p.User_ID] ? userMap[p.User_ID].First_Name : p.User_ID,
        }));
      setRecentPlaylists(formattedPlaylists);

      // Compute Revenue by Payment Mode
      const modeMap = {};
      payments.forEach((p) => {
        const m = p.Mode || 'Other';
        modeMap[m] = (modeMap[m] || 0) + Number(p.Amount || 0);
      });
      const modeData = Object.entries(modeMap).map(([mode, sum]) => ({
        mode,
        total: sum,
        percent: totalRev > 0 ? (sum / totalRev) * 100 : 0,
      }));
      setRevenueByMode(modeData);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [apiConfig.mode]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-7 animate-fade-in">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-md bg-gradient-to-r from-[#141720] via-[#111319] to-[#0c0e13] border border-white/[0.08] shadow-lg relative overflow-hidden">
        {/* Subtle Waveform Background Silhouette */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-[0.03] pointer-events-none flex items-center justify-end pr-6">
          <svg width="340" height="120" viewBox="0 0 24 24" fill="none" stroke="#f1eee6" strokeWidth="1.5">
            <path d="M2 10v4M6 7v10M10 3v18M14 6v12M18 8v8M22 11v2" />
          </svg>
        </div>

        <div className="space-y-1 z-10">
          <div className="text-xs font-mono text-[#e8a33d] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getGreeting()}, Admin</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[#f1eee6] tracking-tight">
            Wavelength Database Studio
          </h1>
          <p className="text-xs text-[#9aa0ae] max-w-xl">
            Live operational command center for audio catalogue management, BCNF relational integrity, and streaming intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={onOpenConnectionModal}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-mono border transition-all cursor-pointer ${
              apiConfig.mode === 'live'
                ? 'bg-[#3fc9b0]/10 border-[#3fc9b0]/30 text-[#3fc9b0]'
                : 'bg-[#e8a33d]/10 border-[#e8a33d]/30 text-[#e8a33d]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiConfig.mode === 'live' ? 'bg-[#3fc9b0] animate-pulse' : 'bg-[#e8a33d]'
              }`}
            />
            <span>{apiConfig.mode === 'live' ? 'DATABASE CONNECTED' : 'DEMO MODE'}</span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={loadDashboardData}
            loading={loading}
          >
            Sync
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={counts.users ?? '—'}
          subtitle="Registered platform accounts"
          icon={Users}
          trend="+12%"
          trendPositive={true}
          accent="blue"
          onClick={() => onNavigate('users')}
        />
        <StatCard
          title="Songs in Catalogue"
          value={counts.songs ?? '—'}
          subtitle="Active audio track entities"
          icon={Music}
          trend="+5 new"
          trendPositive={true}
          accent="amber"
          onClick={() => onNavigate('songs')}
        />
        <StatCard
          title="Podcasts & Shows"
          value={counts.podcasts ?? '—'}
          subtitle={`${counts.episodes || 0} episodes catalogued`}
          icon={Radio}
          trend="+2 series"
          trendPositive={true}
          accent="violet"
          onClick={() => onNavigate('podcasts')}
        />
        <StatCard
          title="Recorded Revenue"
          value={formatCurrency(revenue)}
          subtitle={`${counts.payments || 0} transaction receipts`}
          icon={Receipt}
          trend="+8.4%"
          trendPositive={true}
          accent="teal"
          onClick={() => onNavigate('payments')}
        />
      </div>

      {/* Secondary Quick Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigate('artists')}
          className="p-3 rounded border border-white/5 bg-[#111319]/80 hover:bg-[#141720] cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Mic2 className="w-3.5 h-3.5 text-[#e8a33d]" />
            <span className="text-xs text-[#9aa0ae]">Artists</span>
          </div>
          <span className="font-mono text-xs font-semibold text-[#f1eee6]">{counts.artists || 0}</span>
        </div>

        <div
          onClick={() => onNavigate('albums')}
          className="p-3 rounded border border-white/5 bg-[#111319]/80 hover:bg-[#141720] cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Disc3 className="w-3.5 h-3.5 text-[#3fc9b0]" />
            <span className="text-xs text-[#9aa0ae]">Albums</span>
          </div>
          <span className="font-mono text-xs font-semibold text-[#f1eee6]">{counts.albums || 0}</span>
        </div>

        <div
          onClick={() => onNavigate('subscriptions')}
          className="p-3 rounded border border-white/5 bg-[#111319]/80 hover:bg-[#141720] cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-[#5b9bd5]" />
            <span className="text-xs text-[#9aa0ae]">Subscriptions</span>
          </div>
          <span className="font-mono text-xs font-semibold text-[#f1eee6]">{counts.subscriptions || 0}</span>
        </div>

        <div
          onClick={() => onNavigate('sql')}
          className="p-3 rounded border border-white/5 bg-[#111319]/80 hover:bg-[#141720] cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#e8a33d] group-hover:animate-pulse" />
            <span className="text-xs text-[#9aa0ae]">SQL Console</span>
          </div>
          <span className="text-[11px] text-[#e8a33d] font-mono">Run Query →</span>
        </div>
      </div>

      {/* Visual Analytics Row: Growth Velocity & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GrowthChart />
        <DistributionChart counts={counts} />
      </div>

      {/* Recent Catalogued Items & Gateways */}
      <RecentRecords
        topArtists={topArtists}
        recentPlaylists={recentPlaylists}
        revenueByMode={revenueByMode}
        onNavigate={onNavigate}
      />
    </div>
  );
};
