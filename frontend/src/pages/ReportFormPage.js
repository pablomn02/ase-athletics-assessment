/**
 * Crear reporte de scouting (Día 6)
 * Formulario con deslizador 1-10 (valoración global) y recomendación: Fichar / Monitorear / Pasar.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const RECOMMENDATION_OPTIONS = [
  { value: 'Fichar', label: 'Fichar' },
  { value: 'Monitorear', label: 'Monitorear' },
  { value: 'Pasar', label: 'Pasar' },
];

function reportToForm(r) {
  if (!r) return null;
  let recommendation = '';
  let recommendation_notes = '';
  if (r.recommendation) {
    const parts = r.recommendation.split(/ - (.+)/);
    recommendation = RECOMMENDATION_OPTIONS.some((o) => o.value === parts[0]) ? parts[0] : '';
    recommendation_notes = parts[1]?.trim() ?? '';
  }
  return {
    player_id: r.player_id ? String(r.player_id) : '',
    match_date: r.match_date ? r.match_date.slice(0, 10) : '',
    overall_rating: r.overall_rating ?? 5,
    strengths: r.strengths ?? '',
    weaknesses: r.weaknesses ?? '',
    recommendation,
    recommendation_notes,
  };
}

function ReportFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingReport, setLoadingReport] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    player_id: '',
    match_date: '',
    overall_rating: 5,
    strengths: '',
    weaknesses: '',
    recommendation: '',
    recommendation_notes: '',
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get('/players', { params: { limit: 200 } });
        setPlayers(res.data?.data ?? []);
      } catch {
        setPlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchReport = async () => {
      try {
        setLoadingReport(true);
        const res = await api.get(`/reports/detail/${id}`);
        const report = res.data?.data ?? res.data;
        const prefill = reportToForm(report);
        if (prefill) setForm(prefill);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el reporte');
      } finally {
        setLoadingReport(false);
      }
    };
    fetchReport();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'overall_rating' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const playerId = form.player_id ? Number(form.player_id) : null;
    if (!playerId) {
      setError('Selecciona un jugador');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const recommendationText = form.recommendation
        ? (form.recommendation_notes
          ? `${form.recommendation} - ${form.recommendation_notes}`
          : form.recommendation)
        : form.recommendation_notes || null;

      const payload = {
        player_id: playerId,
        match_date: form.match_date || null,
        overall_rating: form.overall_rating,
        strengths: form.strengths || null,
        weaknesses: form.weaknesses || null,
        recommendation: recommendationText,
      };

      if (isEdit) {
        await api.put(`/reports/${id}`, payload);
        toast.success('Informe editado correctamente.');
      } else {
        await api.post('/reports', payload);
        toast.success('Informe creado correctamente.');
      }
      setSuccess(true);
      setTimeout(() => navigate('/reports'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el reporte');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6"
        >
          <ArrowLeft size={18} />
          Volver a reportes
        </Link>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          {isEdit ? 'Editar reporte de scouting' : 'Nuevo reporte de scouting'}
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          {isEdit ? 'Modifica los campos y guarda los cambios.' : 'Evaluación estructurada con valoración 1-10 y recomendación final'}
        </p>

        {loadingReport && (
          <div className="mb-6 text-slate-400">Cargando reporte...</div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 flex items-center gap-3">
            <Check className="text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-200">{isEdit ? 'Reporte actualizado correctamente.' : 'Reporte creado correctamente.'} Redirigiendo...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6 space-y-6" style={{ display: loadingReport ? 'none' : 'block' }}>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Jugador *</label>
            <select
              name="player_id"
              value={form.player_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100"
            >
              <option value="">Selecciona un jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.team})</option>
              ))}
            </select>
            {loadingPlayers && <p className="text-xs text-slate-500 mt-1">Cargando jugadores...</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Fecha del partido</label>
            <input
              type="date"
              name="match_date"
              value={form.match_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Valoración (1-10)
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, overall_rating: n }))}
                  className={`min-w-[44px] min-h-[44px] rounded-lg font-semibold text-sm transition-colors touch-manipulation ${
                    form.overall_rating === n
                      ? 'bg-sky-500 text-white border-2 border-sky-400 shadow-md'
                      : 'bg-slate-700/80 text-slate-300 border-2 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Elige un número del 1 al 10</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Fortalezas</label>
            <textarea
              name="strengths"
              value={form.strengths}
              onChange={handleChange}
              rows={3}
              placeholder="Puntos fuertes observados..."
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Debilidades</label>
            <textarea
              name="weaknesses"
              value={form.weaknesses}
              onChange={handleChange}
              rows={3}
              placeholder="Aspectos a mejorar..."
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Recomendación final *</label>
            <select
              name="recommendation"
              value={form.recommendation}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 mb-2"
            >
              <option value="">Selecciona</option>
              {RECOMMENDATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              name="recommendation_notes"
              value={form.recommendation_notes}
              onChange={handleChange}
              placeholder="Notas adicionales (opcional)"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-amber-500 py-3 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear reporte'}
            </button>
            <Link
              to="/reports"
              className="flex-1 rounded-xl border border-slate-600 py-3 font-semibold text-slate-300 text-center hover:bg-slate-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ReportFormPage;
