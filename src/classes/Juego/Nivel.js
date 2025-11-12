import apiCiudadService from '../../services/ApiCiudadService.js';


/**
 * Clase Nivel - Versión actualizada conectada al backend
 * Representa un nivel dentro de la ciudad virtual,
 * vinculado directamente con una simulación en la BD.
 */
class Nivel {
  constructor(id_simulacion, nombre, estado = 'pendiente', completado = false) {
    this.id_simulacion = id_simulacion; // Equivalente a id_nivel
    this.nombre = nombre;
    this.estado = estado; // 'pendiente', 'en_progreso', 'completado'
    this.completado = completado;
  }

  /**
   * 🔹 Marca el nivel como completado tanto en frontend como en backend
   */
  async completarNivel() {
    try {
      const response = await apiCiudadService.completarNivel(this.id_simulacion);
      if (response.exito) {
        this.estado = 'completado';
        this.completado = true;
        console.log(`🏁 Nivel completado: ${this.nombre}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error al completar nivel:', error);
      return false;
    }
  }

  /**
   * 🔹 Verifica si el nivel está desbloqueado (según el anterior)
   * @param {Nivel|null} nivelAnterior - Nivel anterior (si existe)
   */
  estaDesbloqueado(nivelAnterior) {
    if (!nivelAnterior) return true; // El primer nivel siempre está disponible
    return nivelAnterior.completado;
  }

  /**
   * 🔹 Convierte el nivel a un objeto plano (para debug o render)
   */
  toJSON() {
    return {
      id_simulacion: this.id_simulacion,
      nombre: this.nombre,
      estado: this.estado,
      completado: this.completado
    };
  }
}

export default Nivel;
