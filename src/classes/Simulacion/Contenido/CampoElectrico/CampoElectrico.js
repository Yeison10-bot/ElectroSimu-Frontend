/**
 * Clase Campo Electrico - Implementación según diagrama UML
 * Representa un campo eléctrico en el sistema ElectroSimu
 */
class CampoElectrico {
  constructor(id_campo, posicionX, posicionY) {
    this.id_campo = id_campo;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.magnitud = 0;
    this.direccion = { x: 0, y: 0 };
  }

  /**
   * Crea un nuevo campo eléctrico
   * @param {number} id_campo - ID del campo eléctrico
   * @param {number} posicionX - Posición X del campo
   * @param {number} posicionY - Posición Y del campo
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_campo(id_campo, posicionX, posicionY) {
    try {
      if (!id_campo || posicionX === undefined || posicionY === undefined) {
        console.error('ID y posiciones del campo eléctrico requeridos');
        return false;
      }

      // Actualizar propiedades
      this.id_campo = id_campo;
      this.posicionX = posicionX;
      this.posicionY = posicionY;

      // Guardar en localStorage (simulación)
      const campoData = {
        id_campo: this.id_campo,
        posicionX: this.posicionX,
        posicionY: this.posicionY,
        magnitud: this.magnitud,
        direccion: this.direccion,
        fechaCreacion: new Date().toISOString()
      };

      const camposExistentes = JSON.parse(localStorage.getItem('camposElectricos') || '[]');
      camposExistentes.push(campoData);
      localStorage.setItem('camposElectricos', JSON.stringify(camposExistentes));

      console.log(`Campo eléctrico creado: ID ${id_campo} en (${posicionX}, ${posicionY})`);
      return true;
    } catch (error) {
      console.error('Error al crear campo eléctrico:', error);
      return false;
    }
  }

  /**
   * Ver información de un campo eléctrico
   * @returns {CampoElectrico|null} - Objeto CampoElectrico o null si no se encuentra
   */
  ver_campo() {
    try {
      // Buscar campo en localStorage
      const camposExistentes = JSON.parse(localStorage.getItem('camposElectricos') || '[]');
      const campoEncontrado = camposExistentes.find(c => c.id_campo === this.id_campo);
      
      if (campoEncontrado) {
        const campo = new CampoElectrico(
          campoEncontrado.id_campo,
          campoEncontrado.posicionX,
          campoEncontrado.posicionY
        );
        campo.magnitud = campoEncontrado.magnitud;
        campo.direccion = campoEncontrado.direccion;
        return campo;
      }

      console.log(`Campo eléctrico ${this.id_campo} no encontrado`);
      return null;
    } catch (error) {
      console.error('Error al ver campo eléctrico:', error);
      return null;
    }
  }

  /**
   * Calcula el campo eléctrico en una posición específica
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} carga - Carga que genera el campo
   * @returns {Object} - Campo eléctrico {magnitud, direccion}
   */
  calcularCampo(x, y, carga) {
    try {
      const k = 8.99e9; // Constante de Coulomb
      const distancia = Math.sqrt(
        Math.pow(x - this.posicionX, 2) + 
        Math.pow(y - this.posicionY, 2)
      );

      if (distancia === 0) {
        this.magnitud = 0;
        this.direccion = { x: 0, y: 0 };
        return { magnitud: 0, direccion: { x: 0, y: 0 } };
      }

      // Campo eléctrico: E = kQ/r²
      this.magnitud = (k * Math.abs(carga)) / (distancia * distancia);
      
      // Dirección del campo
      const dx = x - this.posicionX;
      const dy = y - this.posicionY;
      this.direccion = {
        x: dx / distancia,
        y: dy / distancia
      };

      // Actualizar en localStorage
      this.actualizarCampo();

      return { magnitud: this.magnitud, direccion: this.direccion };
    } catch (error) {
      console.error('Error al calcular campo eléctrico:', error);
      return null;
    }
  }

  /**
   * Actualiza el campo eléctrico en localStorage
   * @private
   */
  actualizarCampo() {
    const campoData = {
      id_campo: this.id_campo,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      magnitud: this.magnitud,
      direccion: this.direccion,
      fechaModificacion: new Date().toISOString()
    };

    const camposExistentes = JSON.parse(localStorage.getItem('camposElectricos') || '[]');
    const index = camposExistentes.findIndex(c => c.id_campo === this.id_campo);
    
    if (index !== -1) {
      camposExistentes[index] = campoData;
    } else {
      camposExistentes.push(campoData);
    }
    
    localStorage.setItem('camposElectricos', JSON.stringify(camposExistentes));
  }

  /**
   * Obtiene el ID del campo eléctrico
   * @returns {number} - ID del campo eléctrico
   */
  getId() {
    return this.id_campo;
  }

  /**
   * Obtiene la posición X del campo
   * @returns {number} - Posición X
   */
  getPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y del campo
   * @returns {number} - Posición Y
   */
  getPosicionY() {
    return this.posicionY;
  }

  /**
   * Obtiene la magnitud del campo
   * @returns {number} - Magnitud del campo
   */
  getMagnitud() {
    return this.magnitud;
  }

  /**
   * Obtiene la dirección del campo
   * @returns {Object} - Dirección del campo {x, y}
   */
  getDireccion() {
    return this.direccion;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON del campo eléctrico
   */
  toJSON() {
    return {
      id_campo: this.id_campo,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      magnitud: this.magnitud,
      direccion: this.direccion
    };
  }
}

export default CampoElectrico;
