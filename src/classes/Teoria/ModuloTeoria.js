// src/classes/Teoria/ModuloTeoria.js
import apiTeoriaService from '../../services/ApiTeoriaService.js';

class ModuloTeoria {
  constructor(id_ModuloTeoria = null, nombre = '') {
    this.id_ModuloTeoria = id_ModuloTeoria;
    this.nombre = nombre;
    this.tematicas = [];
    this.cargando = false;
    this.error = null;
  }

  async cargarTematicas() {
    try {
      this.cargando = true;
      this.error = null;

      const datos = await apiTeoriaService.obtenerTematicas();
      this.tematicas = (datos || []).map(m => ({
        id_tematica: m.id_modulo,
        nombre_tema: m.tema,
        unidad: m.unidad,
        contenido_textual: m.contenido || '',
        contenido_visual: m.recurso_multimedia || '',
        recursos_pdf: m.recursos_pdf || [],
        imagenes: m.imagenes || [],
        enlaces_externos: m.enlaces_externos || []
      }));

      this.cargando = false;
      return this.tematicas;
    } catch (e) {
      this.error = e.message;
      this.cargando = false;
      throw e;
    }
  }

  getTematicaPorId(id) {
    return this.tematicas.find(t => t.id_tematica === id) || null;
  }

  getTematicasPorUnidad(unidad) {
    return this.tematicas.filter(t => t.unidad === unidad);
  }

  toJSON() {
    return {
      id_ModuloTeoria: this.id_ModuloTeoria,
      nombre: this.nombre,
      tematicas: this.tematicas,
      cargando: this.cargando,
      error: this.error
    };
  }
}

export default ModuloTeoria;
