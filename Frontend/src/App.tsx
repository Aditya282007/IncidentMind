import { useState } from 'react';
import Navbar, { type Page } from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar activePage={page} onNavigate={setPage} />
      {page === 'dashboard'  && <Dashboard onViewIncident={() => setPage('incidents')} />}
      {page === 'incidents'  && <IncidentDetail onBack={() => setPage('dashboard')} />}
      {page === 'reports'    && <Reports />}
      {page === 'analytics'  && <Analytics />}
      {page === 'settings'   && <Settings />}
    </div>
  );
}
