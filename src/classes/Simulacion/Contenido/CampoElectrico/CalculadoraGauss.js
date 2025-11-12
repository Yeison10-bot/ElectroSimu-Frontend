/**
 * Clase CalculadoraGauss - Calcula la Ley de Gauss y flujo eléctrico
 * Esta clase maneja todos los cálculos relacionados con la Ley de Gauss
 */
class CalculadoraGauss {
  constructor() {
    // Constante de Coulomb
    this.constanteCoulomb = 8.99e9;
    // Permitividad del vacío
    this.permitividadVacío = 8.85e-12;
  }

  /**
   * Calcula el flujo eléctrico a través de una superficie
   * @param {number} campoElectrico - Magnitud del campo eléctrico
   * @param {number} area - Área de la superficie
   * @param {number} angulo - Ángulo entre el campo y la normal
   * @returns {number} Flujo eléctrico
   */
  calcularFlujoElectrico(campoElectrico, area, angulo) {
    return campoElectrico * area * Math.cos(angulo);
  }

  /**
   * Calcula el flujo máximo positivo
   * @param {number} campoElectrico - Magnitud del campo eléctrico
   * @param {number} area - Área de la superficie
   * @returns {number} Flujo máximo positivo
   */
  calcularFlujoMaximoPositivo(campoElectrico, area) {
    return this.calcularFlujoElectrico(campoElectrico, area, 0);
  }

  /**
   * Calcula el flujo máximo negativo
   * @param {number} campoElectrico - Magnitud del campo eléctrico
   * @param {number} area - Área de la superficie
   * @returns {number} Flujo máximo negativo
   */
  calcularFlujoMaximoNegativo(campoElectrico, area) {
    return this.calcularFlujoElectrico(campoElectrico, area, Math.PI);
  }

  /**
   * Calcula el flujo cero
   * @returns {number} Flujo cero
   */
  calcularFlujoCero() {
    return 0;
  }

  /**
   * Calcula la divergencia del campo eléctrico
   * @param {number} flujoEntrante - Flujo entrante
   * @param {number} flujoSaliente - Flujo saliente
   * @param {number} volumen - Volumen de la región
   * @returns {number} Divergencia del campo
   */
  calcularDivergencia(flujoEntrante, flujoSaliente, volumen) {
    return (flujoSaliente - flujoEntrante) / volumen;
  }

  /**
   * Calcula el campo eléctrico de una carga puntual
   * @param {number} carga - Carga eléctrica
   * @param {number} distancia - Distancia desde la carga
   * @returns {number} Magnitud del campo eléctrico
   */
  calcularCampoElectricoCargaPuntual(carga, distancia) {
    if (distancia === 0) return 0;
    return (this.constanteCoulomb * Math.abs(carga)) / Math.pow(distancia, 2);
  }

  /**
   * Calcula el campo eléctrico de una distribución esférica
   * @param {number} cargaTotal - Carga total
   * @param {number} radio - Radio de la distribución
   * @param {number} distancia - Distancia desde el centro
   * @returns {number} Magnitud del campo eléctrico
   */
  calcularCampoElectricoEsferico(cargaTotal, radio, distancia) {
    if (distancia === 0) return 0;
    
    if (distancia >= radio) {
      // Fuera de la esfera
      return (this.constanteCoulomb * Math.abs(cargaTotal)) / Math.pow(distancia, 2);
    } else {
      // Dentro de la esfera
      const cargaInterna = (Math.abs(cargaTotal) * Math.pow(distancia, 3)) / Math.pow(radio, 3);
      return (this.constanteCoulomb * cargaInterna) / Math.pow(distancia, 2);
    }
  }

  /**
   * Genera flechas de campo eléctrico para una grilla
   * @param {number} centroX - Posición X del centro
   * @param {number} centroY - Posición Y del centro
   * @param {number} radio - Radio de la distribución
   * @param {number} carga - Carga total
   * @param {number} anchoGrilla - Ancho de la grilla
   * @param {number} altoGrilla - Alto de la grilla
   * @param {number} tamañoGrilla - Tamaño de cada celda
   * @returns {Array} Array de flechas de campo
   */
  generarFlechasCampo(centroX, centroY, radio, carga, anchoGrilla, altoGrilla, tamañoGrilla) {
    const flechas = [];
    
    for (let x = 0; x <= anchoGrilla; x += tamañoGrilla) {
      for (let y = 0; y <= altoGrilla; y += tamañoGrilla) {
        const distancia = Math.sqrt(Math.pow(x - centroX, 2) + Math.pow(y - centroY, 2));
        
        // Evitar el centro donde el campo es infinito
        if (distancia < 10) continue;
        
        const campo = this.calcularCampoElectricoEsferico(carga, radio, distancia);
        const angulo = Math.atan2(y - centroY, x - centroX);
        
        // Escalar la magnitud para visualización
        const magnitudEscalada = Math.min(campo / 1e6, 50);
        
        flechas.push({
          posicionX: x,
          posicionY: y,
          magnitud: campo,
          angulo: angulo,
          longitud: magnitudEscalada,
          color: '#8B5CF6'
        });
      }
    }
    
    return flechas;
  }

  /**
   * Genera partículas para visualizar el flujo
   * @param {number} centroX - Posición X del centro
   * @param {number} centroY - Posición Y del centro
   * @param {number} radio - Radio de la esfera
   * @param {number} cantidad - Cantidad de partículas
   * @returns {Array} Array de partículas
   */
  generarParticulasFlujo(centroX, centroY, radio, cantidad = 50) {
    const particulas = [];
    
    for (let i = 0; i < cantidad; i++) {
      // Generar partículas en la superficie de la esfera
      const angulo = (i / cantidad) * 2 * Math.PI;
      const posicionX = centroX + Math.cos(angulo) * radio;
      const posicionY = centroY + Math.sin(angulo) * radio;
      
      // Velocidad radial hacia afuera
      const velocidadX = Math.cos(angulo) * 2;
      const velocidadY = Math.sin(angulo) * 2;
      
      particulas.push({
        id: i,
        posicionX: posicionX,
        posicionY: posicionY,
        velocidadX: velocidadX,
        velocidadY: velocidadY,
        color: '#10B981',
        tamaño: 3,
        vida: 1.0
      });
    }
    
    return particulas;
  }

  /**
   * Calcula el texto del flujo según el ángulo
   * @param {number} anguloGrados - Ángulo en grados
   * @returns {string} Texto del flujo
   */
  calcularTextoFlujo(anguloGrados) {
    if (anguloGrados <= 5) {
      return 'Flujo máximo positivo';
    } else if (anguloGrados >= 85) {
      return 'Flujo = 0';
    } else if (anguloGrados >= 175) {
      return 'Flujo máximo negativo';
    } else {
      return `Flujo: ${Math.cos(anguloGrados * Math.PI / 180).toFixed(2)}`;
    }
  }

  /**
   * Calcula el texto de la divergencia
   * @param {number} divergencia - Valor de la divergencia
   * @returns {string} Texto de la divergencia
   */
  calcularTextoDivergencia(divergencia) {
    if (Math.abs(divergencia) < 0.01) {
      return 'Divergencia = 0';
    } else if (divergencia > 0) {
      return `Divergencia = +${divergencia.toFixed(2)}`;
    } else {
      return `Divergencia = ${divergencia.toFixed(2)}`;
    }
  }
}

export default CalculadoraGauss;
