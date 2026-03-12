/**
 * PlayerFormPage.js
 * Formulario para crear y editar jugadores
 * Incluye: Validación, campos obligatorios, manejo de errores
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import api from '../../services/api';

function PlayerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    position: '',
    age: '',
    nationality: '',
    height: '',
    weight: '',
    marketValue: '',
    pace: 75,
    shooting: 70,
    passing: 72,
    dribbling: 68,
    defense: 60,
    physical: 75,
    contractStart: '',
    contractEnd: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const fetchPlayer = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/players/${id}`);
          setFormData(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'No se pudo cargar el jugador');
        } finally {
          setLoading(false);
        }
      };
      fetchPlayer();
    }
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.team.trim()) newErrors.team = 'El equipo es obligatorio';
    if (!formData.position.trim()) newErrors.position = 'La posición es obligatoria';
    if (!formData.age || formData.age < 16 || formData.age > 50) {
      newErrors.age = 'La edad debe estar entre 16 y 50 años';
    }
    if (!formData.nationality.trim()) newErrors.nationality = 'La nacionalidad es obligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' || name === 'marketValue' 
        ? (value === '' ? '' : Number(value))
        : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (isEditing) {
        await api.put(`/players/${id}`, formData);
        setSuccess('Jugador actualizado correctamente');
        setTimeout(() => navigate(`/players/${id}`), 1500);
      } else {
        const response = await api.post('/players', formData);
        setSuccess('Jugador creado correctamente');
        setTimeout(() => navigate(`/players/${response.data.id}`), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el jugador');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full min-h-screen px-4 py-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-32 rounded bg-slate-700"></div>
            <div className="h-screen rounded bg-slate-700"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen px-4 py-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="mx-auto max-w-2xl">
        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <h1 className="text-3xl font-bold mb-8" style={{ color: '#f1f5f9' }}>
          {isEditing ? 'Editar Jugador' : 'Crear Nuevo Jugador'}
        </h1>

        {/* Mensajes */}
        {error && (
          <div
            className="mb-6 rounded-lg border p-4"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
              <p style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div
            className="mb-6 rounded-lg border p-4"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.5)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <Check size={20} style={{ color: '#10b981' }} />
              <p style={{ color: '#86efac' }}>{success}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border p-8"
          style={{
            borderColor: 'rgba(51, 65, 85, 0.5)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          {/* Sección 1: Información Básica */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#cbd5e1' }}>
              Información Básica
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Nombre del Jugador *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2 transition-colors"
                  style={{
                    borderColor: errors.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                  placeholder="Ej: Cristiano Ronaldo"
                />
                {errors.name && <p style={{ color: '#fca5a5' }} className="mt-1 text-sm">{errors.name}</p>}
              </div>

              {/* Equipo */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Equipo *
                </label>
                <input
                  type="text"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: errors.team ? 'rgba(239, 68, 68, 0.5)' : 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                  placeholder="Ej: Real Madrid"
                />
                {errors.team && <p style={{ color: '#fca5a5' }} className="mt-1 text-sm">{errors.team}</p>}
              </div>

              {/* Posición */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Posición *
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: errors.position ? 'rgba(239, 68, 68, 0.5)' : 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                >
                  <option value="">Selecciona una posición</option>
                  <option value="Portero">Portero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Centrocampista">Centrocampista</option>
                  <option value="Delantero">Delantero</option>
                </select>
                {errors.position && <p style={{ color: '#fca5a5' }} className="mt-1 text-sm">{errors.position}</p>}
              </div>

              {/* Edad */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Edad *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: errors.age ? 'rgba(239, 68, 68, 0.5)' : 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                  min="16"
                  max="50"
                />
                {errors.age && <p style={{ color: '#fca5a5' }} className="mt-1 text-sm">{errors.age}</p>}
              </div>

              {/* Nacionalidad */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Nacionalidad *
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: errors.nationality ? 'rgba(239, 68, 68, 0.5)' : 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                  placeholder="Ej: Portugal"
                />
                {errors.nationality && <p style={{ color: '#fca5a5' }} className="mt-1 text-sm">{errors.nationality}</p>}
              </div>

              {/* Altura */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Altura (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                  placeholder="Ej: 187"
                />
              </div>

              {/* Peso */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                  placeholder="Ej: 84"
                />
              </div>

              {/* Valor de Mercado */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Valor de Mercado ($)
                </label>
                <input
                  type="number"
                  name="marketValue"
                  value={formData.marketValue}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                  placeholder="Ej: 500000000"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Estadísticas */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#cbd5e1' }}>
              Estadísticas (0-100)
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {['pace', 'shooting', 'passing', 'dribbling', 'defense', 'physical'].map(stat => (
                <div key={stat}>
                  <label className="block text-sm font-semibold mb-2 capitalize" style={{ color: '#cbd5e1' }}>
                    {stat}
                  </label>
                  <input
                    type="number"
                    name={stat}
                    value={formData[stat]}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full rounded-lg border px-4 py-2"
                    style={{
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      color: '#f1f5f9',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sección 3: Contrato */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#cbd5e1' }}>
              Información de Contrato
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Inicio de Contrato
                </label>
                <input
                  type="date"
                  name="contractStart"
                  value={formData.contractStart}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>
                  Fin de Contrato
                </label>
                <input
                  type="date"
                  name="contractEnd"
                  value={formData.contractEnd}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2"
                  style={{
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    color: '#f1f5f9',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 flex-wrap">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg px-6 py-3 font-semibold transition-all disabled:opacity-50"
              style={{
                backgroundColor: '#0ea5e9',
                color: 'white',
              }}
            >
              {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="flex-1 rounded-lg px-6 py-3 font-semibold transition-all"
              style={{
                backgroundColor: 'rgba(51, 65, 85, 0.3)',
                color: '#cbd5e1',
                border: '1px solid rgba(51, 65, 85, 0.5)',
              }}
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
