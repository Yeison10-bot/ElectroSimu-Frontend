/**
 * Clase Cable - Representa un cable que conecta dos postes
 * Esta clase maneja las conexiones entre postes en el circuito
 */
class Cable {
  constructor(id, posteInicio, posteFin, grosor, color) {
    this.id = id;
    this.posteInicio = posteInicio;
    this.posteFin = posteFin;
    this.grosor = grosor;
    this.color = color;
    this.estaActivo = true;
  }

  /**
   * Obtiene el ID del cable
   * @returns {number} ID único
   */
  obtenerId() {
    return this.id;
  }

  /**
   * Obtiene el poste de inicio
   * @returns {PosteCarga} Poste de inicio
   */
  obtenerPosteInicio() {
    return this.posteInicio;
  }

  /**
   * Obtiene el poste de fin
   * @returns {PosteCarga} Poste de fin
   */
  obtenerPosteFin() {
    return this.posteFin;
  }

  /**
   * Obtiene el grosor del cable
   * @returns {number} Grosor
   */
  obtenerGrosor() {
    return this.grosor;
  }

  /**
   * Obtiene el color del cable
   * @returns {string} Color
   */
  obtenerColor() {
    return this.color;
  }

  /**
   * Verifica si el cable está activo
   * @returns {boolean} Si está activo
   */
  estaActivo() {
    return this.estaActivo;
  }

  /**
   * Establece el grosor del cable
   * @param {number} nuevoGrosor - Nuevo grosor
   */
  establecerGrosor(nuevoGrosor) {
    this.grosor = nuevoGrosor;
  }

  /**
   * Establece el color del cable
   * @param {string} nuevoColor - Nuevo color
   */
  establecerColor(nuevoColor) {
    this.color = nuevoColor;
  }

  /**
   * Establece el estado activo del cable
   * @param {boolean} activo - Si está activo
   */
  establecerActivo(activo) {
    this.estaActivo = activo;
  }

  /**
   * Obtiene los puntos del cable para renderizado
   * @returns {Array} Array de puntos [x1, y1, x2, y2]
   */
  obtenerPuntos() {
    return [
      this.posteInicio.obtenerPosicionX(),
      this.posteInicio.obtenerPosicionY(),
      this.posteFin.obtenerPosicionX(),
      this.posteFin.obtenerPosicionY()
    ];
  }

  /**
   * Calcula la longitud del cable
   * @returns {number} Longitud del cable
   */
  calcularLongitud() {
    return this.posteInicio.calcularDistancia(this.posteFin);
  }

  /**
   * Verifica si el cable conecta un poste específico
   * @param {PosteCarga} poste - Poste a verificar
   * @returns {boolean} Si conecta el poste
   */
  conectaPoste(poste) {
    return this.posteInicio.obtenerId() === poste.obtenerId() || 
           this.posteFin.obtenerId() === poste.obtenerId();
  }

  /**
   * Obtiene el poste opuesto al dado
   * @param {PosteCarga} poste - Poste de referencia
   * @returns {PosteCarga|null} Poste opuesto o null
   */
  obtenerPosteOpuesto(poste) {
    if (this.posteInicio.obtenerId() === poste.obtenerId()) {
      return this.posteFin;
    } else if (this.posteFin.obtenerId() === poste.obtenerId()) {
      return this.posteInicio;
    }
    return null;
  }

  /**
   * Convierte el cable a un objeto JSON
   * @returns {Object} Representación JSON del cable
   */
  aJSON() {
    return {
      id: this.id,
      posteInicioId: this.posteInicio.obtenerId(),
      posteFinId: this.posteFin.obtenerId(),
      grosor: this.grosor,
      color: this.color,
      estaActivo: this.estaActivo
    };
  }
}

export default Cable;
