// src/classes/Teoria/Tematica.js
import apiTeoriaService from '../../services/ApiTeoriaService.js';

const toStr = (v) => {
  if (v == null) return '';
  if (Array.isArray(v) || (typeof v === 'object' && v !== null)) {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
};

class Tematica {
  constructor(
    id_tematica,
    nombre_tema,
    unidad,
    contenido_textual,
    contenido_visual,
    recursos_pdf = '',
    imagenes = '',
    enlaces_externos = ''
  ) {
    this.id_tematica = id_tematica ?? null;
    this.nombre_tema = nombre_tema ?? '';
    this.unidad = unidad ?? '';
    this.contenido_textual = contenido_textual ?? '';
    this.contenido_visual = contenido_visual ?? '';
    this.recursos_pdf = recursos_pdf ?? '';
    this.imagenes = imagenes ?? '';
    this.enlaces_externos = enlaces_externos ?? '';
  }

  _payload() {
    return {
      unidad: toStr(this.unidad),
      tema: toStr(this.nombre_tema),
      contenido: toStr(this.contenido_textual),
      recurso_multimedia: toStr(this.contenido_visual),
      recursos_pdf: toStr(this.recursos_pdf),
      imagenes: toStr(this.imagenes),
      enlaces_externos: toStr(this.enlaces_externos)
    };
  }

  async crear() {
    const r = await apiTeoriaService.crearTematica(this._payload());
    if (r?.data?.id_modulo) this.id_tematica = r.data.id_modulo;
    return r;
  }

  async modificar() {
    if (this.id_tematica == null) throw new Error('id_tematica requerido para modificar');
    return apiTeoriaService.modificarTematica(this.id_tematica, this._payload());
  }

  async eliminar() {
    if (this.id_tematica == null) throw new Error('id_tematica requerido para eliminar');
    return apiTeoriaService.eliminarTematica(this.id_tematica);
  }
}

export default Tematica;


