/**
 * Herramienta de Comparación (Día 6)
 * Comparar 2-4 jugadores: tabla de estadísticas y superposición de gráficos radar.
 */

import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Users } from 'lucide-react';
import api from '../services/api';
import { formatCurrencyWithSymbol } from '../utils/formatNumber';
import PlayerRadarChart from './Players/PlayerRadarChart';
import CompareRadarOverlay from './Players/CompareRadarOverlay';

const ATTRIBUTE_KEYS = [
  { key: 'pace', label: 'Ritmo' },
  { key: 'shooting', label: 'Disparo' },
  { key: 'passing', label: 'Pase' },
  { key: 'dribbling', label: 'Regate' },
  { key: 'defending', label: 'Defensa' },
  { key: 'physicality', label: 'Físico' },
];

const STAT_KEYS = [
  { key: 'age', label: 'Edad' },
  { key: 'goals', label: 'Goles' },
  { key: 'assists', label: 'Asistencias' },
  { key: 'appearances', label: 'Partidos' },
  { key: 'market_value', label: 'Valor (€)', format: (v) => formatCurrencyWithSymbol(v) },
];

const MAX_PLAYERS = 4;

function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const initialIdsLoaded = useRef(false);

  // Cargar jugadores desde la URL al montar (?ids=1,2,3)
  useEffect(() => {
    if (initialIdsLoaded.current) return;
    const idsStr = searchParams.get('ids');
    if (!idsStr || idsStr.trim() === '') return;
    const ids = idsStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((id) => Number.isInteger(id) && id > 0);
    const uniqueIds = [...new Set(ids)].slice(0, MAX_PLAYERS);
    if (uniqueIds.length === 0) return;
    initialIdsLoaded.current = true;
    setLoadingDetails(true);
    Promise.allSettled(uniqueIds.map((id) => api.get(`/players/${id}`)))
      .then((results) => {
        const loaded = results
          .filter((r) => r.status === 'fulfilled' && r.value?.data?.data)
          .map((r) => r.value.data.data);
        setPlayers(loaded);
      })
      .finally(() => setLoadingDetails(false));
  }, [searchParams]);

  // Sincronizar URL con los jugadores seleccionados (URL compartible)
  useEffect(() => {
    if (players.length === 0) {
      if (searchParams.get('ids')) setSearchParams({}, { replace: true });
      return;
    }
    const ids = players.map((p) => p.id).join(',');
    if (searchParams.get('ids') !== ids) {
      setSearchParams({ ids }, { replace: true });
    }
  }, [players, searchParams, setSearchParams]);

  const searchPlayers = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get('/players/search', { params: { q, limit: 15 } });
      setSearchResults(res.data?.data ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(searchPlayers, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const addPlayer = async (p) => {
    if (players.some((x) => x.id === p.id) || players.length >= MAX_PLAYERS) return;
    setLoadingDetails(true);
    try {
      const res = await api.get(`/players/${p.id}`);
      const full = res.data?.data ?? res.data;
      setPlayers((prev) => [...prev, full]);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const removePlayer = (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <section className="w-full min-h-screen px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Comparar jugadores</h1>
            <p className="text-slate-400 text-sm">Selecciona entre 2 y 4 jugadores para comparar estadísticas y atributos. La URL se actualiza al elegir jugadores y puedes compartirla.</p>
          </div>
        </div>

        {/* Búsqueda para añadir */}
        {players.length < MAX_PLAYERS && (
          <div className="mb-8 rounded-xl border border-slate-700/80 bg-slate-900/50 p-4">
            <label className="block text-sm font-semibold text-slate-400 mb-2">Añadir jugador a la comparación</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, equipo..."
                className="w-full rounded-lg border border-slate-600 bg-slate-800 pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500"
              />
            </div>
            {searching && <p className="mt-2 text-sm text-slate-500">Buscando...</p>}
            {searchResults.length > 0 && (
              <ul className="mt-3 border border-slate-700 rounded-lg divide-y divide-slate-700 max-h-48 overflow-y-auto">
                {searchResults
                  .filter((r) => !players.some((p) => p.id === r.id))
                  .slice(0, 10)
                  .map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => addPlayer(p)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 flex justify-between"
                      >
                        <span>{p.name}</span>
                        <span className="text-slate-500 text-sm">{p.team}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {players.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900/30 p-12 text-center text-slate-500">
            Usa la búsqueda de arriba para añadir jugadores a la comparación.
          </div>
        )}

        {players.length > 0 && (
          <>
            {/* Tarjetas de jugadores seleccionados */}
            <div className="flex flex-wrap gap-4 mb-8">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3"
                >
                  <Link to={`/players/${p.id}`} className="font-semibold text-sky-400 hover:underline">
                    {p.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removePlayer(p.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                    aria-label="Quitar"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Tabla comparativa */}
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 overflow-hidden mb-8">
              <h2 className="text-lg font-bold text-slate-100 p-4 border-b border-slate-700">Estadísticas</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="text-left py-3 px-4 text-slate-400 font-semibold w-32">Atributo</th>
                      {players.map((p) => (
                        <th key={p.id} className="py-3 px-4 text-sky-400 font-semibold">
                          <Link to={`/players/${p.id}`} className="hover:underline">{p.name}</Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STAT_KEYS.map(({ key, label, format }) => (
                      <tr key={key} className="border-b border-slate-700/50">
                        <td className="py-2.5 px-4 text-slate-400">{label}</td>
                        {players.map((p) => (
                          <td key={p.id} className="py-2.5 px-4 text-slate-200">
                            {format ? format(p[key]) : (p[key] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {ATTRIBUTE_KEYS.map(({ key, label }) => (
                      <tr key={key} className="border-b border-slate-700/50">
                        <td className="py-2.5 px-4 text-slate-400">{label}</td>
                        {players.map((p) => (
                          <td key={p.id} className="py-2.5 px-4 text-slate-200">
                            {p[key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráficos radar superpuestos */}
            {players.length >= 2 && (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6">
                <h2 className="text-lg font-bold text-slate-100 mb-4">Atributos (radar)</h2>
                <div className="flex justify-center">
                  <CompareRadarOverlay players={players} size={320} />
                </div>
              </div>
            )}

            {loadingDetails && (
              <p className="text-sm text-slate-500 mt-4">Cargando jugador...</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ComparePage;
