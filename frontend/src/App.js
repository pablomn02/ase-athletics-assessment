import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Menu, X, Users } from 'lucide-react';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlayersPage from './pages/PlayersPage';
import ProtectedRoute from './components/ProtectedRoute';
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
          className="md:hidden inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 p-1.5 text-slate-200"
          onClick={() => setNavOpen((open) => !open)}
        >
          {navOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav className="app-nav hidden md:flex">
          {isAuthenticated && (
            <Link to="/players" className="app-nav-link">
              <Users size={16} />
              <span>Jugadores</span>
            </Link>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="app-nav-link">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="app-nav-link secondary">
                <UserPlus size={16} />
                <span>Registro</span>
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="app-nav-link"
            >
              <span>Logout</span>
            </button>
          )}
        </nav>
      </header>

      {navOpen && (
        <nav className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 py-3">
          <div className="flex flex-col gap-2">
            {isAuthenticated && (
              <Link
                to="/players"
                className="app-nav-link"
                onClick={() => setNavOpen(false)}
              >
                <Users size={16} />
                <span>Jugadores</span>
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="app-nav-link"
                  onClick={() => setNavOpen(false)}
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="app-nav-link secondary"
                  onClick={() => setNavOpen(false)}
                >
                  <UserPlus size={16} />
                  <span>Registro</span>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={async () => {
                  await handleLogoutClick();
                  setNavOpen(false);
                }}
                className="app-nav-link"
              >
                <span>Logout</span>
              </button>
            )}
          </div>
        </nav>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/players" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/players" element={<PlayersPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
