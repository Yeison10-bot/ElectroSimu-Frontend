import apiCiudadService from "../../services/ApiCiudadService.js";

/**
 * 🏙️ Clase CiudadVirtual
 * Representa la ciudad virtual del sistema ElectroSimu
 */
class CiudadVirtual {
  constructor(id_ciudad, estado = false) {
    this.id_ciudad = id_ciudad;
    this.estado = estado;
    this.niveles = [];
    this.progreso = 0;
  }

  /**
   * Inicializa la ciudad desde el backend
   */
  async inicializarCiudad(idUsuario) {
    try {
      console.log("📡 Cargando ciudad virtual para usuario:", idUsuario);

      const simulaciones = await apiCiudadService.obtenerSimulaciones(idUsuario);
      console.log("🧩 Simulaciones recibidas:", simulaciones);

      if (!simulaciones || simulaciones.length === 0) {
        console.warn("⚠️ No se encontraron simulaciones");
        return false;
      }

      const simulacionesValidas = simulaciones.filter(
        (s) => s && (s.id_simulacion || s.id)
      );

      const progresoData = await apiCiudadService.obtenerProgresoUsuario(idUsuario);
      console.log("📊 Progreso obtenido:", progresoData);

      this.niveles = simulacionesValidas.map((sim) => {
        const id = Number(sim.id_simulacion || sim.id);
        const nivelNum = Number(sim.nivel || 0);

        return {
          id_simulacion: id,
          nivel: nivelNum,
          nombre: sim.tema || sim.nombre || `Simulación ${id}`,
          escenario: sim.escenario || `escenario${nivelNum}`,
          estado: sim.estado || "pendiente",
          completado: sim.estado === "completado", // ✅ solo si está marcado así en avance
        };
      });


      // Asegurar orden por campo "nivel"
      this.niveles.sort((a, b) => a.nivel - b.nivel);

      this.calcularProgreso();
      this.guardarLocal();

      console.log("✅ Ciudad virtual inicializada con", this.niveles.length, "niveles.");
      console.table(this.niveles);
      return true;
    } catch (error) {
      console.error("❌ Error al inicializar ciudad virtual:", error);
      return false;
    }
  }

  /**
   * Marcar un nivel como completado
   */
  async completarNivel(idSimulacion) {
    try {
      await apiCiudadService.completarNivel(idSimulacion);
      const nivel = this.niveles.find((n) => n.id_simulacion === idSimulacion);
      if (nivel) {
        nivel.estado = "completado";
        nivel.completado = true;
      }

      this.calcularProgreso();
      this.guardarLocal();
      return true;
    } catch (error) {
      console.error("❌ Error al completar nivel:", error);
      return false;
    }
  }

  /**
   * Verifica si el usuario puede acceder a un nivel
   */
  /**
 * 🔹 Verifica si el usuario puede acceder a un nivel
 * El primer nivel (nivel === 1) siempre está desbloqueado.
 * Los demás se desbloquean cuando el anterior (nivel - 1) está completado.
 */
  puedeAccederNivel(idSimulacion) {
    if (!this.niveles || this.niveles.length === 0) return false;

    // 🧩 Buscar índice del nivel actual
    const index = this.niveles.findIndex(n => n.id_simulacion === idSimulacion);
    if (index === -1) return false;

    // 🟢 Primer nivel siempre desbloqueado
    if (index === 0) {
      console.log(`🟢 Nivel inicial desbloqueado (ID ${idSimulacion})`);
      return true;
    }

    // 🔒 Los demás dependen del anterior
    const nivelAnterior = this.niveles[index - 1];
    const puede = !!nivelAnterior?.completado;
    console.log(`🔍 Acceso a nivel ${index + 1} (${idSimulacion}):`, puede ? "✅ Desbloqueado" : "🔒 Bloqueado");
    return puede;
  }


  /**
   * Calcula el progreso general
   */
  calcularProgreso() {
    const total = this.niveles.length;
    const completados = this.niveles.filter((n) => n.completado).length;
    this.progreso = total > 0 ? Math.round((completados / total) * 100) : 0;
  }

  /**
   * Guarda en localStorage
   */
  guardarLocal() {
    const data = {
      id_ciudad: this.id_ciudad,
      estado: this.estado,
      niveles: this.niveles,
      progreso: this.progreso,
      fechaActualizacion: new Date().toISOString(),
    };
    localStorage.setItem("ciudadVirtual", JSON.stringify(data));
  }

  // Getters
  getId() { return this.id_ciudad; }
  getEstado() { return this.estado; }
  getNiveles() { return this.niveles; }
  getProgreso() { return this.progreso; }
  tieneEnergia() { return this.estado; }
}

export default CiudadVirtual;
