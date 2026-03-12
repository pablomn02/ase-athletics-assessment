/**
 * PlayerList.js
 * Componente principal para la visualización de lista de jugadores
 * Requisitos de Excelencia Técnica:
 * ✓ Consumo de API: GET /api/players
 * ✓ Visualización en tabla responsiva
 * ✓ Paginación: 20 jugadores por página
 * ✓ Diseño Mobile-First responsivo
 * ✓ Estética profesional con ui_guidelines.json
 * ✓ Estados de carga con esqueletos
 * ✓ Avatares con placeholders
 * ✓ Filtros por posición y equipo
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ChevronLeft, ChevronRight, AlertCircle, X, Plus } from 'lucide-react';
import api from '../../services/api';
import playerImageService from '../../services/playerImageService';
import PlayerSkeleton from './PlayerSkeleton';

const ITEMS_PER_PAGE = 20;

/**
 * Genera un color único basado en el nombre del jugador
 */
const getAvatarColor = (name) => {
  if (!name) return '#0ea5e9';
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

/**
 * Obtiene las iniciales del nombre
 */
const getInitials = (name) => {
  if (!name) return '—';
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

function PlayerList() {
  const navigate = useNavigate();
  
  // Estado de datos
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [positions, setPositions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [playerImages, setPlayerImages] = useState({}); // Mapeo: playerName -> imageUrl

  // Estado de paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Estado de búsqueda
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de filtros
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  /**
   * Obtiene los jugadores de la API
   * @param {number} currentPage - Número de página actual
   * @param {string} term - Término de búsqueda (opcional)
   * @param {string} position - Filtro por posición (opcional)
   * @param {string} team - Filtro por equipo (opcional)
   */
  const fetchPlayers = async (currentPage = 1, term = '', position = '', team = '') => {
    setLoading(true);
    setError('');

    try {
      let response;

      if (term) {
        // Usar endpoint de búsqueda si hay término
        const params = {
          q: term,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(position && { position }),
          ...(team && { team }),
        };
        response = await api.get('/players/search', { params });
      } else {
        // Usar endpoint de listado
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(position && { position }),
          ...(team && { team }),
        };
        response = await api.get('/players', { params });
      }

      const { data } = response;
      setPlayers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalPlayers(data.meta?.total || data.total || 0);

      // Extraer posiciones y equipos únicos
      if (data.data && data.data.length > 0 && positions.length === 0) {
        const uniquePositions = [...new Set(data.data.map((p) => p.position).filter(Boolean))];
        const uniqueTeams = [...new Set(data.data.map((p) => p.team).filter(Boolean))];
        setPositions(uniquePositions.sort());
        setTeams(uniqueTeams.sort());
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'No se pudieron cargar los jugadores. Intenta de nuevo más tarde.';
      setError(errorMessage);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial de datos
  useEffect(() => {
    fetchPlayers(page, searchTerm, selectedPosition, selectedTeam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, selectedPosition, selectedTeam]);

  // Búsqueda automática con debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedSearch = search.trim();
      // Solo actualizar si el término cambió
      if (trimmedSearch !== searchTerm) {
        setPage(1);
        setSearchTerm(trimmedSearch);
      }
    }, 500); // Esperar 500ms después de dejar de escribir

    return () => clearTimeout(debounceTimer);
  }, [search, searchTerm]);

  // Carga de imágenes de jugadores
  useEffect(() => {
    if (players.length === 0) return;

    const loadImages = async () => {
      try {
        // Buscar imágenes para cada jugador
        const images = await playerImageService.fetchMultiplePlayerImages(
          players.map(p => ({ name: p.name, team: p.team }))
        );
        setPlayerImages(images);
      } catch (error) {
        console.warn('Error loading player images:', error);
      }
    };

    loadImages();
  }, [players]);

  /**
   * Limpia la búsqueda y carga todos los jugadores
   */
  const handleClearSearch = () => {
    setSearch('');
    setSearchTerm('');
    setPage(1);
  };

  /**
   * Limpia todos los filtros
   */
  const handleClearFilters = () => {
    setSelectedPosition('');
    setSelectedTeam('');
    setPage(1);
  };

  /**
   * Verifica si hay filtros activos
   */
  const hasActiveFilters = selectedPosition || selectedTeam || searchTerm;

  // Cálculos para paginación
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const startIndex = (page - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(page * ITEMS_PER_PAGE, totalPlayers);

  return (
    <section className="w-full min-h-screen px-3 py-6 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Encabezado con título y búsqueda */}
        <div className="mb-8 flex flex-col gap-4 sm:gap-6">
          {/* Encabezado: Título + Botón Crear */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  color: '#7dd3fc',
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h1
                  className="text-xl font-semibold sm:text-2xl"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    color: '#f1f5f9',
                  }}
                >
                  Directorio de Jugadores
                </h1>
                <p
                  className="text-xs sm:text-sm"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: '#cbd5e1',
                  }}
                >
                  Explora la base de datos de{' '}
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    {totalPlayers} jugadores
                  </span>{' '}
                  profesionales
                </p>
              </div>
            </div>
            {/* Botón Crear Jugador */}
            <button
              type="button"
              onClick={() => navigate('/players/create')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
              style={{
                backgroundColor: '#0ea5e9',
                color: 'white',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#0ea5e9')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#0ea5e9')}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Crear Jugador</span>
              <span className="sm:hidden">Crear</span>
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div
            className="w-full"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <Search
                  size={18}
                  style={{ color: '#94a3b8', flexShrink: 0 }}
                />
                <input
                  type="text"
                  className="w-full bg-transparent text-sm outline-none placeholder:opacity-60"
                  placeholder="Buscar por nombre, equipo, posición o país..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    color: '#f1f5f9',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#e2e8f0')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Resultados de búsqueda activa */}
          {searchTerm && (
            <div
              className="flex items-center gap-2 rounded-lg p-3 text-sm"
              style={{
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderLeft: '3px solid #0ea5e9',
                color: '#bae6fd',
              }}
            >
              <span style={{ fontWeight: 500 }}>
                Resultados para "{searchTerm}": {totalPlayers} jugador
                {totalPlayers !== 1 ? 'es' : ''}
              </span>
            </div>
          )}

          {/* Filtros Avanzados */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
            {/* Filtro por Posición */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="position-filter"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: '#cbd5e1',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                Posición
              </label>
              <select
                id="position-filter"
                value={selectedPosition}
                onChange={(e) => {
                  setSelectedPosition(e.target.value);
                  setPage(1);
                }}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#1f2937',
                }}
              >
                <option value="">Todas las posiciones</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Equipo */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="team-filter"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: '#cbd5e1',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                Equipo
              </label>
              <select
                id="team-filter"
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                  setPage(1);
                }}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#1f2937',
                }}
              >
                <option value="">Todos los equipos</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Limpiar Filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded transition-colors"
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#dc2626')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#ef4444')}
              >
                <X size={16} />
                <span className="hidden sm:inline">Limpiar Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabla de jugadores - Responsiva */}
        <div
          className="w-full overflow-x-auto rounded-lg"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <table className="w-full border-collapse text-left text-sm">
            {/* Encabezado de tabla */}
            <thead
              style={{
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <tr>
                <th
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-12"
                  style={{
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Foto
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Nombre
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Equipo
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Posición
                </th>
                <th
                  className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:table-cell"
                  style={{
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Edad
                </th>
                <th
                  className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider md:table-cell"
                  style={{
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Goles
                </th>
                <th
                  className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider md:table-cell"
                  style={{
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Asistencias
                </th>
              </tr>
            </thead>

            {/* Cuerpo de tabla */}
            <tbody>
              {loading ? (
                <PlayerSkeleton count={ITEMS_PER_PAGE} />
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center sm:py-12"
                    style={{ color: '#ef4444' }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle
                        size={32}
                        style={{ color: '#ef4444', opacity: 0.7 }}
                      />
                      <div>
                        <p
                          className="font-semibold"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                          Error al cargar los datos
                        </p>
                        <p className="text-sm" style={{ color: '#dc2626' }}>
                          {error}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center sm:py-12"
                    style={{ color: '#6b7280' }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      No se encontraron jugadores
                    </p>
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr
                    key={player.id}
                    onClick={() => navigate(`/players/${player.id}`)}
                    className="border-t transition-colors hover:bg-gray-50 cursor-pointer"
                    style={{
                      borderTopColor: '#f3f4f6',
                      color: '#374151',
                    }}
                  >
                    {/* Avatar con Imagen Real o Fallback */}
                    <td className="px-4 py-3 text-center">
                      {playerImages[player.name] ? (
                        <img
                          src={playerImages[player.name]}
                          alt={player.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            // Fallback a avatar si falla la imagen
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'inline-flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{
                          backgroundColor: getAvatarColor(player.name),
                          display: playerImages[player.name] ? 'none' : 'inline-flex',
                        }}
                      >
                        {getInitials(player.name)}
                      </div>
                    </td>

                    {/* Nombre */}
                    <td
                      className="px-4 py-3 text-sm font-medium"
                      style={{
                        color: '#111827',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {player.name}
                    </td>

                    {/* Equipo */}
                    <td
                      className="px-4 py-3 text-sm"
                      style={{
                        color: '#4b5563',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    >
                      {player.team || '—'}
                    </td>

                    {/* Posición */}
                    <td
                      className="px-4 py-3 text-sm"
                      style={{
                        color: '#4b5563',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    >
                      {player.position || '—'}
                    </td>

                    {/* Edad */}
                    <td
                      className="hidden px-4 py-3 text-sm sm:table-cell"
                      style={{
                        color: '#4b5563',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    >
                      {player.age ?? '—'}
                    </td>

                    {/* Goles */}
                    <td
                      className="hidden px-4 py-3 text-right text-sm font-medium md:table-cell"
                      style={{
                        color: '#0ea5e9',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {player.goals ?? 0}
                    </td>

                    {/* Asistencias */}
                    <td
                      className="hidden px-4 py-3 text-right text-sm font-medium md:table-cell"
                      style={{
                        color: '#10b981',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {player.assists ?? 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación - Responsivo */}
        {!loading && players.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Información de página */}
            <div
              className="text-xs sm:text-sm font-medium"
              style={{
                color: '#6b7280',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              Mostrando {startIndex} a {endIndex} de {totalPlayers} jugadores
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canPrev && setPage(page - 1)}
                disabled={!canPrev}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  backgroundColor: canPrev ? '#f1f5f9' : '#f3f4f6',
                  color: canPrev ? '#334155' : '#9ca3af',
                  border: '1px solid #e5e7eb',
                }}
                onMouseEnter={(e) => {
                  if (canPrev) {
                    e.target.style.backgroundColor = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canPrev) {
                    e.target.style.backgroundColor = '#f1f5f9';
                  }
                }}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Información de página en mobile */}
              <span
                className="px-3 py-2 text-sm font-medium sm:hidden"
                style={{
                  color: '#6b7280',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => canNext && setPage(page + 1)}
                disabled={!canNext}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  backgroundColor: canNext ? '#0ea5e9' : '#cbd5e1',
                  color: '#ffffff',
                  border: canNext ? '1px solid #0284c7' : '1px solid #ccc',
                }}
                onMouseEnter={(e) => {
                  if (canNext) {
                    e.target.style.backgroundColor = '#0284c7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canNext) {
                    e.target.style.backgroundColor = '#0ea5e9';
                  }
                }}
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Información de página en escritorio */}
            <div
              className="hidden text-xs sm:text-sm font-medium sm:block"
              style={{
                color: '#6b7280',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              Página {page} de {totalPages}
            </div>
          </div>
        )}

        {/* Mensaje cuando la búsqueda no tiene resultados */}
        {!loading && error === '' && players.length === 0 && searchTerm && (
          <div
            className="mt-6 rounded-lg p-4 text-center sm:p-6"
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              color: '#92400e',
            }}
          >
            <p
              className="text-sm sm:text-base font-medium"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              No se encontraron jugadores que coincidan con "{searchTerm}"
            </p>
            <p
              className="text-xs sm:text-sm mt-2"
              style={{ color: '#b45309' }}
            >
              Intenta con otro término de búsqueda
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PlayerList;
