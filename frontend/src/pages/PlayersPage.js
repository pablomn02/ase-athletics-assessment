import { useEffect, useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchPlayers = async (currentPage, term) => {
    setLoading(true);
    setError('');

    try {
      const url = term
        ? `/players/search?q=${encodeURIComponent(term)}&page=${currentPage}&limit=${limit}`
        : `/players?page=${currentPage}&limit=${limit}`;

      const { data } = await api.get(url);
      setPlayers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'No se pudieron cargar los jugadores.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers(page, search.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPlayers(1, search.trim());
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <section className="w-full max-w-5xl mx-auto px-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sky-300">
            <Users size={18} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-slate-100">
              Directorio de jugadores
            </h1>
            <p className="text-xs text-slate-400">
              Explora el pool de jugadores sembrados en la base de datos.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full max-w-sm items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5"
        >
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            placeholder="Buscar por nombre, equipo o país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800/70 bg-slate-900/40">
        <table className="min-w-full text-left text-sm text-slate-100">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Posición</th>
              <th className="px-4 py-3 hidden sm:table-cell">Edad</th>
              <th className="px-4 py-3 hidden md:table-cell text-right">Goles</th>
              <th className="px-4 py-3 hidden md:table-cell text-right">Asistencias</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Cargando jugadores...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-rose-300">
                  {error}
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron jugadores.
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr
                  key={player.id}
                  className="border-t border-slate-800/80 hover:bg-slate-900/60"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-50">
                    {player.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {player.team || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {player.position || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 hidden sm:table-cell">
                    {player.age ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 hidden md:table-cell text-right">
                    {player.goals ?? 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 hidden md:table-cell text-right">
                    {player.assists ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <div>
          Página {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canPrev && setPage((p) => p - 1)}
            disabled={!canPrev}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => canNext && setPage((p) => p + 1)}
            disabled={!canNext}
            className="inline-flex items-center gap-1 rounded-full border border-sky-500/70 bg-sky-500/10 px-2 py-1 text-xs text-slate-100 disabled:opacity-40"
          >
            Siguiente
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default PlayersPage;

