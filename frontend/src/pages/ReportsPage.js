/**
 * Listado de reportes de scouting y enlace a creación.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import api from '../services/api';

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports', { params: { limit: 50 } });
        setReports(res.data?.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

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
              <li key={r.id}>
                <Link
                  to={`/players/${r.player_id}`}
                  className="block rounded-xl bg-slate-800/50 p-4 hover:bg-slate-800/80"
                >
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ReportsPage;
