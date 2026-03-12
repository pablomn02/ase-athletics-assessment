/**
 * PlayerStats.js
 * Componente para visualizar estadísticas de un jugador con barras de progreso
 * Muestra: ritmo, tiro, pase, defensa, físico, etc.
 */

function PlayerStats({ player }) {
  // Estadísticas por defecto (puedes obtenerlas de la API)
  const stats = [
    { label: 'Ritmo', value: player.pace || 75, icon: '⚡' },
    { label: 'Tiro', value: player.shooting || 70, icon: '🎯' },
    { label: 'Pase', value: player.passing || 72, icon: '🎪' },
    { label: 'Regate', value: player.dribbling || 68, icon: '🏃' },
    { label: 'Defensa', value: player.defense || 60, icon: '🛡️' },
    { label: 'Físico', value: player.physical || 75, icon: '💪' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#f1f5f9' }}>
        Estadísticas
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              borderColor: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stat.icon}</span>
                <span style={{ color: '#cbd5e1' }} className="font-semibold">
                  {stat.label}
                </span>
              </div>
              <span className="text-lg font-bold" style={{ color: '#0ea5e9' }}>
                {stat.value}
              </span>
            </div>

            {/* Barra de progreso */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
              }}
            >
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${stat.value}%`,
                  backgroundColor:
                    stat.value >= 80 ? '#10b981' : stat.value >= 60 ? '#0ea5e9' : '#f59e0b',
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Información de Contrato */}
      {(player.contractStart || player.contractEnd) && (
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
            {player.contractStart && (
              <div>
                <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                  Inicio
                </p>
                <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                  {new Date(player.contractStart).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
            {player.contractEnd && (
              <div>
                <p style={{ color: '#94a3b8' }} className="text-sm uppercase tracking-wider">
                  Vencimiento
                </p>
                <p className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                  {new Date(player.contractEnd).toLocaleDateString('es-ES')}
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
