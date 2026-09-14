import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ConnectionModal } from './components/layout/ConnectionModal';
import { ToastProvider } from './components/ui/Toast';
import { Dashboard } from './pages/Dashboard';
import { SQLStudio } from './pages/SQLStudio';
import { ERDiagram } from './pages/ERDiagram';
import { Integration } from './pages/Integration';
import { EntityPage } from './pages/EntityPage';
import { SCHEMA, getSchema } from './data/schema';
import { apiList, getApiConfig, subscribeToApi } from './services/api';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState(getApiConfig());
  const [counts, setCounts] = useState({});

  // Refresh counts across all 11 tables
  const refreshCounts = useCallback(async () => {
    const countsMap = {};
    await Promise.all(
      SCHEMA.map(async (s) => {
        try {
          const list = await apiList(s);
          countsMap[s.key] = list.length;
        } catch {
          countsMap[s.key] = 0;
        }
      })
    );
    setCounts(countsMap);
  }, []);

  useEffect(() => {
    refreshCounts();

    // Subscribe to API/DB changes (e.g. when record added/deleted or mode toggled)
    const unsubscribe = subscribeToApi(() => {
      setApiConfig(getApiConfig());
      refreshCounts();
    });
    return () => unsubscribe();
  }, [refreshCounts]);

  // Record count change from inside an EntityPage.
  // Keep this callback stable so EntityPage does not reload in a render loop.
  const handleRecordCountChange = useCallback((entityKey, newCount) => {
    setCounts((prev) => {
      if (prev[entityKey] === newCount) return prev;
      return { ...prev, [entityKey]: newCount };
    });
  }, []);

  // Render view
  const renderMainView = () => {
    if (currentView === 'dashboard') {
      return (
        <Dashboard
          onNavigate={setCurrentView}
          apiConfig={apiConfig}
          onOpenConnectionModal={() => setConnectionModalOpen(true)}
        />
      );
    }
    if (currentView === 'sql') {
      return <SQLStudio />;
    }
    if (currentView === 'er-diagram') {
      return <ERDiagram onNavigate={setCurrentView} />;
    }
    if (currentView === 'integration') {
      return <Integration />;
    }

    // Entity tables (Songs, Artists, Albums, etc.)
    const schema = getSchema(currentView);
    if (schema) {
      return (
        <EntityPage
          key={currentView}
          entityKey={currentView}
          onRecordCountChange={handleRecordCountChange}
        />
      );
    }

    return (
      <div className="p-12 text-center text-sm text-[#9aa0ae]">
        View not found. Return to{' '}
        <button onClick={() => setCurrentView('dashboard')} className="text-[#e8a33d] underline">
          Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#f1eee6] flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        counts={counts}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        apiMode={apiConfig.mode}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          currentView={currentView}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenConnectionModal={() => setConnectionModalOpen(true)}
          apiConfig={apiConfig}
          onNavigate={setCurrentView}
        />

        <main className="flex-1 overflow-y-auto">{renderMainView()}</main>
      </div>

      {/* Backend Connection Modal */}
      <ConnectionModal
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
        onStatusChange={() => {
          setApiConfig(getApiConfig());
          refreshCounts();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
