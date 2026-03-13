/**
 * PlayerStats.js
 * Estadísticas del jugador: temporada, atributos en gráfico radar y contrato.
 */

import PlayerRadarChart from './PlayerRadarChart';
import { formatCurrencyWithSymbol } from '../../utils/formatNumber';

function PlayerStats({ player }) {
  return (
    <div>
      {/* Estadísticas de temporada */}
      {(player.goals != null || player.assists != null || player.appearances != null) && (
        <div
          className="mb-8 rounded-lg border p-6"
          style={{
            borderColor: 'rgba(51, 65, 85, 0.5)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: '#f1f5f9' }}>
            Estadísticas de temporada
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">Partidos</p>
              <p className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>{player.appearances ?? 0}</p>
            </div>
            <div>
              <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">Goles</p>
              <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{player.goals ?? 0}</p>
            </div>
            <div>
              <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">Asistencias</p>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{player.assists ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Atributos: barras de progreso (escala 1-10) */}
      <div
        className="mb-8 rounded-xl border p-4 sm:p-6"
        style={{
          borderColor: 'rgba(51, 65, 85, 0.5)',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
        }}
      >
        <h2 className="text-xl font-bold mb-4 sm:mb-6 w-full text-left" style={{ color: '#f1f5f9' }}>
          Atributos
        </h2>
        <div className="space-y-4">
          {[
            { key: 'pace', label: 'Ritmo' },
            { key: 'shooting', label: 'Disparo' },
            { key: 'passing', label: 'Pase' },
            { key: 'dribbling', label: 'Regate' },
            { key: 'defending', label: 'Defensa' },
            { key: 'physicality', label: 'Físico' },
          ].map(({ key, label }) => {
            const value = player[key] != null ? Math.min(10, Math.max(1, Number(player[key]))) : 0;
            const pct = value ? (value / 10) * 100 : 0;
            const barColor = pct >= 7 ? '#10b981' : pct >= 4 ? '#eab308' : '#ef4444';
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: '#94a3b8' }}>{label}</span>
                  <span style={{ color: '#e2e8f0' }}>{value ? `${value}/10` : '—'}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-slate-500">Escala 1–10</p>

        {/* Gráfico radar (complementario) */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#f1f5f9' }}>Vista radar</h3>
          <div className="w-full max-w-[320px] sm:max-w-[400px] mx-auto" style={{ minHeight: 0 }}>
            <PlayerRadarChart player={player} />
          </div>
        </div>
      </div>

      {/* Información de Contrato (snake_case del backend) */}
      {(player.contract_salary != null || player.contract_end) && (
        <div
          className="mt-8 rounded-lg border p-6"
          style={{
            borderColor: 'rgba(51, 65, 85, 0.5)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: '#f1f5f9' }}>
            Información de Contrato
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {player.contract_salary != null && (
              <div>
                <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                  Salario
                </p>
                <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                  {formatCurrencyWithSymbol(player.contract_salary)}
                </p>
              </div>
            )}
            {player.contract_end && (
              <div>
                <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                  Fin de contrato
                </p>
                <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                  {new Date(player.contract_end).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerStats;
