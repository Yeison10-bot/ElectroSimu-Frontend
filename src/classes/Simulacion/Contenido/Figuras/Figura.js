/**
 * Clase Figura - Implementación según diagrama UML
 * Representa una figura geométrica en el sistema ElectroSimu
 */
class Figura {
  constructor(id_figura, tipo_figura, posicionX, posicionY) {
    this.id_figura = id_figura;
    this.tipo_figura = tipo_figura; // circle, rectangle, line, etc.
    this.posicionX = posicionX;
    this.posicionY = posicionY;
  }

  /**
   * Crea una nueva figura
   * @param {number} id_figura - ID de la figura
   * @param {string} tipo_figura - Tipo de figura
   * @param {number} posicionX - Posición X
   * @param {number} posicionY - Posición Y
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_figura(id_figura, tipo_figura, posicionX, posicionY) {
    try {
      if (!id_figura || !tipo_figura || posicionX === undefined || posicionY === undefined) {
        console.error('Datos de figura requeridos');
        return false;
      }

      // Validar tipo de figura
      const tiposValidos = ['circle', 'rectangle', 'line', 'triangle', 'polygon'];
      if (!tiposValidos.includes(tipo_figura)) {
        console.error('Tipo de figura no válido');
        return false;
      }

      // Actualizar propiedades
      this.id_figura = id_figura;
      this.tipo_figura = tipo_figura;
      this.posicionX = posicionX;
      this.posicionY = posicionY;

      // Guardar en localStorage (simulación)
      const figuraData = {
        id_figura: this.id_figura,
        tipo_figura: this.tipo_figura,
        posicionX: this.posicionX,
        posicionY: this.posicionY,
        fechaCreacion: new Date().toISOString()
      };

      const figurasExistentes = JSON.parse(localStorage.getItem('figuras') || '[]');
      figurasExistentes.push(figuraData);
      localStorage.setItem('figuras', JSON.stringify(figurasExistentes));

      console.log(`Figura creada: ${tipo_figura} en (${posicionX}, ${posicionY})`);
      return true;
    } catch (error) {
      console.error('Error al crear figura:', error);
      return false;
    }
  }

  /**
   * Ver información de una figura
   * @param {string} tipo_figura - Tipo de figura
   * @param {number} posicionX - Posición X
   * @param {number} posicionY - Posición Y
   * @returns {Figura|null} - Objeto Figura o null si no se encuentra
   */
  ver_figura(tipo_figura, posicionX, posicionY) {
    try {
      if (!tipo_figura || posicionX === undefined || posicionY === undefined) {
        console.error('Parámetros de figura requeridos');
        return null;
      }

      // Buscar figura en localStorage
      const figurasExistentes = JSON.parse(localStorage.getItem('figuras') || '[]');
      const figuraEncontrada = figurasExistentes.find(f => 
        f.tipo_figura === tipo_figura && 
        f.posicionX === posicionX && 
        f.posicionY === posicionY
      );
      
      if (figuraEncontrada) {
        return new Figura(
          figuraEncontrada.id_figura,
          figuraEncontrada.tipo_figura,
          figuraEncontrada.posicionX,
          figuraEncontrada.posicionY
        );
      }

      console.log(`Figura ${tipo_figura} en (${posicionX}, ${posicionY}) no encontrada`);
      return null;
    } catch (error) {
      console.error('Error al ver figura:', error);
      return null;
    }
  }

  /**
   * Modifica una figura existente
   * @param {string} tipo_figura - Nuevo tipo de figura
   * @param {number} posicionX - Nueva posición X
   * @param {number} posicionY - Nueva posición Y
   * @returns {boolean} - true si la modificación es exitosa
   */
  modificar_figura(tipo_figura, posicionX, posicionY) {
    try {
      if (!tipo_figura || posicionX === undefined || posicionY === undefined) {
        console.error('Parámetros de figura requeridos');
        return false;
      }

      // Actualizar propiedades
      this.tipo_figura = tipo_figura;
      this.posicionX = posicionX;
      this.posicionY = posicionY;

      // Actualizar en localStorage
      const figurasExistentes = JSON.parse(localStorage.getItem('figuras') || '[]');
      const index = figurasExistentes.findIndex(f => f.id_figura === this.id_figura);
      
      if (index !== -1) {
        figurasExistentes[index] = {
          id_figura: this.id_figura,
          tipo_figura: this.tipo_figura,
          posicionX: this.posicionX,
          posicionY: this.posicionY,
          fechaModificacion: new Date().toISOString()
        };
        localStorage.setItem('figuras', JSON.stringify(figurasExistentes));
        console.log(`Figura modificada: ${tipo_figura} en (${posicionX}, ${posicionY})`);
        return true;
      }

      console.error('Figura no encontrada');
      return false;
    } catch (error) {
      console.error('Error al modificar figura:', error);
      return false;
    }
  }

  /**
   * Coloca una figura en una posición específica
   * @param {number} posicionX - Nueva posición X
   * @param {number} posicionY - Nueva posición Y
   * @returns {boolean} - true si se coloca exitosamente
   */
  colocar_figura(posicionX, posicionY) {
    try {
      if (posicionX === undefined || posicionY === undefined) {
        console.error('Posiciones requeridas');
        return false;
      }

      // Actualizar posición
      this.posicionX = posicionX;
      this.posicionY = posicionY;

      // Actualizar en localStorage
      const figurasExistentes = JSON.parse(localStorage.getItem('figuras') || '[]');
      const index = figurasExistentes.findIndex(f => f.id_figura === this.id_figura);
      
      if (index !== -1) {
        figurasExistentes[index].posicionX = posicionX;
        figurasExistentes[index].posicionY = posicionY;
        figurasExistentes[index].fechaModificacion = new Date().toISOString();
        localStorage.setItem('figuras', JSON.stringify(figurasExistentes));
        console.log(`Figura colocada en (${posicionX}, ${posicionY})`);
        return true;
      }

      console.error('Figura no encontrada');
      return false;
    } catch (error) {
      console.error('Error al colocar figura:', error);
      return false;
    }
  }

  /**
   * Obtiene el ID de la figura
   * @returns {number} - ID de la figura
   */
  getId() {
    return this.id_figura;
  }

  /**
   * Obtiene el tipo de figura
   * @returns {string} - Tipo de figura
   */
  getTipoFigura() {
    return this.tipo_figura;
  }

  /**
   * Obtiene la posición X
   * @returns {number} - Posición X
   */
  getPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y
   * @returns {number} - Posición Y
   */
  getPosicionY() {
    return this.posicionY;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON de la figura
   */
  toJSON() {
    return {
      id_figura: this.id_figura,
      tipo_figura: this.tipo_figura,
      posicionX: this.posicionX,
      posicionY: this.posicionY
    };
  }
}

export default Figura;
