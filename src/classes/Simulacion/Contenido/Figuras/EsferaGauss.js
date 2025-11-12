/**
 * Clase EsferaGauss - Representa una esfera gaussiana para la Ley de Gauss
 * Esta clase maneja la esfera que se usa para visualizar la Ley de Gauss
 */
class EsferaGauss {
  constructor(id, posicionX, posicionY, radio, color) {
    this.id = id;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.radio = radio;
    this.color = color;
    this.estaActiva = true;
    this.anguloRotacion = 0;
  }

  /**
   * Obtiene la posición X de la esfera
   * @returns {number} Posición X
   */
  obtenerPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y de la esfera
   * @returns {number} Posición Y
   */
  obtenerPosicionY() {
    return this.posicionY;
  }

  /**
   * Obtiene el radio de la esfera
   * @returns {number} Radio
   */
  obtenerRadio() {
    return this.radio;
  }

  /**
   * Obtiene el color de la esfera
   * @returns {string} Color
   */
  obtenerColor() {
    return this.color;
  }

  /**
   * Obtiene el ángulo de rotación
   * @returns {number} Ángulo en grados
   */
  obtenerAnguloRotacion() {
    return this.anguloRotacion;
  }

  /**
   * Verifica si la esfera está activa
   * @returns {boolean} Si está activa
   */
  estaActiva() {
    return this.estaActiva;
  }

  /**
   * Establece una nueva posición para la esfera
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  establecerPosicion(x, y) {
    this.posicionX = x;
    this.posicionY = y;
  }

  /**
   * Establece un nuevo radio para la esfera
   * @param {number} nuevoRadio - Nuevo radio
   */
  establecerRadio(nuevoRadio) {
    this.radio = nuevoRadio;
  }

  /**
   * Establece un nuevo color para la esfera
   * @param {string} nuevoColor - Nuevo color
   */
  establecerColor(nuevoColor) {
    this.color = nuevoColor;
  }

  /**
   * Establece el ángulo de rotación
   * @param {number} angulo - Ángulo en grados
   */
  establecerAnguloRotacion(angulo) {
    this.anguloRotacion = angulo;
  }

  /**
   * Establece el estado activo de la esfera
   * @param {boolean} activa - Si está activa
   */
  establecerActiva(activa) {
    this.estaActiva = activa;
  }

  /**
   * Calcula el área de la superficie de la esfera
   * @returns {number} Área de la superficie
   */
  calcularAreaSuperficie() {
    return 4 * Math.PI * Math.pow(this.radio, 2);
  }

  /**
   * Calcula el volumen de la esfera
   * @returns {number} Volumen de la esfera
   */
  calcularVolumen() {
    return (4 / 3) * Math.PI * Math.pow(this.radio, 3);
  }

  /**
   * Convierte la esfera a un objeto JSON
   * @returns {Object} Representación JSON de la esfera
   */
  aJSON() {
    return {
      id: this.id,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      radio: this.radio,
      color: this.color,
      estaActiva: this.estaActiva,
      anguloRotacion: this.anguloRotacion
    };
  }
}

export default EsferaGauss;
