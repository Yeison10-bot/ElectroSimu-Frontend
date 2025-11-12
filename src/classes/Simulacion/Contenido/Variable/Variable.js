/**
 * Clase Variable - Implementación según diagrama UML
 * Representa una variable en el sistema ElectroSimu
 */
class Variable {
  constructor(id_variable, nombre, rango_permitido, unidad_medida) {
    this.id_variable = id_variable;
    this.nombre = nombre;
    this.rango_permitido = rango_permitido;
    this.unidad_medida = unidad_medida;
    this.valor_actual = 0;
  }

  /**
   * Crea una nueva variable
   * @param {number} id_variable - ID de la variable
   * @param {string} nombre - Nombre de la variable
   * @param {number} Rango_permitido - Rango permitido de la variable
   * @param {string} Unidad_medida - Unidad de medida de la variable
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_variable(id_variable, nombre, Rango_permitido, Unidad_medida) {
    try {
      if (!id_variable || !nombre || Rango_permitido === undefined || !Unidad_medida) {
        console.error('Datos de variable requeridos');
        return false;
      }

      // Actualizar propiedades
      this.id_variable = id_variable;
      this.nombre = nombre;
      this.rango_permitido = Rango_permitido;
      this.unidad_medida = Unidad_medida;

      // Guardar en localStorage (simulación)
      const variableData = {
        id_variable: this.id_variable,
        nombre: this.nombre,
        rango_permitido: this.rango_permitido,
        unidad_medida: this.unidad_medida,
        valor_actual: this.valor_actual,
        fechaCreacion: new Date().toISOString()
      };

      const variablesExistentes = JSON.parse(localStorage.getItem('variables') || '[]');
      variablesExistentes.push(variableData);
      localStorage.setItem('variables', JSON.stringify(variablesExistentes));

      console.log(`Variable creada: ${nombre} (${Unidad_medida})`);
      return true;
    } catch (error) {
      console.error('Error al crear variable:', error);
      return false;
    }
  }

  /**
   * Ver información de una variable
   * @param {string} nombre - Nombre de la variable
   * @param {number} Rango_permitido - Rango permitido
   * @param {string} Unidad_medida - Unidad de medida
   * @returns {Variable|null} - Objeto Variable o null si no se encuentra
   */
  ver_variable(nombre, Rango_permitido, Unidad_medida) {
    try {
      if (!nombre) {
        console.error('Nombre de variable requerido');
        return null;
      }

      // Buscar variable en localStorage
      const variablesExistentes = JSON.parse(localStorage.getItem('variables') || '[]');
      const variableEncontrada = variablesExistentes.find(v => 
        v.nombre === nombre &&
        (Rango_permitido === undefined || v.rango_permitido === Rango_permitido) &&
        (!Unidad_medida || v.unidad_medida === Unidad_medida)
      );
      
      if (variableEncontrada) {
        const variable = new Variable(
          variableEncontrada.id_variable,
          variableEncontrada.nombre,
          variableEncontrada.rango_permitido,
          variableEncontrada.unidad_medida
        );
        variable.valor_actual = variableEncontrada.valor_actual;
        return variable;
      }

      console.log(`Variable ${nombre} no encontrada`);
      return null;
    } catch (error) {
      console.error('Error al ver variable:', error);
      return null;
    }
  }

  /**
   * Modifica una variable existente
   * @param {string} nombre - Nuevo nombre de la variable
   * @param {number} Rango_permitido - Nuevo rango permitido
   * @param {string} Unidad_medida - Nueva unidad de medida
   * @returns {boolean} - true si la modificación es exitosa
   */
  modificar_variable(nombre, Rango_permitido, Unidad_medida) {
    try {
      if (!nombre || Rango_permitido === undefined || !Unidad_medida) {
        console.error('Datos de variable requeridos');
        return false;
      }

      // Actualizar propiedades
      this.nombre = nombre;
      this.rango_permitido = Rango_permitido;
      this.unidad_medida = Unidad_medida;

      // Actualizar en localStorage
      const variablesExistentes = JSON.parse(localStorage.getItem('variables') || '[]');
      const index = variablesExistentes.findIndex(v => v.id_variable === this.id_variable);
      
      if (index !== -1) {
        variablesExistentes[index] = {
          id_variable: this.id_variable,
          nombre: this.nombre,
          rango_permitido: this.rango_permitido,
          unidad_medida: this.unidad_medida,
          valor_actual: this.valor_actual,
          fechaModificacion: new Date().toISOString()
        };
        localStorage.setItem('variables', JSON.stringify(variablesExistentes));
        console.log(`Variable modificada: ${nombre}`);
        return true;
      }

      console.error('Variable no encontrada');
      return false;
    } catch (error) {
      console.error('Error al modificar variable:', error);
      return false;
    }
  }

  /**
   * Establece el valor actual de la variable
   * @param {number} valor - Nuevo valor
   * @returns {boolean} - true si se establece exitosamente
   */
  setValor(valor) {
    try {
      if (valor === undefined) {
        console.error('Valor requerido');
        return false;
      }

      // Validar que el valor esté dentro del rango permitido
      if (valor < 0 || valor > this.rango_permitido) {
        console.error(`Valor fuera del rango permitido (0-${this.rango_permitido})`);
        return false;
      }

      this.valor_actual = valor;
      this.actualizarVariable();
      console.log(`Valor de ${this.nombre} establecido: ${valor} ${this.unidad_medida}`);
      return true;
    } catch (error) {
      console.error('Error al establecer valor:', error);
      return false;
    }
  }

  /**
   * Obtiene el valor actual de la variable
   * @returns {number} - Valor actual
   */
  getValor() {
    return this.valor_actual;
  }

  /**
   * Actualiza la variable en localStorage
   * @private
   */
  actualizarVariable() {
    const variableData = {
      id_variable: this.id_variable,
      nombre: this.nombre,
      rango_permitido: this.rango_permitido,
      unidad_medida: this.unidad_medida,
      valor_actual: this.valor_actual,
      fechaModificacion: new Date().toISOString()
    };

    const variablesExistentes = JSON.parse(localStorage.getItem('variables') || '[]');
    const index = variablesExistentes.findIndex(v => v.id_variable === this.id_variable);
    
    if (index !== -1) {
      variablesExistentes[index] = variableData;
    } else {
      variablesExistentes.push(variableData);
    }
    
    localStorage.setItem('variables', JSON.stringify(variablesExistentes));
  }

  /**
   * Obtiene el ID de la variable
   * @returns {number} - ID de la variable
   */
  getId() {
    return this.id_variable;
  }

  /**
   * Obtiene el nombre de la variable
   * @returns {string} - Nombre de la variable
   */
  getNombre() {
    return this.nombre;
  }

  /**
   * Obtiene el rango permitido
   * @returns {number} - Rango permitido
   */
  getRangoPermitido() {
    return this.rango_permitido;
  }

  /**
   * Obtiene la unidad de medida
   * @returns {string} - Unidad de medida
   */
  getUnidadMedida() {
    return this.unidad_medida;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON de la variable
   */
  toJSON() {
    return {
      id_variable: this.id_variable,
      nombre: this.nombre,
      rango_permitido: this.rango_permitido,
      unidad_medida: this.unidad_medida,
      valor_actual: this.valor_actual
    };
  }
}

export default Variable;
