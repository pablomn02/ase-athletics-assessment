import { Component } from 'react';

/**
 * Captura errores de renderizado en producción y muestra un mensaje en lugar de pantalla en blanco.
 */
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-200">
          <h1 className="text-xl font-bold text-red-400 mb-2">Algo ha ido mal</h1>
          <p className="text-slate-400 text-sm mb-4 text-center max-w-md">
            La aplicación ha encontrado un error. Recarga la página o intenta de nuevo más tarde.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600"
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
