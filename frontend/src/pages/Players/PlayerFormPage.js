/**
 * PlayerFormPage.js
 * Formulario para crear y editar jugadores.
 * Validación alineada con esquemas Joi del backend; payload en snake_case.
 * Muestra errores de validación del backend (details).
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import api from '../../services/api';

const defaultForm = {
  name: '',
  position: '',
  age: '',
  team: '',
  nationality: '',
  height: '',
  weight: '',
  goals: '',
  assists: '',
  appearances: '',
  contract_salary: '',
  contract_end: '',
  market_value: '',
  pace: 5,
  shooting: 5,
  passing: 5,
  defending: 5,
  dribbling: 5,
  physicality: 5,
};

/** Mapea jugador de la API (snake_case) al estado del formulario */
function playerToForm(p) {
  if (!p) return { ...defaultForm };
  return {
    name: p.name ?? '',
    position: p.position ?? '',
    age: p.age !== undefined && p.age !== null ? String(p.age) : '',
    team: p.team ?? '',
    nationality: p.nationality ?? '',
    height: p.height !== undefined && p.height !== null ? String(p.height) : '',
    weight: p.weight !== undefined && p.weight !== null ? String(p.weight) : '',
    goals: p.goals !== undefined && p.goals !== null ? String(p.goals) : '',
    assists: p.assists !== undefined && p.assists !== null ? String(p.assists) : '',
    appearances: p.appearances !== undefined && p.appearances !== null ? String(p.appearances) : '',
    contract_salary: p.contract_salary !== undefined && p.contract_salary !== null ? String(p.contract_salary) : '',
    contract_end: p.contract_end ? p.contract_end.slice(0, 10) : '',
    market_value: p.market_value !== undefined && p.market_value !== null ? String(p.market_value) : '',
    pace: p.pace ?? 5,
    shooting: p.shooting ?? 5,
    passing: p.passing ?? 5,
    defending: p.defending ?? 5,
    dribbling: p.dribbling ?? 5,
    physicality: p.physicality ?? 5,
  };
}

/** Construye payload para API (snake_case, atributos 1-10) */
function formToPayload(form) {
  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
  const payload = {
    name: form.name.trim(),
    position: form.position.trim() || null,
    age: num(form.age),
    team: form.team.trim() || null,
    nationality: form.nationality.trim() || null,
    height: num(form.height),
    weight: num(form.weight),
    goals: num(form.goals) ?? 0,
    assists: num(form.assists) ?? 0,
    appearances: num(form.appearances) ?? 0,
    contract_salary: num(form.contract_salary),
    contract_end: form.contract_end.trim() || null,
    market_value: num(form.market_value),
  };
  const pace = num(form.pace), shooting = num(form.shooting), passing = num(form.passing);
  const defending = num(form.defending), dribbling = num(form.dribbling), physicality = num(form.physicality);
  if ([pace, shooting, passing, defending, dribbling, physicality].some((n) => n != null)) {
    payload.attributes = {
      pace: pace ?? 5,
      shooting: shooting ?? 5,
      passing: passing ?? 5,
      defending: defending ?? 5,
      dribbling: dribbling ?? 5,
      physicality: physicality ?? 5,
    };
  }
  return payload;
}

/** Validación alineada con Joi del backend */
function validateForm(form) {
  const e = {};
  const name = form.name.trim();
  if (!name) e.name = 'El nombre es obligatorio';
  else if (name.length < 2) e.name = 'El nombre debe tener al menos 2 caracteres';
  else if (name.length > 150) e.name = 'El nombre no puede superar 150 caracteres';

  if (form.age !== '' && form.age !== undefined && form.age !== null) {
    const age = Number(form.age);
    if (Number.isNaN(age) || age < 10 || age > 60) e.age = 'La edad debe estar entre 10 y 60 años';
  }

  if (form.position && form.position.length > 50) e.position = 'Máximo 50 caracteres';
  if (form.team && form.team.length > 100) e.team = 'Máximo 100 caracteres';
  if (form.nationality && form.nationality.length > 100) e.nationality = 'Máximo 100 caracteres';

  const attrKeys = ['pace', 'shooting', 'passing', 'defending', 'dribbling', 'physicality'];
  attrKeys.forEach((key) => {
    const v = form[key];
    if (v != null && (v < 1 || v > 10)) e[key] = 'Debe ser entre 1 y 10';
  });

  return e;
}

function PlayerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [backendDetails, setBackendDetails] = useState([]);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const fetchPlayer = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/players/${id}`);
          const data = response.data?.data ?? response.data;
          setFormData(playerToForm(data));
        } catch (err) {
          setError(err.response?.data?.message || 'No se pudo cargar el jugador');
        } finally {
          setLoading(false);
        }
      };
      fetchPlayer();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['pace', 'shooting', 'passing', 'defending', 'dribbling', 'physicality'].includes(name)
        ? (value === '' ? 5 : Math.min(10, Math.max(1, Number(value))))
        : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setBackendDetails([]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBackendDetails([]);

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      const payload = formToPayload(formData);

      if (isEditing) {
        await api.put(`/players/${id}`, payload);
        setSuccess('updated');
        setTimeout(() => navigate(`/players/${id}`, { state: { success: 'updated' } }), 2200);
      } else {
        const response = await api.post('/players', payload);
        const created = response.data?.data ?? response.data;
        setSuccess('created');
        setTimeout(() => navigate(`/players/${created?.id ?? id}`, { state: { success: 'created' } }), 2200);
      }
    } catch (err) {
      const res = err.response?.data;
      setError(res?.message || 'Error al guardar el jugador');
      if (Array.isArray(res?.details)) setBackendDetails(res.details);
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'w-full rounded-lg border px-4 py-2.5 bg-slate-800/80 text-slate-100 placeholder-slate-500 border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none';
  const labelBase = 'block text-sm font-semibold mb-2 text-slate-300';

  if (loading) {
    return (
      <section className="w-full min-h-screen px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-32 rounded bg-slate-700" />
            <div className="h-96 rounded bg-slate-700" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <h1 className="text-3xl font-bold mb-8 text-slate-100">
          {isEditing ? 'Editar Jugador' : 'Crear Nuevo Jugador'}
        </h1>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 text-red-400" />
              <div>
                <p className="text-red-200 font-medium">{error}</p>
                {backendDetails.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-sm text-red-300">
                    {backendDetails.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border-2 border-emerald-500/60 bg-emerald-500/20 p-5 flex items-center gap-4 shadow-lg shadow-emerald-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/30">
              <Check size={28} className="text-emerald-300" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-100">
                {success === 'created' ? 'El jugador se ha creado correctamente' : 'El jugador se ha actualizado correctamente'}
              </p>
              <p className="text-sm text-emerald-300/90 mt-0.5">Redirigiendo al perfil...</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-6 sm:p-8"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-slate-200">Información básica</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelBase}>Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Mín. 2, máx. 150 caracteres"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label className={labelBase}>Equipo</label>
                <input
                  type="text"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Ej: Real Madrid"
                />
              </div>
              <div>
                <label className={labelBase}>Posición</label>
                <select name="position" value={formData.position} onChange={handleChange} className={inputBase}>
                  <option value="">Selecciona</option>
                  <option value="Portero">Portero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Centrocampista">Centrocampista</option>
                  <option value="Delantero">Delantero</option>
                </select>
                {errors.position && <p className="mt-1 text-sm text-red-400">{errors.position}</p>}
              </div>
              <div>
                <label className={labelBase}>Edad (10-60)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min={10}
                  max={60}
                  className={`${inputBase} ${errors.age ? 'border-red-500' : ''}`}
                />
                {errors.age && <p className="mt-1 text-sm text-red-400">{errors.age}</p>}
              </div>
              <div>
                <label className={labelBase}>Nacionalidad</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Ej: España"
                />
              </div>
              <div>
                <label className={labelBase}>Altura (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  step="0.01"
                  className={inputBase}
                  placeholder="Ej: 182"
                />
              </div>
              <div>
                <label className={labelBase}>Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  className={inputBase}
                  placeholder="Ej: 75"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelBase}>Valor de mercado (€)</label>
                <input
                  type="number"
                  name="market_value"
                  value={formData.market_value}
                  onChange={handleChange}
                  step="0.01"
                  min={0}
                  className={inputBase}
                  placeholder="Ej: 50000000"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-slate-200">Estadísticas (opcional)</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelBase}>Partidos</label>
                <input
                  type="number"
                  name="appearances"
                  value={formData.appearances}
                  onChange={handleChange}
                  min={0}
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelBase}>Goles</label>
                <input
                  type="number"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  min={0}
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelBase}>Asistencias</label>
                <input
                  type="number"
                  name="assists"
                  value={formData.assists}
                  onChange={handleChange}
                  min={0}
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-slate-200">Atributos (1-10)</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: 'pace', label: 'Ritmo' },
                { key: 'shooting', label: 'Tiro' },
                { key: 'passing', label: 'Pase' },
                { key: 'dribbling', label: 'Regate' },
                { key: 'defending', label: 'Defensa' },
                { key: 'physicality', label: 'Físico' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className={labelBase}>{label}</label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    className={`${inputBase} ${errors[key] ? 'border-red-500' : ''}`}
                  />
                  {errors[key] && <p className="mt-1 text-sm text-red-400">{errors[key]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-slate-200">Contrato</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelBase}>Salario (€)</label>
                <input
                  type="number"
                  name="contract_salary"
                  value={formData.contract_salary}
                  onChange={handleChange}
                  step="0.01"
                  min={0}
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelBase}>Fin de contrato</label>
                <input
                  type="date"
                  name="contract_end"
                  value={formData.contract_end}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[44px] rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="flex-1 min-h-[44px] rounded-xl border border-slate-600 bg-slate-800 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default PlayerFormPage;
