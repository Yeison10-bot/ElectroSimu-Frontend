// ============================================
// 🌆 ApiCiudadService.js — Servicio de Ciudad Virtual y Simulaciones
// ============================================

import axios from "axios";

// 🖥️ Usa variable de entorno (Railway) o localhost (desarrollo)
const API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/simulaciones`
    : "http://localhost:3001/api/simulaciones";

class ApiCiudadService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ======================================================
  // 📘 OBTENER SIMULACIONES (niveles disponibles en ciudad)
  // ======================================================
  async obtenerSimulaciones(idUsuario = null) {
    try {
      const url = idUsuario ? `/?idUsuario=${idUsuario}` : "/";
      const response = await this.api.get(url);

      const simulaciones = response.data?.datos || [];
      console.log("📥 Simulaciones desde backend:", simulaciones);

      // Normalizar datos
      return simulaciones.map((sim) => ({
        id_simulacion: Number(sim.id_simulacion),
        tema: sim.tema || "Simulación sin nombre",
        nivel: Number(sim.nivel || 0),
        estado: sim.estado || "pendiente",
        escenario: sim.escenario?.toString().trim().toLowerCase() || `escenario${sim.nivel}`,
        id_usuario: Number(sim.id_usuario || 0),
        id_modulo: Number(sim.id_modulo || 0),
        estado_escenario: sim.estado_escenario || "inactivo",
      }));
    } catch (err) {
      console.error("❌ Error al obtener simulaciones:", err);
      throw new Error("Error al conectar con el servidor de simulaciones (GET)");
    }
  }

  // ======================================================
  // 📈 OBTENER PROGRESO DEL USUARIO (vista_progreso)
  // ======================================================
  async obtenerProgresoUsuario(idUsuario) {
    try {
      const response = await this.api.get(`/progreso/${idUsuario}`);
      const progreso = response.data?.datos || null;

      console.log("📊 Progreso del usuario:", progreso);
      return progreso;
    } catch (err) {
      console.error("❌ Error al obtener progreso del usuario:", err);
      throw new Error("Error al conectar con el servidor de progreso (GET)");
    }
  }

  // ======================================================
  // 🔄 ACTUALIZAR ESTADO DE UNA SIMULACIÓN (tabla avance)
  // ======================================================
  /**
   * Cambia el estado de una simulación en el backend.
   * @param {number} idSimulacion - ID de la simulación
   * @param {number} idUsuario - ID del usuario
   * @param {string} estado - Nuevo estado ("pendiente", "en_progreso", "completado")
   */
  async actualizarEstado(idSimulacion, idUsuario, estado) {
    if (!idSimulacion || !idUsuario) {
      console.error("⚠️ Falta idSimulacion o idUsuario en actualizarEstado()");
      throw new Error("Datos insuficientes para actualizar el estado.");
    }

    try {
      const response = await this.api.put(`/${idSimulacion}/estado`, {
        idUsuario,
        estado,
      });

      console.log(`🧩 Estado de simulación ${idSimulacion} actualizado a: ${estado}`);
      return response.data;
    } catch (err) {
      console.error("❌ Error al actualizar estado de simulación:", err);
      throw new Error("Error al actualizar el estado de la simulación (PUT)");
    }
  }

  // ======================================================
  // 🏁 MARCAR SIMULACIÓN COMO COMPLETADA (individual)
  // ======================================================
  /**
   * Marca una simulación como completada para un usuario.
   * @param {number} idSimulacion
   * @param {number} idUsuario
   */
  async completarSimulacion(idSimulacion, idUsuario) {
    try {
      const response = await this.actualizarEstado(idSimulacion, idUsuario, "completado");
      console.log(`🏁 Simulación ${idSimulacion} completada para usuario ${idUsuario}`);
      return response;
    } catch (err) {
      console.error("❌ Error al completar simulación:", err);
      throw err;
    }
  }

  // ======================================================
  // 🎯 COMPATIBILIDAD: completarNivel (usa usuario logueado)
  // ======================================================
  async completarNivel(idSimulacion) {
    try {
      const user =
        JSON.parse(localStorage.getItem("usuarioElectroSimu")) ||
        JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id_usuario) {
        throw new Error("⚠️ No hay usuario logueado o datos incompletos.");
      }

      return await this.completarSimulacion(idSimulacion, user.id_usuario);
    } catch (err) {
      console.error("❌ Error al completar nivel:", err);
      throw err;
    }
  }
}

// ✅ Exportar instancia lista para usar
const apiCiudadService = new ApiCiudadService();
export default apiCiudadService;
