/**
 * Clase Grafica - Implementación según diagrama UML
 * Representa una gráfica asociada a una temática en el sistema ElectroSimu
 */
class Grafica {
  constructor(id_grafica, tipo_grafica, tematica_asociada) {
    this.id_grafica = id_grafica;
    this.tipo_grafica = tipo_grafica; // chart, plot, diagram, etc.
    this.tematica_asociada = tematica_asociada; // Objeto Tematica
  }

  /**
   * Crea una nueva gráfica
   * @param {number} id_grafica - ID de la gráfica
   * @param {string} tipo_grafica - Tipo de gráfica
   * @param {Tematica} tematica_asociada - Temática asociada
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_grafica(id_grafica, tipo_grafica, tematica_asociada) {
    try {
      if (!id_grafica || !tipo_grafica || !tematica_asociada) {
        console.error('ID, tipo de gráfica y temática asociada requeridos');
        return false;
      }

      // Validar tipo de gráfica
      const tiposValidos = ['chart', 'plot', 'diagram', 'graph', 'histogram'];
      if (!tiposValidos.includes(tipo_grafica)) {
        console.error('Tipo de gráfica no válido');
        return false;
      }

      // Actualizar propiedades
      this.id_grafica = id_grafica;
      this.tipo_grafica = tipo_grafica;
      this.tematica_asociada = tematica_asociada;

      // Guardar en localStorage (simulación)
      const graficaData = {
        id_grafica: this.id_grafica,
        tipo_grafica: this.tipo_grafica,
        tematica_asociada: this.tematica_asociada.getId(),
        fechaCreacion: new Date().toISOString()
      };

      const graficasExistentes = JSON.parse(localStorage.getItem('graficas') || '[]');
      graficasExistentes.push(graficaData);
      localStorage.setItem('graficas', JSON.stringify(graficasExistentes));

      console.log(`Gráfica creada: ${tipo_grafica} para temática ${tematica_asociada.getNombreTema()}`);
      return true;
    } catch (error) {
      console.error('Error al crear gráfica:', error);
      return false;
    }
  }

  /**
   * Ver si una gráfica existe o es visible
   * @returns {boolean} - true si la gráfica es visible
   */
  ver_grafica() {
    try {
      // Buscar gráfica en localStorage
      const graficasExistentes = JSON.parse(localStorage.getItem('graficas') || '[]');
      const graficaEncontrada = graficasExistentes.find(g => g.id_grafica === this.id_grafica);
      
      if (graficaEncontrada) {
        console.log(`Gráfica visible: ${this.tipo_grafica}`);
        return true;
      }

      console.log('Gráfica no encontrada');
      return false;
    } catch (error) {
      console.error('Error al ver gráfica:', error);
      return false;
    }
  }

  /**
   * Obtiene el ID de la gráfica
   * @returns {number} - ID de la gráfica
   */
  getId() {
    return this.id_grafica;
  }

  /**
   * Obtiene el tipo de gráfica
   * @returns {string} - Tipo de gráfica
   */
  getTipoGrafica() {
    return this.tipo_grafica;
  }

  /**
   * Obtiene la temática asociada
   * @returns {Tematica} - Temática asociada
   */
  getTematicaAsociada() {
    return this.tematica_asociada;
  }

  /**
   * Establece la temática asociada
   * @param {Tematica} tematica - Temática a asociar
   */
  setTematicaAsociada(tematica) {
    this.tematica_asociada = tematica;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON de la gráfica
   */
  toJSON() {
    return {
      id_grafica: this.id_grafica,
      tipo_grafica: this.tipo_grafica,
      tematica_asociada: this.tematica_asociada ? this.tematica_asociada.getId() : null
    };
  }
}

export default Grafica;
