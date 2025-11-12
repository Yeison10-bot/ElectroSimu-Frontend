/**
 * Clase Explicacion - Implementación según diagrama UML
 * Representa una explicación asociada a una simulación en el sistema ElectroSimu
 */
class Explicacion {
  constructor(id_explicacion, contenido) {
    this.id_explicacion = id_explicacion;
    this.contenido = contenido;
  }

  /**
   * Crea una nueva explicación
   * @param {number} id_explicacion - ID de la explicación
   * @param {string} contenido - Contenido de la explicación
   * @param {Simulacion} Simulacion_asociada - Simulación asociada
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_explicacion(id_explicacion, contenido, Simulacion_asociada) {
    try {
      if (!id_explicacion || !contenido) {
        console.error('ID y contenido de explicación requeridos');
        return false;
      }

      // Actualizar propiedades
      this.id_explicacion = id_explicacion;
      this.contenido = contenido;
      this.simulacion_asociada = Simulacion_asociada;

      // Guardar en localStorage (simulación)
      const explicacionData = {
        id_explicacion: this.id_explicacion,
        contenido: this.contenido,
        simulacion_asociada: Simulacion_asociada ? Simulacion_asociada.getId() : null,
        fechaCreacion: new Date().toISOString()
      };

      const explicacionesExistentes = JSON.parse(localStorage.getItem('explicaciones') || '[]');
      explicacionesExistentes.push(explicacionData);
      localStorage.setItem('explicaciones', JSON.stringify(explicacionesExistentes));

      console.log(`Explicación creada: ID ${id_explicacion}`);
      return true;
    } catch (error) {
      console.error('Error al crear explicación:', error);
      return false;
    }
  }

  /**
   * Modifica una explicación existente
   * @param {string} contenido - Nuevo contenido de la explicación
   * @returns {boolean} - true si la modificación es exitosa
   */
  modificar_explicacion(contenido) {
    try {
      if (!contenido) {
        console.error('Contenido de explicación requerido');
        return false;
      }

      // Actualizar contenido
      this.contenido = contenido;

      // Actualizar en localStorage
      const explicacionesExistentes = JSON.parse(localStorage.getItem('explicaciones') || '[]');
      const index = explicacionesExistentes.findIndex(e => e.id_explicacion === this.id_explicacion);
      
      if (index !== -1) {
        explicacionesExistentes[index] = {
          id_explicacion: this.id_explicacion,
          contenido: this.contenido,
          simulacion_asociada: this.simulacion_asociada ? this.simulacion_asociada.getId() : null,
          fechaModificacion: new Date().toISOString()
        };
        localStorage.setItem('explicaciones', JSON.stringify(explicacionesExistentes));
        console.log(`Explicación modificada: ID ${this.id_explicacion}`);
        return true;
      }

      console.error('Explicación no encontrada');
      return false;
    } catch (error) {
      console.error('Error al modificar explicación:', error);
      return false;
    }
  }

  /**
   * Ver información de una explicación
   * @param {string} contenido - Contenido de la explicación
   * @returns {Explicacion|null} - Objeto Explicacion o null si no se encuentra
   */
  ver_explicacion(contenido) {
    try {
      if (!contenido) {
        console.error('Contenido de explicación requerido');
        return null;
      }

      // Buscar explicación en localStorage
      const explicacionesExistentes = JSON.parse(localStorage.getItem('explicaciones') || '[]');
      const explicacionEncontrada = explicacionesExistentes.find(e => 
        e.contenido === contenido
      );
      
      if (explicacionEncontrada) {
        return new Explicacion(
          explicacionEncontrada.id_explicacion,
          explicacionEncontrada.contenido
        );
      }

      console.log('Explicación no encontrada');
      return null;
    } catch (error) {
      console.error('Error al ver explicación:', error);
      return null;
    }
  }

  /**
   * Obtiene el ID de la explicación
   * @returns {number} - ID de la explicación
   */
  getId() {
    return this.id_explicacion;
  }

  /**
   * Obtiene el contenido de la explicación
   * @returns {string} - Contenido de la explicación
   */
  getContenido() {
    return this.contenido;
  }

  /**
   * Obtiene la simulación asociada
   * @returns {Simulacion|null} - Simulación asociada
   */
  getSimulacionAsociada() {
    return this.simulacion_asociada;
  }

  /**
   * Establece la simulación asociada
   * @param {Simulacion} simulacion - Simulación a asociar
   */
  setSimulacionAsociada(simulacion) {
    this.simulacion_asociada = simulacion;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON de la explicación
   */
  toJSON() {
    return {
      id_explicacion: this.id_explicacion,
      contenido: this.contenido,
      simulacion_asociada: this.simulacion_asociada ? this.simulacion_asociada.getId() : null
    };
  }
}

export default Explicacion;
