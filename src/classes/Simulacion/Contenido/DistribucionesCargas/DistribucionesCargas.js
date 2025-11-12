/**
 * Clase Distribuciones de Cargas - Implementación según diagrama UML
 * Representa las distribuciones de carga en el sistema ElectroSimu
 */
class DistribucionesCargas {
  constructor(id_distribucion, tipo_distribucion, parametros_distribucion) {
    this.id_distribucion = id_distribucion;
    this.tipo_distribucion = tipo_distribucion; // lineal, superficial, volumétrica
    this.parametros_distribucion = parametros_distribucion; // Parámetros específicos
  }

  /**
   * Crea una nueva distribución de cargas
   * @param {number} id_distribucion - ID de la distribución
   * @param {string} tipo_distribucion - Tipo de distribución
   * @param {string} parametros_distribucion - Parámetros de la distribución
   * @returns {boolean} - true si la creación es exitosa
   */
  crear_distribucion(id_distribucion, tipo_distribucion, parametros_distribucion) {
    try {
      if (!id_distribucion || !tipo_distribucion || !parametros_distribucion) {
        console.error('Datos de distribución requeridos');
        return false;
      }

      // Validar tipo de distribución
      const tiposValidos = ['lineal', 'superficial', 'volumétrica'];
      if (!tiposValidos.includes(tipo_distribucion)) {
        console.error('Tipo de distribución no válido');
        return false;
      }

      // Actualizar propiedades
      this.id_distribucion = id_distribucion;
      this.tipo_distribucion = tipo_distribucion;
      this.parametros_distribucion = parametros_distribucion;

      // Guardar en localStorage (simulación)
      const distribucionData = {
        id_distribucion: this.id_distribucion,
        tipo_distribucion: this.tipo_distribucion,
        parametros_distribucion: this.parametros_distribucion,
        fechaCreacion: new Date().toISOString()
      };

      const distribucionesExistentes = JSON.parse(localStorage.getItem('distribucionesCargas') || '[]');
      distribucionesExistentes.push(distribucionData);
      localStorage.setItem('distribucionesCargas', JSON.stringify(distribucionesExistentes));

      console.log(`Distribución de cargas creada: ${tipo_distribucion}`);
      return true;
    } catch (error) {
      console.error('Error al crear distribución de cargas:', error);
      return false;
    }
  }

  /**
   * Ver información de una distribución
   * @param {string} tipo_distribucion - Tipo de distribución
   * @param {string} parametros_distribucion - Parámetros de la distribución
   * @returns {DistribucionesCargas|null} - Objeto DistribucionesCargas o null si no se encuentra
   */
  ver_distribucion(tipo_distribucion, parametros_distribucion) {
    try {
      if (!tipo_distribucion) {
        console.error('Tipo de distribución requerido');
        return null;
      }

      // Buscar distribución en localStorage
      const distribucionesExistentes = JSON.parse(localStorage.getItem('distribucionesCargas') || '[]');
      const distribucionEncontrada = distribucionesExistentes.find(d => 
        d.tipo_distribucion === tipo_distribucion && 
        (!parametros_distribucion || d.parametros_distribucion === parametros_distribucion)
      );
      
      if (distribucionEncontrada) {
        return new DistribucionesCargas(
          distribucionEncontrada.id_distribucion,
          distribucionEncontrada.tipo_distribucion,
          distribucionEncontrada.parametros_distribucion
        );
      }

      console.log(`Distribución ${tipo_distribucion} no encontrada`);
      return null;
    } catch (error) {
      console.error('Error al ver distribución:', error);
      return null;
    }
  }

  /**
   * Calcula el campo eléctrico para la distribución
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} z - Posición Z (opcional)
   * @returns {Object} - Campo eléctrico {magnitud, direccion}
   */
  calcularCampoElectrico(x, y, z = 0) {
    try {
      const k = 8.99e9; // Constante de Coulomb
      let magnitud = 0;
      let direccion = { x: 0, y: 0, z: 0 };

      switch (this.tipo_distribucion) {
        case 'lineal':
          // Campo eléctrico de una varilla infinita: E = (2kλ)/r
          const distancia = Math.sqrt(x*x + y*y);
          magnitud = distancia > 0 ? (2 * k * this.parametros_distribucion.densidad) / distancia : 0;
          direccion = { x: x/distancia, y: y/distancia, z: 0 };
          break;

        case 'superficial':
          // Campo eléctrico de una placa infinita: E = σ/(2ε₀)
          magnitud = this.parametros_distribucion.densidad / (2 * 8.85e-12);
          direccion = { x: 0, y: 0, z: 1 }; // Perpendicular a la placa
          break;

        case 'volumétrica':
          // Campo eléctrico de una esfera: E = kQ/r² para r > R, E = kQr/R³ para r < R
          const radio = Math.sqrt(x*x + y*y + z*z);
          const cargaTotal = this.parametros_distribucion.densidad * (4/3) * Math.PI * Math.pow(this.parametros_distribucion.radio, 3);
          
          if (radio > this.parametros_distribucion.radio) {
            magnitud = (k * cargaTotal) / (radio * radio);
          } else {
            magnitud = (k * cargaTotal * radio) / Math.pow(this.parametros_distribucion.radio, 3);
          }
          
          direccion = { x: x/radio, y: y/radio, z: z/radio };
          break;

        default:
          console.error('Tipo de distribución no soportado');
          return null;
      }

      return { magnitud, direccion };
    } catch (error) {
      console.error('Error al calcular campo eléctrico:', error);
      return null;
    }
  }

  /**
   * Obtiene el ID de la distribución
   * @returns {number} - ID de la distribución
   */
  getId() {
    return this.id_distribucion;
  }

  /**
   * Obtiene el tipo de distribución
   * @returns {string} - Tipo de distribución
   */
  getTipoDistribucion() {
    return this.tipo_distribucion;
  }

  /**
   * Obtiene los parámetros de la distribución
   * @returns {string} - Parámetros de la distribución
   */
  getParametrosDistribucion() {
    return this.parametros_distribucion;
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} - Representación JSON de la distribución
   */
  toJSON() {
    return {
      id_distribucion: this.id_distribucion,
      tipo_distribucion: this.tipo_distribucion,
      parametros_distribucion: this.parametros_distribucion
    };
  }
}

export default DistribucionesCargas;
