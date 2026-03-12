/**
 * PlayerSkeleton.js
 * Componente de esqueleto de carga para la tabla de jugadores
 * Proporciona una mejor experiencia de usuario mientras se cargan los datos
 */

function PlayerSkeleton({ count = 20 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <tr key={`skeleton-${idx}`} className="border-t border-slate-800/80">
          <td className="px-4 py-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-700 mx-auto" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-700" />
          </td>
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="h-4 w-10 animate-pulse rounded bg-slate-700" />
          </td>
          <td className="px-4 py-3 hidden md:table-cell text-right">
            <div className="ml-auto h-4 w-10 animate-pulse rounded bg-slate-700" />
          </td>
          <td className="px-4 py-3 hidden md:table-cell text-right">
            <div className="ml-auto h-4 w-10 animate-pulse rounded bg-slate-700" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default PlayerSkeleton;
