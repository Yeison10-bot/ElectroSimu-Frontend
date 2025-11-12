/**
 * Clase FlechaCampo - Representa una flecha de campo eléctrico
 * Esta clase maneja las flechas que muestran la dirección del campo eléctrico
 */
class FlechaCampo {
  constructor(id, posicionX, posicionY, magnitud, angulo, color) {
    this.id = id;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.magnitud = magnitud;
    this.angulo = angulo; // Ángulo en radianes
    this.color = color;
    this.longitud = 20; // Longitud base de la flecha
    this.grosor = 2; // Grosor de la flecha
  }

  /**
   * Obtiene la posición X de la flecha
   * @returns {number} Posición X
   */
  obtenerPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y de la flecha
   * @returns {number} Posición Y
   */
  obtenerPosicionY() {
    return this.posicionY;
  }

  /**
   * Obtiene la magnitud del campo
   * @returns {number} Magnitud
   */
  obtenerMagnitud() {
    return this.magnitud;
  }

  /**
   * Obtiene el ángulo de la flecha
   * @returns {number} Ángulo en radianes
   */
  obtenerAngulo() {
    return this.angulo;
  }

  /**
   * Obtiene el color de la flecha
   * @returns {string} Color
   */
  obtenerColor() {
    return this.color;
  }

  /**
   * Obtiene la longitud de la flecha
   * @returns {number} Longitud
   */
  obtenerLongitud() {
    return this.longitud;
  }

  /**
   * Obtiene el grosor de la flecha
   * @returns {number} Grosor
   */
  obtenerGrosor() {
    return this.grosor;
  }

  /**
   * Establece una nueva posición para la flecha
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  establecerPosicion(x, y) {
    this.posicionX = x;
    this.posicionY = y;
  }

  /**
   * Establece la magnitud del campo
   * @param {number} nuevaMagnitud - Nueva magnitud
   */
  establecerMagnitud(nuevaMagnitud) {
    this.magnitud = nuevaMagnitud;
  }

  /**
   * Establece el ángulo de la flecha
   * @param {number} nuevoAngulo - Nuevo ángulo en radianes
   */
  establecerAngulo(nuevoAngulo) {
    this.angulo = nuevoAngulo;
  }

  /**
   * Establece un nuevo color para la flecha
   * @param {string} nuevoColor - Nuevo color
   */
  establecerColor(nuevoColor) {
    this.color = nuevoColor;
  }

  /**
   * Establece la longitud de la flecha
   * @param {number} nuevaLongitud - Nueva longitud
   */
  establecerLongitud(nuevaLongitud) {
    this.longitud = nuevaLongitud;
  }

  /**
   * Establece el grosor de la flecha
   * @param {number} nuevoGrosor - Nuevo grosor
   */
  establecerGrosor(nuevoGrosor) {
    this.grosor = nuevoGrosor;
  }

  /**
   * Calcula la posición final de la flecha
   * @returns {Object} Posición final {x, y}
   */
  calcularPosicionFinal() {
    const longitudEscalada = this.longitud * Math.min(this.magnitud / 1000, 1);
    return {
      x: this.posicionX + Math.cos(this.angulo) * longitudEscalada,
      y: this.posicionY + Math.sin(this.angulo) * longitudEscalada
    };
  }

  /**
   * Obtiene los puntos para dibujar la flecha
   * @returns {Array} Array de puntos [x1, y1, x2, y2]
   */
  obtenerPuntos() {
    const posicionFinal = this.calcularPosicionFinal();
    return [this.posicionX, this.posicionY, posicionFinal.x, posicionFinal.y];
  }

  /**
   * Convierte la flecha a un objeto JSON
   * @returns {Object} Representación JSON de la flecha
   */
  aJSON() {
    return {
      id: this.id,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      magnitud: this.magnitud,
      angulo: this.angulo,
      color: this.color,
      longitud: this.longitud,
      grosor: this.grosor
    };
  }
}

export default FlechaCampo;
