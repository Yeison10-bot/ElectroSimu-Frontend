/**
 * Clase Circuito - Implementación según diagrama UML
 * Representa un circuito eléctrico en el sistema ElectroSimu
 */
class Circuito {
  constructor(id_circuito, componentes) {
    this.id_circuito = id_circuito;
    this.componentes = componentes || []; // Lista de figuras que componen el circuito
  }

  /**
   * Crea un nuevo circuito
   * @param {number} id - ID del circuito
   * @param {Array<Figura>} componentes - Lista de figuras que componen el circuito
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_circuito(id, componentes) {
    try {
      if (!id || !componentes || !Array.isArray(componentes)) {
        console.error('ID y componentes del circuito requeridos');
        return false;
      }

      // Validar que todos los componentes sean figuras válidas
      for (const componente of componentes) {
        if (!componente || typeof componente.getId !== 'function') {
          console.error('Componentes deben ser objetos Figura válidos');
          return false;
        }
      }

      // Actualizar propiedades
      this.id_circuito = id;
      this.componentes = componentes;

      // Guardar en localStorage (simulación)
      const circuitoData = {
        id_circuito: this.id_circuito,
        componentes: this.componentes.map(c => c.toJSON()),
        fechaCreacion: new Date().toISOString()
      };

      const circuitosExistentes = JSON.parse(localStorage.getItem('circuitos') || '[]');
      circuitosExistentes.push(circuitoData);
      localStorage.setItem('circuitos', JSON.stringify(circuitosExistentes));

      console.log(`Circuito creado: ID ${id} con ${componentes.length} componentes`);
      return true;
    } catch (error) {
      console.error('Error al crear circuito:', error);
      return false;
    }
  }

  /**
   * Ver información de un circuito
   * @param {Array<Figura>} componentes - Lista de componentes
   * @returns {Circuito|null} - Objeto Circuito o null si no se encuentra
   */
  ver_circuito(componentes) {
    try {
      if (!componentes || !Array.isArray(componentes)) {
        console.error('Componentes del circuito requeridos');
        return null;
      }

      // Buscar circuito en localStorage
      const circuitosExistentes = JSON.parse(localStorage.getItem('circuitos') || '[]');
      const circuitoEncontrado = circuitosExistentes.find(c => {
        if (c.componentes.length !== componentes.length) return false;
        return c.componentes.every((comp, index) => 
          comp.id_figura === componentes[index].getId()
        );
      });
      
      if (circuitoEncontrado) {
        return new Circuito(circuitoEncontrado.id_circuito, componentes);
      }

      console.log('Circuito no encontrado');
      return null;
    } catch (error) {
      console.error('Error al ver circuito:', error);
      return null;
    }
  }

  /**
   * Agrega un componente al circuito
   * @param {Figura} componente - Componente a agregar
   * @returns {boolean} - true si se agrega exitosamente
   */
  agregarComponente(componente) {
    try {
      if (!componente || typeof componente.getId !== 'function') {
        console.error('Componente debe ser un objeto Figura válido');
        return false;
      }

      this.componentes.push(componente);
      this.actualizarCircuito();
      console.log(`Componente agregado al circuito: ${componente.getId()}`);
      return true;
    } catch (error) {
      console.error('Error al agregar componente:', error);
      return false;
    }
  }

  /**
   * Elimina un componente del circuito
   * @param {number} idComponente - ID del componente a eliminar
   * @returns {boolean} - true si se elimina exitosamente
   */
  eliminarComponente(idComponente) {
    try {
      if (!idComponente) {
        console.error('ID del componente requerido');
        return false;
      }

      const index = this.componentes.findIndex(c => c.getId() === idComponente);
      if (index !== -1) {
        this.componentes.splice(index, 1);
        this.actualizarCircuito();
        console.log(`Componente eliminado del circuito: ${idComponente}`);
        return true;
      }

      console.error('Componente no encontrado en el circuito');
      return false;
    } catch (error) {
      console.error('Error al eliminar componente:', error);
      return false;
    }
  }

  /**
   * Actualiza el circuito en localStorage
   * @private
   */
  actualizarCircuito() {
    const circuitoData = {
      id_circuito: this.id_circuito,
      componentes: this.componentes.map(c => c.toJSON()),
      fechaModificacion: new Date().toISOString()
    };

    const circuitosExistentes = JSON.parse(localStorage.getItem('circuitos') || '[]');
    const index = circuitosExistentes.findIndex(c => c.id_circuito === this.id_circuito);
    
    if (index !== -1) {
      circuitosExistentes[index] = circuitoData;
    } else {
      circuitosExistentes.push(circuitoData);
    }
    
    localStorage.setItem('circuitos', JSON.stringify(circuitosExistentes));
  }

  /**
   * Obtiene el ID del circuito
   * @returns {number} - ID del circuito
   */
  getId() {
    return this.id_circuito;
  }

  /**
   * Obtiene los componentes del circuito
   * @returns {Array<Figura>} - Lista de componentes
   */
  getComponentes() {
    return this.componentes;
  }

  /**
   * Obtiene el número de componentes
   * @returns {number} - Número de componentes
   */
  getNumeroComponentes() {
    return this.componentes.length;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON del circuito
   */
  toJSON() {
    return {
      id_circuito: this.id_circuito,
      componentes: this.componentes.map(c => c.toJSON())
    };
  }
}

export default Circuito;
