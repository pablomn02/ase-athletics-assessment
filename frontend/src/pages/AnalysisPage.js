/**
 * Panel de Análisis Interactivo (Día 5)
 * KPIs: total jugadores, edad promedio, jugadores más valiosos.
 * Gráficos: distribución de goles, demografía edad, valor de mercado.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Users, TrendingUp, Target, AlertCircle } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

function AnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        setStats(res.data?.data ?? res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el panel de análisis');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="w-full min-h-screen px-4 py-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-slate-700" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-32 rounded-xl bg-slate-800" />
            <div className="h-32 rounded-xl bg-slate-800" />
            <div className="h-32 rounded-xl bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full min-h-screen px-4 py-6">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 py-12">
          <AlertCircle size={48} className="text-red-400" />
          <p className="text-red-300 text-lg">{error}</p>
        </div>
      </section>
    );
  }

  const kpis = [
    {
      title: 'Total jugadores',
      value: stats?.totalPlayers ?? 0,
      icon: Users,
      color: 'from-sky-500/20 to-sky-600/10',
      border: 'border-sky-500/40',
      text: 'text-sky-300',
    },
    {
      title: 'Edad promedio',
      value: stats?.avgAge != null ? Number(stats.avgAge).toFixed(1) : '—',
      suffix: stats?.avgAge != null ? ' años' : '',
      icon: Target,
      color: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
    },
    {
      title: 'Goles totales',
      value: stats?.totalGoals ?? 0,
      icon: TrendingUp,
      color: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
    },
  ];

  return (
    <section className="w-full min-h-screen px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Panel de Análisis</h1>
        <p className="text-slate-400 text-sm mb-8">
          Métricas y distribución de la base de jugadores
        </p>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className={`rounded-xl border bg-gradient-to-br ${kpi.color} ${kpi.border} p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.text}`}>
                    {kpi.value}
                    {kpi.suffix ?? ''}
                  </p>
                </div>
                <kpi.icon size={36} className={`${kpi.text} opacity-80`} />
              </div>
            </div>
          ))}
        </div>

        {/* Jugadores más valiosos */}
        {stats?.topByMarketValue?.length > 0 && (
          <div className="mb-10 rounded-xl border border-slate-700/80 bg-slate-900/50 p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Jugadores más valiosos</h2>
            <ul className="space-y-2">
              {stats.topByMarketValue.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <span className="text-slate-300">
                    {i + 1}. <Link to={`/players/${p.id}`} className="text-sky-400 hover:underline">{p.name}</Link>
                    {p.team && <span className="text-slate-500 ml-2">({p.team})</span>}
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {p.market_value != null ? `€${Number(p.market_value).toLocaleString('es-ES')}` : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Distribución de goles */}
          {stats?.goalsDistribution?.length > 0 && (
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Distribución de goles</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.goalsDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.4)" />
                    <XAxis dataKey="bucket" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.8)' }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Jugadores" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Demografía por edad */}
          {stats?.ageDistribution?.length > 0 && (
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Demografía por edad</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.ageDistribution}
                      dataKey="count"
                      nameKey="bucket"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ bucket, count }) => `${bucket}: ${count}`}
                    >
                      {stats.ageDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.8)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Valor de mercado (buckets) */}
          {stats?.marketValueBuckets?.length > 0 && (
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Tendencia por valor de mercado</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.marketValueBuckets} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.4)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis type="category" dataKey="bucket" stroke="#94a3b8" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.8)' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Jugadores" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Por posición */}
          {stats?.byPosition?.length > 0 && (
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Jugadores por posición</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byPosition}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.4)" />
                    <XAxis dataKey="position" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.8)' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Jugadores" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Por equipo (top 10) */}
          {stats?.byTeam?.length > 0 && (
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Jugadores por equipo (top 10)</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byTeam}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.4)" />
                    <XAxis dataKey="team" stroke="#94a3b8" fontSize={10} angle={-25} textAnchor="end" height={70} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.8)' }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Jugadores" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AnalysisPage;
