/**
 * PlayerDetailPage.js
 * Página de detalle completo de un jugador
 * Muestra: estadísticas, atributos, contrato, valor de mercado
 * Acciones: Editar, Eliminar
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import PlayerStats from './PlayerStats';

const getAvatarColor = (name) => {
  if (!name) return '#0ea5e9';
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const getInitials = (name) => {
  if (!name) return '—';
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

function PlayerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPlayerDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/players/${id}`);
        setPlayer(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el jugador');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerDetail();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/players/${id}`);
      navigate('/players', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el jugador');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full min-h-screen px-4 py-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-32 rounded bg-slate-700"></div>
            <div className="h-48 rounded bg-slate-700"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !player) {
    return (
      <section className="w-full min-h-screen px-4 py-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate('/players')}
            className="mb-6 flex items-center gap-2 text-sky-400 hover:text-sky-300"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          <div
            className="rounded-lg border border-red-500 bg-red-500/10 p-4"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
              <div>
                <h3 className="font-semibold" style={{ color: '#fecaca' }}>
                  Error
                </h3>
                <p style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!player) return null;

  return (
    <section className="w-full min-h-screen px-4 py-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* Botón Volver */}
        <button
          onClick={() => navigate('/players')}
          className="mb-6 flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft size={18} />
          Volver a Jugadores
        </button>

        {/* Error al eliminar */}
        {error && (
          <div
            className="mb-6 rounded-lg border p-4"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
              <p style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Tarjeta Principal del Jugador */}
        <div
          className="mb-8 rounded-2xl border p-8"
          style={{
            borderColor: 'rgba(51, 65, 85, 0.5)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div className="grid gap-8 md:grid-cols-3">
            {/* Avatar */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="h-32 w-32 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4"
                style={{ backgroundColor: getAvatarColor(player.name) }}
              >
                {getInitials(player.name)}
              </div>
              <h1 className="text-2xl font-bold text-center" style={{ color: '#f1f5f9' }}>
                {player.name}
              </h1>
              <p style={{ color: '#cbd5e1' }} className="mt-2">
                {player.position}
              </p>
            </div>

            {/* Información Básica */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                    Equipo
                  </p>
                  <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                    {player.team}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                    Edad
                  </p>
                  <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                    {player.age} años
                  </p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                    Nacionalidad
                  </p>
                  <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                    {player.nationality}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                    Altura
                  </p>
                  <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                    {player.height ? `${player.height} cm` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Mercado */}
              {player.marketValue && (
                <div
                  className="rounded-lg border p-4 mt-6"
                  style={{
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  }}
                >
                  <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                    Valor de Mercado
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                    ${player.marketValue.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link
              to={`/players/edit/${player.id}`}
              className="flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-all"
              style={{
                backgroundColor: '#0ea5e9',
                color: 'white',
              }}
            >
              <Edit2 size={18} />
              Editar
            </Link>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-all"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#fca5a5',
              }}
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {player && <PlayerStats player={player} />}

        {/* Diálogo de Confirmación de Eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div
              className="rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#f1f5f9' }}>
                Confirmar Eliminación
              </h2>
              <p className="mb-6" style={{ color: '#cbd5e1' }}>
                ¿Estás seguro de que deseas eliminar a <strong>{player.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 rounded-lg px-4 py-2 font-semibold transition-all"
                  style={{
                    backgroundColor: 'rgba(51, 65, 85, 0.5)',
                    color: '#cbd5e1',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-lg px-4 py-2 font-semibold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                  }}
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PlayerDetailPage;
