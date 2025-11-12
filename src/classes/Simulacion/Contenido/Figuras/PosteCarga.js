/**
 * Clase PosteCarga - Representa un poste con carga eléctrica
 * Esta clase maneja los postes que se usan para armar circuitos
 */
class PosteCarga {
  constructor(id, posicionX, posicionY, carga, radio) {
    this.id = id;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.carga = carga; // Carga eléctrica (positiva, negativa o cero)
    this.radio = radio;
    this.estaArrastrando = false;
    this.estaSeleccionado = false;
  }

  /**
   * Obtiene la posición X del poste
   * @returns {number} Posición X
   */
  obtenerPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y del poste
   * @returns {number} Posición Y
   */
  obtenerPosicionY() {
    return this.posicionY;
  }

  /**
   * Obtiene la carga del poste
   * @returns {number} Carga eléctrica
   */
  obtenerCarga() {
    return this.carga;
  }

  /**
   * Obtiene el radio del poste
   * @returns {number} Radio
   */
  obtenerRadio() {
    return this.radio;
  }

  /**
   * Obtiene el ID del poste
   * @returns {number} ID único
   */
  obtenerId() {
    return this.id;
  }

  /**
   * Verifica si el poste está siendo arrastrado
   * @returns {boolean} Si está siendo arrastrado
   */
  estaSiendoArrastrado() {
    return this.estaArrastrando;
  }

  /**
   * Verifica si el poste está seleccionado
   * @returns {boolean} Si está seleccionado
   */
  estaSeleccionado() {
    return this.estaSeleccionado;
  }

  /**
   * Establece una nueva posición para el poste
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  establecerPosicion(x, y) {
    this.posicionX = x;
    this.posicionY = y;
  }

  /**
   * Establece la carga del poste
   * @param {number} nuevaCarga - Nueva carga eléctrica
   */
  establecerCarga(nuevaCarga) {
    this.carga = nuevaCarga;
  }

  /**
   * Establece el estado de arrastre del poste
   * @param {boolean} arrastrando - Si está siendo arrastrado
   */
  establecerArrastrando(arrastrando) {
    this.estaArrastrando = arrastrando;
  }

  /**
   * Establece el estado de selección del poste
   * @param {boolean} seleccionado - Si está seleccionado
   */
  establecerSeleccionado(seleccionado) {
    this.estaSeleccionado = seleccionado;
  }

  /**
   * Obtiene el color del poste según su carga
   * @returns {string} Color del poste
   */
  obtenerColor() {
    if (this.carga > 0) {
      return '#EF4444'; // Rojo para carga positiva
    } else if (this.carga < 0) {
      return '#3B82F6'; // Azul para carga negativa
    } else {
      return '#6B7280'; // Gris para carga neutra
    }
  }

  /**
   * Obtiene el color del borde según su estado
   * @returns {string} Color del borde
   */
  obtenerColorBorde() {
    if (this.estaSeleccionado) {
      return '#F59E0B'; // Naranja para seleccionado
    } else if (this.estaArrastrando) {
      return '#10B981'; // Verde para arrastrando
    } else {
      return '#374151'; // Gris oscuro para normal
    }
  }

  /**
   * Calcula la distancia hasta otro poste
   * @param {PosteCarga} otroPoste - Otro poste
   * @returns {number} Distancia calculada
   */
  calcularDistancia(otroPoste) {
    return Math.sqrt(
      Math.pow(this.posicionX - otroPoste.obtenerPosicionX(), 2) + 
      Math.pow(this.posicionY - otroPoste.obtenerPosicionY(), 2)
    );
  }

  /**
   * Verifica si el poste tiene carga
   * @returns {boolean} Si tiene carga
   */
  tieneCarga() {
    return this.carga !== 0;
  }

  /**
   * Convierte el poste a un objeto JSON
   * @returns {Object} Representación JSON del poste
   */
  aJSON() {
    return {
      id: this.id,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      carga: this.carga,
      radio: this.radio,
      estaArrastrando: this.estaArrastrando,
      estaSeleccionado: this.estaSeleccionado
    };
  }
}

export default PosteCarga;
