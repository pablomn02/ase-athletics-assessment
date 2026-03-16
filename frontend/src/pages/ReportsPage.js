/**
 * Listado de reportes de scouting con filtros y enlace a creación.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, AlertCircle, Edit2, Filter } from 'lucide-react';
import api from '../services/api';

const RECOMMENDATION_OPTIONS = [
  { value: '', label: 'Todas las recomendaciones' },
  { value: 'Fichar', label: 'Fichar' },
  { value: 'Monitorear', label: 'Monitorear' },
  { value: 'Pasar', label: 'Pasar' },
];

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const [filterRecommendation, setFilterRecommendation] = useState('');
  const [filterPlayerId, setFilterPlayerId] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get('/players', { params: { limit: 200 } });
        setPlayers(res.data?.data ?? []);
      } catch {
        setPlayers([]);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = { limit: 50 };
        if (filterRecommendation) params.recommendation = filterRecommendation;
        if (filterPlayerId) params.playerId = filterPlayerId;
        const res = await api.get('/reports', { params });
        setReports(res.data?.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [filterRecommendation, filterPlayerId]);

  return (
    <section className="w-full min-h-screen px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Reportes de Scouting</h1>
              <p className="text-slate-400 text-sm">Evaluaciones estructuradas de jugadores</p>
            </div>
          </div>
          <Link
            to="/reports/create"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-slate-900 hover:bg-amber-400"
          >
            <Plus size={18} />
            Nuevo reporte
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/50 p-4">
          <span className="flex items-center gap-2 text-slate-400 font-medium">
            <Filter size={18} />
            Filtros
            {(filterRecommendation || filterPlayerId) && (
              <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-xs text-amber-300">Activos</span>
            )}
          </span>
          <select
            value={filterRecommendation}
            onChange={(e) => setFilterRecommendation(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 min-w-[180px]"
          >
            {RECOMMENDATION_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filterPlayerId}
            onChange={(e) => setFilterPlayerId(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 min-w-[180px]"
          >
            <option value="">Todos los jugadores</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.team ? ` (${p.team})` : ''}</option>
            ))}
          </select>
          {(filterRecommendation || filterPlayerId) && (
            <button
              type="button"
              onClick={() => { setFilterRecommendation(''); setFilterPlayerId(''); }}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 rounded-xl bg-slate-800" />
            <div className="h-20 rounded-xl bg-slate-800" />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900/30 p-12 text-center text-slate-500">
            No hay reportes. <Link to="/reports/create" className="text-amber-400 hover:underline">Crear el primero</Link>.
          </div>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl bg-slate-800/50 overflow-hidden">
                <div className="flex items-stretch gap-2 p-4 hover:bg-slate-800/80">
                  <Link to={`/players/${r.player_id}`} className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-100">{r.player_name}</p>
                        <p className="text-sm text-slate-500">{r.player_team}</p>
                        {r.match_date && (
                          <p className="text-xs text-slate-500 mt-1">{new Date(r.match_date).toLocaleDateString('es-ES')}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                          {r.overall_rating}/10
                        </span>
                        {r.recommendation && (
                          <p className="text-xs text-amber-400 mt-1 truncate max-w-[120px]">{r.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <Link
                    to={`/reports/edit/${r.id}`}
                    className="flex items-center justify-center rounded-lg px-3 py-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors"
                    title="Editar reporte"
                  >
                    <Edit2 size={18} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ReportsPage;
