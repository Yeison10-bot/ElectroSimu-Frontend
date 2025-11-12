/**
 * Clase ParticulaCampo - Representa una partícula en el campo eléctrico
 * Esta clase maneja las partículas que se mueven según el campo eléctrico
 */
class ParticulaCampo {
  constructor(id, posicionX, posicionY, velocidadX, velocidadY, color, tamaño) {
    this.id = id;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.velocidadX = velocidadX;
    this.velocidadY = velocidadY;
    this.color = color;
    this.tamaño = tamaño;
    this.estaActiva = true;
    this.vida = 1.0; // Vida de la partícula (0-1)
    this.edad = 0; // Edad en frames
  }

  /**
   * Obtiene la posición X de la partícula
   * @returns {number} Posición X
   */
  obtenerPosicionX() {
    return this.posicionX;
  }

  /**
   * Obtiene la posición Y de la partícula
   * @returns {number} Posición Y
   */
  obtenerPosicionY() {
    return this.posicionY;
  }

  /**
   * Obtiene la velocidad X de la partícula
   * @returns {number} Velocidad X
   */
  obtenerVelocidadX() {
    return this.velocidadX;
  }

  /**
   * Obtiene la velocidad Y de la partícula
   * @returns {number} Velocidad Y
   */
  obtenerVelocidadY() {
    return this.velocidadY;
  }

  /**
   * Obtiene el color de la partícula
   * @returns {string} Color
   */
  obtenerColor() {
    return this.color;
  }

  /**
   * Obtiene el tamaño de la partícula
   * @returns {number} Tamaño
   */
  obtenerTamaño() {
    return this.tamaño;
  }

  /**
   * Obtiene la vida de la partícula
   * @returns {number} Vida (0-1)
   */
  obtenerVida() {
    return this.vida;
  }

  /**
   * Obtiene la edad de la partícula
   * @returns {number} Edad en frames
   */
  obtenerEdad() {
    return this.edad;
  }

  /**
   * Verifica si la partícula está activa
   * @returns {boolean} Si está activa
   */
  estaActiva() {
    return this.estaActiva;
  }

  /**
   * Establece una nueva posición para la partícula
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  establecerPosicion(x, y) {
    this.posicionX = x;
    this.posicionY = y;
  }

  /**
   * Establece la velocidad de la partícula
   * @param {number} vx - Velocidad X
   * @param {number} vy - Velocidad Y
   */
  establecerVelocidad(vx, vy) {
    this.velocidadX = vx;
    this.velocidadY = vy;
  }

  /**
   * Establece un nuevo color para la partícula
   * @param {string} nuevoColor - Nuevo color
   */
  establecerColor(nuevoColor) {
    this.color = nuevoColor;
  }

  /**
   * Establece el tamaño de la partícula
   * @param {number} nuevoTamaño - Nuevo tamaño
   */
  establecerTamaño(nuevoTamaño) {
    this.tamaño = nuevoTamaño;
  }

  /**
   * Establece la vida de la partícula
   * @param {number} nuevaVida - Nueva vida (0-1)
   */
  establecerVida(nuevaVida) {
    this.vida = Math.max(0, Math.min(1, nuevaVida));
  }

  /**
   * Establece el estado activo de la partícula
   * @param {boolean} activa - Si está activa
   */
  establecerActiva(activa) {
    this.estaActiva = activa;
  }

  /**
   * Actualiza la posición de la partícula según su velocidad
   * @param {number} deltaTime - Tiempo transcurrido
   */
  actualizarPosicion(deltaTime = 1) {
    this.posicionX += this.velocidadX * deltaTime;
    this.posicionY += this.velocidadY * deltaTime;
    this.edad += deltaTime;
  }

  /**
   * Aplica una fuerza a la partícula
   * @param {number} fuerzaX - Fuerza en X
   * @param {number} fuerzaY - Fuerza en Y
   * @param {number} masa - Masa de la partícula
   */
  aplicarFuerza(fuerzaX, fuerzaY, masa = 1) {
    this.velocidadX += fuerzaX / masa;
    this.velocidadY += fuerzaY / masa;
  }

  /**
   * Reduce la vida de la partícula
   * @param {number} reduccion - Cantidad a reducir
   */
  reducirVida(reduccion = 0.01) {
    this.vida -= reduccion;
    if (this.vida <= 0) {
      this.estaActiva = false;
    }
  }

  /**
   * Obtiene el color con transparencia basada en la vida
   * @returns {string} Color con transparencia
   */
  obtenerColorConTransparencia() {
    const alpha = Math.floor(this.vida * 255);
    return this.color + alpha.toString(16).padStart(2, '0');
  }

  /**
   * Convierte la partícula a un objeto JSON
   * @returns {Object} Representación JSON de la partícula
   */
  aJSON() {
    return {
      id: this.id,
      posicionX: this.posicionX,
      posicionY: this.posicionY,
      velocidadX: this.velocidadX,
      velocidadY: this.velocidadY,
      color: this.color,
      tamaño: this.tamaño,
      estaActiva: this.estaActiva,
      vida: this.vida,
      edad: this.edad
    };
  }
}

export default ParticulaCampo;
