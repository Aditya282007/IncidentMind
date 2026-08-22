import { useState } from 'react';
import Header from './components/Header';
import CommandCenterBar from './components/CommandCenterBar';
import Dashboard from './pages/Dashboard';
import ActiveIncident from './pages/ActiveIncident';
import IncidentDetail from './pages/IncidentDetail';
import History from './pages/History';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

type Page = 'dashboard' | 'incidents' | 'history' | 'reports' | 'analytics' | 'settings' | 'incident-detail';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [scenarioId, setScenarioId] = useState<string | undefined>(undefined);

  const navigate = (page: Page | string, sid?: string) => {
    setCurrentPage(page as Page);
    if (sid !== undefined) setScenarioId(sid);
    else if (page !== 'incidents') setScenarioId(undefined);
  };

  const headerPage = (currentPage === 'incident-detail' ? 'incidents' : currentPage) as Exclude<Page, 'incident-detail'>;

  return (
    <div className="bg-[#05081a] min-h-screen">
      <Header
        currentPage={headerPage}
        onNavigate={(p) => navigate(p)}
        showSearch={currentPage === 'analytics'}
        searchPlaceholder="Search analytics..."
      />

      {currentPage === 'dashboard' && (
        <>
          <div className="pt-12">
            <CommandCenterBar />
          </div>
          <Dashboard onNavigate={(p, sid) => navigate(p, sid)} />
        </>
      )}
      {currentPage === 'incidents' && (
        <ActiveIncident
          key={scenarioId ?? 'no-scenario'}
          onNavigate={(p) => navigate(p)}
          initialScenarioId={scenarioId}
        />
      )}
      {currentPage === 'incident-detail' && <IncidentDetail onNavigate={(p) => navigate(p)} />}
      {currentPage === 'history' && <History onNavigate={(p) => navigate(p)} />}
      {currentPage === 'reports' && <Reports onNavigate={(p) => navigate(p)} />}
      {currentPage === 'analytics' && <Analytics />}
      {currentPage === 'settings' && <Settings />}
    </div>
  );
}
