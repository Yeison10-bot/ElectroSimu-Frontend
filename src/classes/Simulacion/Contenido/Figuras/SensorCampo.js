/**
 * Clase SensorCampo - Representa un sensor de campo eléctrico
 * Esta clase maneja el sensor que mide el campo eléctrico en la simulación
 */
class SensorCampo {
  constructor(id, posicionX, posicionY, radio) {
    this.id = id;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.radio = radio;
    this.estaArrastrando = false;
    this.medicionCampo = { magnitud: 0, angulo: 0 };
  }

  /**
   * Obtiene la posición X del sensor
   * @returns {number} Posición X
   */
  obtenerPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y del sensor
   * @returns {number} Posición Y
   */
  obtenerPosicionY() {
    return this.posicionY;
  }

  /**
   * Obtiene el radio del sensor
   * @returns {number} Radio
   */
  obtenerRadio() {
    return this.radio;
  }

  /**
   * Obtiene el estado de arrastre del sensor
   * @returns {boolean} Si está siendo arrastrado
   */
  estaSiendoArrastrado() {
    return this.estaArrastrando;
  }

  /**
   * Obtiene la medición del campo eléctrico
   * @returns {Object} Medición del campo {magnitud, angulo}
   */
  obtenerMedicionCampo() {
    return this.medicionCampo;
  }

  /**
   * Establece una nueva posición para el sensor
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  establecerPosicion(x, y) {
    this.posicionX = x;
    this.posicionY = y;
  }

  /**
   * Establece el estado de arrastre del sensor
   * @param {boolean} arrastrando - Si está siendo arrastrado
   */
  establecerArrastrando(arrastrando) {
    this.estaArrastrando = arrastrando;
  }

  /**
   * Establece la medición del campo eléctrico
   * @param {number} magnitud - Magnitud del campo
   * @param {number} angulo - Ángulo del campo en radianes
   */
  establecerMedicionCampo(magnitud, angulo) {
    this.medicionCampo = { magnitud, angulo };
  }

  /**
   * Calcula la distancia desde el sensor hasta un punto específico
   * @param {number} x - Posición X del punto
   * @param {number} y - Posición Y del punto
   * @returns {number} Distancia calculada
   */
  calcularDistancia(x, y) {
    return Math.sqrt(
      Math.pow(this.posicionX - x, 2) + 
      Math.pow(this.posicionY - y, 2)
    );
  }

  /**
   * Obtiene el color del sensor basado en su estado
   * @returns {string} Color del sensor
   */
  obtenerColor() {
    return this.estaArrastrando ? "#F59E0B" : "#FBBF24";
  }

  /**
   * Convierte el sensor a un objeto JSON
   * @returns {Object} Representación JSON del sensor
   */
  aJSON() {
    return {
      id: this.id,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      radio: this.radio,
      estaArrastrando: this.estaArrastrando,
      medicionCampo: this.medicionCampo
    };
  }
}

export default SensorCampo;