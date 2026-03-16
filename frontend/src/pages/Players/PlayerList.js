/**
 * PlayerList.js
 * Directorio de jugadores: cuadrícula/tabla, paginación 20-30, búsqueda y filtros avanzados.
 * Mobile-First: filtros colapsables, tacto amigable, avatar con iniciales.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ChevronLeft, ChevronRight, AlertCircle, X, Plus, Filter, ChevronDown, ChevronUp, Download } from 'lucide-react';
import api from '../../services/api';
import { formatMarketValue } from '../../utils/formatNumber';
import { positionToSpanish } from '../../utils/positionLabel';
import PlayerSkeleton from './PlayerSkeleton';

const PAGE_SIZE_OPTIONS = [20, 25, 30];
const DEFAULT_PAGE_SIZE = 25;

const POSICIONES_ORDEN = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];

const getAvatarColor = (name) => {
  if (!name) return '#0ea5e9';
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  return colors[name.charCodeAt(0) % colors.length];
};

const getInitials = (name) => {
  if (!name) return '—';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
};

/** Escapa un valor para CSV (comillas si contiene coma, salto de línea o comillas). */
const escapeCsvValue = (val) => {
  if (val == null) return '';
  const s = String(val).trim();
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

/** Genera CSV con los jugadores actuales (página visible) y dispara la descarga. */
const downloadPlayersCsv = (list) => {
  const headers = ['Nombre', 'Equipo', 'Posición', 'Edad', 'Nacionalidad', 'Valor de mercado (€)', 'Goles', 'Asistencias'];
  const rows = list.map((p) => [
    escapeCsvValue(p.name),
    escapeCsvValue(p.team),
    escapeCsvValue(positionToSpanish(p.position)),
    escapeCsvValue(p.age),
    escapeCsvValue(p.nationality),
    p.market_value != null && p.market_value !== '' ? Number(p.market_value) : '',
    p.goals ?? '',
    p.assists ?? '',
  ]);
  const headerLine = headers.join(',');
  const dataLines = rows.map((r) => r.join(','));
  const csv = [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jugadores-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

function PlayerList() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minMarketValue, setMinMarketValue] = useState('');
  const [maxMarketValue, setMaxMarketValue] = useState('');
  const [nationalities, setNationalities] = useState([]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  // Valores numéricos con debounce para no disparar búsqueda en cada tecla
  const [minAgeDebounced, setMinAgeDebounced] = useState('');
  const [maxAgeDebounced, setMaxAgeDebounced] = useState('');
  const [minMarketValueDebounced, setMinMarketValueDebounced] = useState('');
  const [maxMarketValueDebounced, setMaxMarketValueDebounced] = useState('');

  const buildParams = (currentPage) => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (selectedPosition) params.position = selectedPosition;
    if (selectedTeam) params.team = selectedTeam;
    if (selectedNationality) params.nationality = selectedNationality;
    if (minAgeDebounced !== '') params.minAge = minAgeDebounced;
    if (maxAgeDebounced !== '') params.maxAge = maxAgeDebounced;
    if (minMarketValueDebounced !== '') params.minMarketValue = minMarketValueDebounced;
    if (maxMarketValueDebounced !== '') params.maxMarketValue = maxMarketValueDebounced;
    return params;
  };

  const fetchPlayers = async (currentPage = 1) => {
    setLoading(true);
    setError('');

    try {
      let response;
      const params = buildParams(currentPage);

      if (searchTerm.trim()) {
        response = await api.get('/players/search', { params: { ...params, q: searchTerm.trim() } });
      } else {
        response = await api.get('/players', { params });
      }

      const res = response.data;
      const list = res.data || [];
      const meta = res.meta || {};

      setPlayers(list);
      setTotalPages(meta.totalPages || 1);
      setTotalPlayers(meta.total ?? 0);

      if (list.length > 0 && teams.length === 0) {
        const tm = [...new Set(list.map((p) => p.team).filter(Boolean))].sort();
        setTeams(tm);
      }
      if (list.length > 0 && nationalities.length === 0) {
        const nat = [...new Set(list.map((p) => p.nationality).filter(Boolean))].sort();
        setNationalities(nat);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'No se pudieron cargar los jugadores.';
      setError(msg);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers(page);
  }, [page, pageSize, searchTerm, selectedPosition, selectedTeam, selectedNationality, minAgeDebounced, maxAgeDebounced, minMarketValueDebounced, maxMarketValueDebounced]);

  // Debounce para filtros numéricos: la búsqueda se ejecuta al dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => {
      setMinAgeDebounced(minAge);
      setMaxAgeDebounced(maxAge);
      setMinMarketValueDebounced(minMarketValue);
      setMaxMarketValueDebounced(maxMarketValue);
    }, 400);
    return () => clearTimeout(t);
  }, [minAge, maxAge, minMarketValue, maxMarketValue]);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed !== searchTerm) {
        setPage(1);
        setSearchTerm(trimmed);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleClearSearch = () => {
    setSearch('');
    setSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters =
    selectedPosition ||
    selectedTeam ||
    selectedNationality ||
    searchTerm ||
    minAge !== '' ||
    maxAge !== '' ||
    minMarketValue !== '' ||
    maxMarketValue !== '';

  const handleClearFilters = () => {
    setSelectedPosition('');
    setSelectedTeam('');
    setSelectedNationality('');
    setMinAge('');
    setMaxAge('');
    setMinMarketValue('');
    setMaxMarketValue('');
    setMinAgeDebounced('');
    setMaxAgeDebounced('');
    setMinMarketValueDebounced('');
    setMaxMarketValueDebounced('');
    setSearch('');
    setSearchTerm('');
    setPage(1);
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const startIndex = totalPlayers === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalPlayers);

  const inputStyle =
    'w-full rounded-lg border bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none min-h-[44px] touch-manipulation';
  const labelStyle = 'text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 block';

  return (
    <section className="w-full min-h-screen px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header + Crear */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">Directorio de Jugadores</h1>
              <p className="text-xs text-slate-400 sm:text-sm">
                Base de datos de <span className="font-semibold text-emerald-400">{totalPlayers}</span> jugadores
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadPlayersCsv(players)}
              disabled={loading || players.length === 0}
              className="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none"
              title="Exportar listado visible a CSV"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Exportar a CSV</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/players/create')}
              className="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 active:scale-[0.98]"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Añadir Jugador</span>
              <span className="sm:hidden">Crear</span>
            </button>
          </div>
        </div>

        {/* Búsqueda global */}
        <div className="mb-4 rounded-xl border border-slate-700/80 bg-slate-900/60 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                className={`${inputStyle} pl-10`}
                placeholder="Buscar por nombre, equipo o nacionalidad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar jugadores"
              />
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="min-h-[44px] touch-manipulation rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-sky-300/90">
              Resultados para &quot;{searchTerm}&quot;: {totalPlayers} jugador{totalPlayers !== 1 ? 'es' : ''}
            </p>
          )}
        </div>

        {/* Filtros: desplegable (se abre/cierra al hacer clic); la búsqueda se ejecuta al elegir cada filtro) */}
        <div className="mb-4 rounded-xl border border-slate-700/80 bg-slate-900/50 overflow-hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex w-full min-h-[48px] touch-manipulation items-center justify-between px-4 py-3 text-left text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Filter size={18} />
              Filtros
              {hasActiveFilters && (
                <span className="rounded-full bg-sky-500/30 px-2 py-0.5 text-xs text-sky-300">Activos</span>
              )}
            </span>
            <span className="text-slate-400">{filtersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
          </button>

          <div
            className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: filtersOpen ? '1fr' : '0fr' }}
          >
            <div
              className={`min-h-0 overflow-hidden border-t border-slate-700/80 px-4 py-4 transition-opacity duration-300 ${filtersOpen ? 'opacity-100' : 'opacity-0'}`}
            >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <div>
                <label htmlFor="position-filter" className={labelStyle}>Posición</label>
                <select
                  id="position-filter"
                  value={selectedPosition}
                  onChange={(e) => {
                    setSelectedPosition(e.target.value);
                    setPage(1);
                  }}
                  className={inputStyle}
                >
                  <option value="">Todas</option>
                  {POSICIONES_ORDEN.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="team-filter" className={labelStyle}>Equipo</label>
                <select
                  id="team-filter"
                  value={selectedTeam}
                  onChange={(e) => {
                    setSelectedTeam(e.target.value);
                    setPage(1);
                  }}
                  className={inputStyle}
                >
                  <option value="">Todos</option>
                  {teams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="nationality-filter" className={labelStyle}>Nacionalidad</label>
                <select
                  id="nationality-filter"
                  value={selectedNationality}
                  onChange={(e) => {
                    setSelectedNationality(e.target.value);
                    setPage(1);
                  }}
                  className={inputStyle}
                >
                  <option value="">Todas</option>
                  {nationalities.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="min-age" className={labelStyle}>Edad mín.</label>
                <input
                  id="min-age"
                  type="number"
                  min={10}
                  max={60}
                  placeholder="Ej: 18"
                  value={minAge}
                  onChange={(e) => {
                    setMinAge(e.target.value);
                    setPage(1);
                  }}
                  className={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="max-age" className={labelStyle}>Edad máx.</label>
                <input
                  id="max-age"
                  type="number"
                  min={10}
                  max={60}
                  placeholder="Ej: 35"
                  value={maxAge}
                  onChange={(e) => {
                    setMaxAge(e.target.value);
                    setPage(1);
                  }}
                  className={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="min-value" className={labelStyle}>Valor mín. (€)</label>
                <input
                  id="min-value"
                  type="number"
                  min={0}
                  placeholder="Ej: 1000000"
                  value={minMarketValue}
                  onChange={(e) => {
                    setMinMarketValue(e.target.value);
                    setPage(1);
                  }}
                  className={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="max-value" className={labelStyle}>Valor máx. (€)</label>
                <input
                  id="max-value"
                  type="number"
                  min={0}
                  placeholder="Ej: 100000000"
                  value={maxMarketValue}
                  onChange={(e) => {
                    setMaxMarketValue(e.target.value);
                    setPage(1);
                  }}
                  className={inputStyle}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/30"
              >
                <X size={18} />
                Limpiar filtros
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Tabla (escritorio) / Cards (móvil) */}
        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/40 shadow-xl">
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/80 bg-slate-800/60">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-14">Foto</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Nombre</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Equipo</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Posición</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Edad</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Valor</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">G/A</th>
                </tr>
              </thead>
              <tbody>
                {loading && <PlayerSkeleton count={pageSize} />}
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-red-400">
                        <AlertCircle size={36} />
                        <p className="font-medium">{error}</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && !error && players.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      No se encontraron jugadores
                    </td>
                  </tr>
                )}
                {!loading && !error && players.map((player) => (
                    <tr
                      key={player.id}
                      onClick={() => navigate(`/players/${player.id}`)}
                      className="border-t border-slate-700/60 cursor-pointer transition hover:bg-slate-800/50 active:bg-slate-800/70"
                    >
                      <td className="px-4 py-3">
                        <div
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: getAvatarColor(player.name) }}
                        >
                          {getInitials(player.name)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-100">{player.name}</td>
                      <td className="px-4 py-3 text-slate-400">{player.team || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{positionToSpanish(player.position) || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{player.age ?? '—'}</td>
                      <td className="px-4 py-3 text-emerald-400/90">{formatMarketValue(player.market_value)}</td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {player.goals ?? 0} / {player.assists ?? 0}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden divide-y divide-slate-700/60">
            {loading && (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="h-14 w-14 rounded-full bg-slate-700" />
                    <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-700" />
                    <div className="h-3 w-1/2 rounded bg-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && error && (
              <div className="flex flex-col items-center gap-3 p-8 text-red-400">
                <AlertCircle size={36} />
                <p className="text-center font-medium">{error}</p>
              </div>
            )}
            {!loading && !error && players.length === 0 && (
              <p className="py-8 text-center text-slate-500">No se encontraron jugadores</p>
            )}
            {!loading && !error && players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => navigate(`/players/${player.id}`)}
                  className="flex w-full min-h-[72px] touch-manipulation items-center gap-4 px-4 py-3 text-left transition active:bg-slate-800/60"
                >
                  <div
                    className="h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: getAvatarColor(player.name) }}
                  >
                    {getInitials(player.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 truncate">{player.name}</p>
                    <p className="text-sm text-slate-400 truncate">
                      {[player.team, positionToSpanish(player.position)].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-emerald-400/90">{formatMarketValue(player.market_value)}</p>
                    <p className="text-xs text-slate-500">{player.goals ?? 0}G / {player.assists ?? 0}A</p>
                  </div>
                </button>
            ))}
          </div>
        </div>

        {/* Paginación + tamaño de página */}
        {!loading && players.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="text-sm text-slate-400">
                Mostrando {startIndex}–{endIndex} de {totalPlayers}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="page-size" className="text-sm text-slate-400">Por página:</label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className="min-h-[44px] touch-manipulation inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
              <span className="min-w-[80px] text-center text-sm text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
                className="min-h-[44px] touch-manipulation inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-600"
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {!loading && !error && players.length === 0 && searchTerm && (
          <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200/90 text-center text-sm">
            No hay resultados para &quot;{searchTerm}&quot;. Prueba otro término o quita filtros.
          </div>
        )}
      </div>
    </section>
  );
}

export default PlayerList;
