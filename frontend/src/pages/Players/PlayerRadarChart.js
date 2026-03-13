/**
 * PlayerRadarChart.js
 * Gráfico radar (spider) para atributos del jugador.
 * Escala 1-10; colores: verde (alto), amarillo (medio), rojo (bajo).
 */

const MAX_VALUE = 10;
const AXES = [
  { key: 'pace', label: 'RITMO' },
  { key: 'shooting', label: 'DISPARO' },
  { key: 'passing', label: 'PASE' },
  { key: 'dribbling', label: 'REGATE' },
  { key: 'defending', label: 'DEFENSA' },
  { key: 'physicality', label: 'FÍSICO' },
];

function getColor(value) {
  const v = Number(value) ?? 0;
  if (v >= 8) return '#10b981'; // verde
  if (v >= 6) return '#eab308'; // amarillo
  return '#ef4444'; // rojo
}

function polarToCart(cx, cy, radius, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

// Tamaño lógico del viewBox con margen para que etiquetas y badges no se corten
const VIEWBOX_SIZE = 440;
const CENTER = VIEWBOX_SIZE / 2;

function PlayerRadarChart({ player }) {
  const maxR = CENTER * 0.54;
  const badgeR = CENTER * 0.70;
  const labelR = CENTER * 0.86;
  const cx = CENTER;
  const cy = CENTER;

  const values = AXES.map((a) => ({
    ...a,
    value: Math.min(MAX_VALUE, Math.max(0, Number(player[a.key]) ?? 0)),
  }));

  const points = values.map((item, i) => {
    const angle = (i / AXES.length) * 360;
    const r = (item.value / MAX_VALUE) * maxR;
    return polarToCart(cx, cy, r, angle);
  });

  const badgePositions = values.map((_, i) => {
    const angle = (i / AXES.length) * 360;
    return polarToCart(cx, cy, badgeR, angle);
  });
  const labelPositions = values.map((_, i) => {
    const angle = (i / AXES.length) * 360;
    return polarToCart(cx, cy, labelR, angle);
  });

  const gridLevels = 5;
  const gridCircles = Array.from({ length: gridLevels }, (_, i) => (i + 1) / gridLevels);

  return (
    <div className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[440px] mx-auto aspect-square min-w-0">
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Rejilla: círculos concéntricos */}
        {gridCircles.map((level) => (
          <circle
            key={level}
            cx={cx}
            cy={cy}
            r={(level * maxR) / 1}
            fill="none"
            stroke="rgba(71, 85, 105, 0.6)"
            strokeWidth="0.6"
          />
        ))}

        {/* Líneas radiales */}
        {values.map((_, i) => {
          const angle = (i / AXES.length) * 360;
          const end = polarToCart(cx, cy, maxR, angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(71, 85, 105, 0.6)"
              strokeWidth="0.6"
            />
          );
        })}

        {/* Polígono por segmentos (triángulos coloreados desde centro) */}
        {values.map((item, i) => {
          const next = (i + 1) % values.length;
          const p1 = points[i];
          const p2 = points[next];
          const color = getColor(item.value);
          return (
            <path
              key={item.key}
              d={`M ${cx} ${cy} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`}
              fill={color}
              fillOpacity="0.55"
              stroke={color}
              strokeWidth="1.2"
              strokeOpacity="0.95"
            />
          );
        })}

        {/* Borde del polígono (línea que une los puntos) */}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(248, 250, 252, 0.75)"
          strokeWidth="2"
        />

        {/* Badges circulares con el valor (escala 10-100) */}
        {values.map((item, i) => {
          const pos = badgePositions[i];
          const color = getColor(item.value);
          return (
            <g key={item.key}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="18"
                fill={color}
                fillOpacity="0.95"
                stroke="rgba(15, 23, 42, 0.95)"
                strokeWidth="1.5"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white font-bold"
                style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11 }}
              >
                {Math.round((item.value / MAX_VALUE) * 100)}
              </text>
            </g>
          );
        })}

        {/* Etiquetas de atributos (en el perímetro) */}
        {values.map((item, i) => {
          const pos = labelPositions[i];
          const anchor = pos.x < cx - 8 ? 'end' : pos.x > cx + 8 ? 'start' : 'middle';
          return (
            <text
              key={item.key}
              x={pos.x}
              y={pos.y}
              textAnchor={anchor}
              className="fill-slate-300 font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'system-ui, sans-serif', fontSize: 10 }}
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default PlayerRadarChart;
