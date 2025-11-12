import ApiCiudadService from '../../services/ApiCiudadService.js';


class Simulacion {
  constructor(id_simulacion, tema, nivel, estado, carga, distancia, geometria, objetos = []) {
    this.id_simulacion = id_simulacion;
    this.tema = tema; // Objeto o texto de la temática
    this.nivel = nivel; // Objeto o número de nivel
    this.estado = estado; // 'pendiente', 'en_progreso', 'completado'
    this.carga = carga; // Valor de carga en Coulombs
    this.distancia = distancia; // Distancia en metros
    this.geometria = geometria; // Tipo de geometría
    this.objetos = objetos; // Lista de objetos asociados a la simulación
  }

  /**
   * Ejecuta la simulación.
   * @returns {boolean} - true si la ejecución es exitosa.
   */
  ejecutar_simulacion() {
    try {
      if (!this.estado || this.estado === 'pendiente') {
        console.warn('⚠️ La simulación aún no está activa');
        return false;
      }

      console.log(`▶️ Ejecutando simulación ID ${this.id_simulacion}`);
      console.log(`Parámetros: Carga=${this.carga}C, Distancia=${this.distancia}m, Geometría=${this.geometria}`);

      this.guardarSimulacion();
      console.log('✅ Simulación ejecutada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al ejecutar simulación:', error);
      return false;
    }
  }

  /**
   * Inicializa o crea una nueva simulación localmente.
   * @param {number} carga - Valor de carga.
   * @param {number} distancia - Distancia en metros.
   * @param {string} geometria - Tipo de geometría.
   * @returns {boolean} - true si la creación es exitosa.
   */
  crear_simulacion(carga, distancia, geometria) {
    try {
      if (carga === undefined || distancia === undefined || !geometria) {
        console.error('❌ Parámetros de simulación incompletos');
        return false;
      }

      this.carga = carga;
      this.distancia = distancia;
      this.geometria = geometria;
      this.estado = 'en_progreso';

      this.guardarSimulacion();
      console.log(`🧮 Simulación creada: Carga=${carga}C, Distancia=${distancia}m, Geometría=${geometria}`);
      return true;
    } catch (error) {
      console.error('❌ Error al crear simulación:', error);
      return false;
    }
  }

  /**
   * Marca la simulación como completada y sincroniza con el backend.
   * @returns {Promise<boolean>} - true si la sincronización fue exitosa.
   */
  async completarSimulacion() {
    try {
      this.estado = 'completado';
      this.guardarSimulacion();

      await apiSimulacionService.actualizarEstado(this.id_simulacion, 'completado');
      console.log(`✅ Simulación ${this.id_simulacion} completada y sincronizada con el servidor`);
      return true;
    } catch (error) {
      console.error('❌ Error al completar simulación:', error);
      return false;
    }
  }

  /**
   * Guarda la simulación localmente (localStorage).
   * Sirve como respaldo local para los datos del usuario.
   * @private
   */
  guardarSimulacion() {
    const simulacionData = {
      id_simulacion: this.id_simulacion,
      tema: this.tema,
      nivel: this.nivel,
      estado: this.estado,
      carga: this.carga,
      distancia: this.distancia,
      geometria: this.geometria,
      objetos: this.objetos,
      fechaActualizacion: new Date().toISOString(),
    };

    const simulacionesExistentes = JSON.parse(localStorage.getItem('simulaciones') || '[]');
    const index = simulacionesExistentes.findIndex((s) => s.id_simulacion === this.id_simulacion);

    if (index !== -1) simulacionesExistentes[index] = simulacionData;
    else simulacionesExistentes.push(simulacionData);

    localStorage.setItem('simulaciones', JSON.stringify(simulacionesExistentes));
  }

  /**
   * Agrega un objeto a la simulación.
   * @param {Object} objeto - Objeto físico o gráfico.
   * @returns {boolean} - true si se agrega correctamente.
   */
  agregarObjeto(objeto) {
    try {
      if (!objeto) {
        console.error('❌ Objeto inválido');
        return false;
      }

      this.objetos.push(objeto);
      this.guardarSimulacion();
      console.log('🧩 Objeto agregado a la simulación');
      return true;
    } catch (error) {
      console.error('❌ Error al agregar objeto:', error);
      return false;
    }
  }

  // =========================
  // 🔹 Getters y utilitarios
  // =========================

  getId() { return this.id_simulacion; }
  getTema() { return this.tema; }
  getNivel() { return this.nivel; }
  getEstado() { return this.estado; }
  getCarga() { return this.carga; }
  getDistancia() { return this.distancia; }
  getGeometria() { return this.geometria; }
  getObjetos() { return this.objetos; }

  /**
   * Convierte la simulación a JSON para exportar o debug.
   * @returns {Object} - Objeto serializable.
   */
  toJSON() {
    return {
      id_simulacion: this.id_simulacion,
      tema: this.tema,
      nivel: this.nivel,
      estado: this.estado,
      carga: this.carga,
      distancia: this.distancia,
      geometria: this.geometria,
      objetos: this.objetos,
    };
  }
}

export default Simulacion;
