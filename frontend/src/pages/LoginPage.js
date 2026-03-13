import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/players';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email y contraseña son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      await login({ email: form.email, password: form.password });
      toast.success('Sesión iniciada correctamente.');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'No se pudo iniciar sesión. Revisa tus credenciales.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-container max-w-md mx-auto px-4">
      <div className="auth-card">
        <h1 className="auth-title">
          <LogIn size={22} />
          Inicio de sesión
        </h1>
        <p className="auth-subtitle">
          Accede al panel de scouting con tus credenciales.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="tuemail@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </label>

          <label className="auth-label">
            Contraseña
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="auth-link">
            Crear cuenta
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;

