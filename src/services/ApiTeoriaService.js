// src/services/ApiTeoriaService.js
import axios from 'axios';

// 🖥️ Usa variable de entorno (Railway) o localhost (desarrollo)
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/modulo-teoria`
  : "http://localhost:3001/api/modulo-teoria";


class ApiTeoriaService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ================================
  // 📘 MÉTODOS DEL MÓDULO DE TEORÍA
  // ================================

  async obtenerTematicas() {
    try {
      const response = await this.api.get('/');
      return response.data?.datos || [];
    } catch (err) {
      console.error('❌ Error al obtener temáticas:', err);
      alert('Error al conectar con el servidor de teoría (GET)');
      throw err;
    }
  }

  async crearTematica(payload) {
    try {
      const response = await this.api.post('/', payload);
      return response.data;
    } catch (err) {
      console.error('❌ Error al crear temática:', err);
      alert('Error al crear temática en el servidor');
      throw err;
    }
  }

  async modificarTematica(id, payload) {
    try {
      const response = await this.api.put(`/${id}`, payload);
      return response.data;
    } catch (err) {
      console.error('❌ Error al modificar temática:', err);
      alert('Error al modificar la temática');
      throw err;
    }
  }

  async eliminarTematica(id) {
    try {
      const response = await this.api.delete(`/${id}`);
      return response.data;
    } catch (err) {
      console.error('❌ Error al eliminar temática:', err);
      alert('Error al eliminar la temática');
      throw err;
    }
  }
}

const apiTeoriaService = new ApiTeoriaService();
export default apiTeoriaService;
