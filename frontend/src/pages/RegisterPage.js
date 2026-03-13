import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Nombre, email y contraseña son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // Auto-login tras registro para mejorar UX
      await login({ email: form.email, password: form.password });
      toast.success('Cuenta creada correctamente.');
      navigate('/players', { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'No se pudo completar el registro.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-container max-w-md mx-auto px-4">
      <div className="auth-card">
        <h1 className="auth-title">
          <UserPlus size={22} />
          Crear cuenta
        </h1>
        <p className="auth-subtitle">
          Registra tu usuario para empezar a evaluar jugadores.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Nombre
            <input
              type="text"
              name="name"
              className="auth-input"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;

