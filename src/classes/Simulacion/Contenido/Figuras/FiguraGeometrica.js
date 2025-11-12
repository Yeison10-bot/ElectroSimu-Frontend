/**
 * Clase FiguraGeometrica - Representa una figura geométrica en el escenario
 * Esta clase maneja las figuras que se muestran en la simulación
 */
class FiguraGeometrica {
  constructor(id, tipo, posicionX, posicionY, tamaño, color, propiedades) {
    this.id = id;
    this.tipo = tipo; // 'rectangulo', 'circulo', 'linea'
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.tamaño = tamaño;
    this.color = color;
    this.propiedades = propiedades || {}; // Propiedades específicas de la figura
  }

  /**
   * Obtiene la posición X de la figura
   * @returns {number} Posición X
   */
  obtenerPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y de la figura
   * @returns {number} Posición Y
   */
  obtenerPosicionY() {
    return this.posicionY;
  }

  /**
   * Obtiene el tamaño de la figura
   * @returns {number} Tamaño
   */
  obtenerTamaño() {
    return this.tamaño;
  }

  /**
   * Obtiene el color de la figura
   * @returns {string} Color
   */
  obtenerColor() {
    return this.color;
  }

  /**
   * Obtiene el tipo de figura
   * @returns {string} Tipo de figura
   */
  obtenerTipo() {
    return this.tipo;
  }

  /**
   * Establece una nueva posición para la figura
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  establecerPosicion(x, y) {
    this.posicionX = x;
    this.posicionY = y;
  }

  /**
   * Establece un nuevo tamaño para la figura
   * @param {number} nuevoTamaño - Nuevo tamaño
   */
  establecerTamaño(nuevoTamaño) {
    this.tamaño = nuevoTamaño;
  }

  /**
   * Establece un nuevo color para la figura
   * @param {string} nuevoColor - Nuevo color
   */
  establecerColor(nuevoColor) {
    this.color = nuevoColor;
  }

  /**
   * Obtiene las propiedades de la figura
   * @returns {Object} Propiedades de la figura
   */
  obtenerPropiedades() {
    return this.propiedades;
  }

  /**
   * Establece una propiedad específica
   * @param {string} nombre - Nombre de la propiedad
   * @param {any} valor - Valor de la propiedad
   */
  establecerPropiedad(nombre, valor) {
    this.propiedades[nombre] = valor;
  }

  /**
   * Convierte la figura a un objeto JSON
   * @returns {Object} Representación JSON de la figura
   */
  aJSON() {
    return {
      id: this.id,
      tipo: this.tipo,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      tamaño: this.tamaño,
      color: this.color,
      propiedades: this.propiedades
    };
  }
}

export default FiguraGeometrica;