/**
 * CompareRadarOverlay.js
 * Superposición de gráficos radar para 2-4 jugadores (misma escala, colores distintos).
 */

const MAX_VALUE = 10;
const AXES = [
  { key: 'pace', label: 'RITMO' },
  { key: 'shooting', label: 'DISPARO' },
  { key: 'passing', label: 'PASE' },
  { key: 'dribbling', label: 'REGATE' },
  { key: 'defending', label: 'DEFENSA' },
  { key: 'physicality', label: 'ESTADO FÍSICO' },
];

const PLAYER_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

function polarToCart(cx, cy, radius, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function CompareRadarOverlay({ players, size = 320 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.65;
  const labelR = maxR + 36;

  const gridLevels = 5;

  return (
    <div className="inline-block">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[360px]"
        style={{ minWidth: 240, minHeight: 240 }}
      >
        {/* Rejilla */}
        {Array.from({ length: gridLevels }, (_, i) => (i + 1) / gridLevels).map((level) => (
          <circle
            key={level}
            cx={cx}
            cy={cy}
            r={level * maxR}
            fill="none"
            stroke="rgba(71, 85, 105, 0.4)"
            strokeWidth="0.5"
          />
        ))}
        {AXES.map((_, i) => {
          const angle = (i / AXES.length) * 360;
          const end = polarToCart(cx, cy, maxR, angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(71, 85, 105, 0.5)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Polígonos por jugador */}
        {players.map((player, playerIdx) => {
          const color = PLAYER_COLORS[playerIdx % PLAYER_COLORS.length];
          const values = AXES.map((a) => Math.min(MAX_VALUE, Math.max(0, Number(player[a.key]) ?? 0)));
          const points = values.map((v, i) => {
            const angle = (i / AXES.length) * 360;
            const r = (v / MAX_VALUE) * maxR;
            return polarToCart(cx, cy, r, angle);
          });
          return (
            <polygon
              key={player.id}
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={color}
              fillOpacity="0.25"
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.9"
            />
          );
        })}

        {/* Etiquetas de ejes */}
        {AXES.map((axis, i) => {
          const pos = polarToCart(cx, cy, labelR, (i / AXES.length) * 360);
          const anchor = pos.x < cx - 8 ? 'end' : pos.x > cx + 8 ? 'start' : 'middle';
          return (
            <text
              key={axis.key}
              x={pos.x}
              y={pos.y}
              textAnchor={anchor}
              className="fill-slate-400 text-[9px] font-semibold uppercase"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {players.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
            />
            <span className="text-sm text-slate-300">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompareRadarOverlay;
