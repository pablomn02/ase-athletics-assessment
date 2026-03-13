import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Menu, X, Users, BarChart3, GitCompare, FileText } from 'lucide-react';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlayersPage from './pages/PlayersPage';
import AnalysisPage from './pages/AnalysisPage';
import ComparePage from './pages/ComparePage';
import ReportsPage from './pages/ReportsPage';
import ReportFormPage from './pages/ReportFormPage';
import { PlayerDetailPage, PlayerFormPage } from './pages/Players';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const handleLogoutClick = async () => {
    await logout();
  };

  return (
    <div className="app-shell">
      {/* Header y menú solo cuando estás logueado; login/registro a pantalla completa sin barra. */}
      {isAuthenticated && (
        <>
          <header className="app-header">
            <div className="app-brand">
              <span className="app-logo-circle">ASE</span>
              <div className="app-brand-text">
                <span className="app-brand-title">ASE Athletics</span>
                <span className="app-brand-subtitle">Scouting Workspace</span>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 p-2 text-slate-200 hover:bg-slate-800/80"
              onClick={() => setNavOpen((open) => !open)}
              aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={navOpen}
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </header>

          {navOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="app-drawer fixed top-0 right-0 z-50 h-full w-[min(100vw-4rem,280px)] border-l border-slate-800 bg-slate-900/98 shadow-xl flex flex-col pt-6 pb-8 px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="flex justify-end mb-4">
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] touch-manipulation inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
                onClick={() => setNavOpen(false)}
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              <Link to="/players" className="app-drawer-link" onClick={() => setNavOpen(false)}>
                <Users size={18} />
                <span>Jugadores</span>
              </Link>
              <Link to="/analysis" className="app-drawer-link" onClick={() => setNavOpen(false)}>
                <BarChart3 size={18} />
                <span>Análisis</span>
              </Link>
              <Link to="/compare" className="app-drawer-link" onClick={() => setNavOpen(false)}>
                <GitCompare size={18} />
                <span>Comparar</span>
              </Link>
              <Link to="/reports" className="app-drawer-link" onClick={() => setNavOpen(false)}>
                <FileText size={18} />
                <span>Reportes</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await handleLogoutClick();
                  setNavOpen(false);
                }}
                className="app-drawer-link text-left"
              >
                <span>Logout</span>
              </button>
            </nav>
          </aside>
        </>
          )}
        </>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/players" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/create" element={<PlayerFormPage />} />
            <Route path="/players/:id" element={<PlayerDetailPage />} />
            <Route path="/players/edit/:id" element={<PlayerFormPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/create" element={<ReportFormPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
