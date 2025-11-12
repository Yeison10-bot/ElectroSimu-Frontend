/**
 * Clase Propiedades - Implementación según diagrama UML
 * Representa las propiedades de una figura en el sistema ElectroSimu
 */
class Propiedades {
  constructor(id_propiedades, nombre_propiedad, valor) {
    this.id_propiedades = id_propiedades;
    this.nombre_propiedad = nombre_propiedad;
    this.valor = valor;
  }

  /**
   * Crea una nueva propiedad
   * @param {number} id_propiedades - ID de la propiedad
   * @param {string} nombre_propiedad - Nombre de la propiedad
   * @param {number} valor - Valor de la propiedad
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_propiedad(id_propiedades, nombre_propiedad, valor) {
    try {
      if (!id_propiedades || !nombre_propiedad || valor === undefined) {
        console.error('Datos de propiedad requeridos');
        return false;
      }

      // Actualizar propiedades
      this.id_propiedades = id_propiedades;
      this.nombre_propiedad = nombre_propiedad;
      this.valor = valor;

      // Guardar en localStorage (simulación)
      const propiedadData = {
        id_propiedades: this.id_propiedades,
        nombre_propiedad: this.nombre_propiedad,
        valor: this.valor,
        fechaCreacion: new Date().toISOString()
      };

      const propiedadesExistentes = JSON.parse(localStorage.getItem('propiedades') || '[]');
      propiedadesExistentes.push(propiedadData);
      localStorage.setItem('propiedades', JSON.stringify(propiedadesExistentes));

      console.log(`Propiedad creada: ${nombre_propiedad} = ${valor}`);
      return true;
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      return false;
    }
  }

  /**
   * Ver información de una propiedad
   * @param {number} id_propiedades - ID de la propiedad
   * @param {string} nombre_propiedad - Nombre de la propiedad
   * @param {number} valor - Valor de la propiedad
   * @returns {Propiedades|null} - Objeto Propiedades o null si no se encuentra
   */
  ver_propiedad(id_propiedades, nombre_propiedad, valor) {
    try {
      if (!id_propiedades) {
        console.error('ID de propiedad requerido');
        return null;
      }

      // Buscar propiedad en localStorage
      const propiedadesExistentes = JSON.parse(localStorage.getItem('propiedades') || '[]');
      const propiedadEncontrada = propiedadesExistentes.find(p => 
        p.id_propiedades === id_propiedades &&
        (!nombre_propiedad || p.nombre_propiedad === nombre_propiedad) &&
        (valor === undefined || p.valor === valor)
      );
      
      if (propiedadEncontrada) {
        return new Propiedades(
          propiedadEncontrada.id_propiedades,
          propiedadEncontrada.nombre_propiedad,
          propiedadEncontrada.valor
        );
      }

      console.log(`Propiedad ${id_propiedades} no encontrada`);
      return null;
    } catch (error) {
      console.error('Error al ver propiedad:', error);
      return null;
    }
  }

  /**
   * Modifica una propiedad existente
   * @param {string} nombre_propiedad - Nuevo nombre de la propiedad
   * @param {number} valor - Nuevo valor de la propiedad
   * @returns {boolean} - true si la modificación es exitosa
   */
  modificar_propiedad(nombre_propiedad, valor) {
    try {
      if (!nombre_propiedad || valor === undefined) {
        console.error('Nombre y valor de propiedad requeridos');
        return false;
      }

      // Actualizar propiedades
      this.nombre_propiedad = nombre_propiedad;
      this.valor = valor;

      // Actualizar en localStorage
      const propiedadesExistentes = JSON.parse(localStorage.getItem('propiedades') || '[]');
      const index = propiedadesExistentes.findIndex(p => p.id_propiedades === this.id_propiedades);
      
      if (index !== -1) {
        propiedadesExistentes[index] = {
          id_propiedades: this.id_propiedades,
          nombre_propiedad: this.nombre_propiedad,
          valor: this.valor,
          fechaModificacion: new Date().toISOString()
        };
        localStorage.setItem('propiedades', JSON.stringify(propiedadesExistentes));
        console.log(`Propiedad modificada: ${nombre_propiedad} = ${valor}`);
        return true;
      }

      console.error('Propiedad no encontrada');
      return false;
    } catch (error) {
      console.error('Error al modificar propiedad:', error);
      return false;
    }
  }

  /**
   * Asigna una propiedad a una figura
   * @param {number} id_propiedades - ID de la propiedad
   * @param {Figura} Figura - Objeto Figura
   * @returns {boolean} - true si la asignación es exitosa
   */
  asignar_propiedad(id_propiedades, Figura) {
    try {
      if (!id_propiedades || !Figura) {
        console.error('ID de propiedad y Figura requeridos');
        return false;
      }

      // Crear relación entre propiedad y figura
      const asignacionData = {
        id_propiedades: id_propiedades,
        id_figura: Figura.getId(),
        fechaAsignacion: new Date().toISOString()
      };

      const asignacionesExistentes = JSON.parse(localStorage.getItem('propiedadesFiguras') || '[]');
      asignacionesExistentes.push(asignacionData);
      localStorage.setItem('propiedadesFiguras', JSON.stringify(asignacionesExistentes));

      console.log(`Propiedad ${id_propiedades} asignada a figura ${Figura.getId()}`);
      return true;
    } catch (error) {
      console.error('Error al asignar propiedad:', error);
      return false;
    }
  }

  /**
   * Obtiene el ID de la propiedad
   * @returns {number} - ID de la propiedad
   */
  getId() {
    return this.id_propiedades;
  }

  /**
   * Obtiene el nombre de la propiedad
   * @returns {string} - Nombre de la propiedad
   */
  getNombrePropiedad() {
    return this.nombre_propiedad;
  }

  /**
   * Obtiene el valor de la propiedad
   * @returns {number} - Valor de la propiedad
   */
  getValor() {
    return this.valor;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON de la propiedad
   */
  toJSON() {
    return {
      id_propiedades: this.id_propiedades,
      nombre_propiedad: this.nombre_propiedad,
      valor: this.valor
    };
  }
}

export default Propiedades;
