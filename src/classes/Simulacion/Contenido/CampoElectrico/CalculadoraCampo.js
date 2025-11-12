/**
 * Clase CalculadoraCampo - Calcula el campo eléctrico para diferentes distribuciones
 * Esta clase maneja todos los cálculos del campo eléctrico según el tipo de distribución
 */
class CalculadoraCampo {
  constructor() {
    // Constante de Coulomb
    this.constanteCoulomb = 8.99e9;
    // Permitividad del vacío
    this.permitividadVacío = 8.85e-12;
  }

  /**
   * Calcula el campo eléctrico para una distribución lineal
   * @param {number} densidadCarga - Densidad de carga lineal
   * @param {number} longitud - Longitud de la distribución
   * @param {number} posicionX - Posición X del sensor
   * @param {number} posicionY - Posición Y del sensor
   * @returns {Object} Campo eléctrico {magnitud, angulo}
   */
  calcularCampoLineal(densidadCarga, longitud, posicionX, posicionY) {
    // Centro de la distribución lineal
    const centroX = 300;
    const centroY = 200;

    // Distancia perpendicular desde el punto al eje de la línea
    const distanciaPerpendicular = Math.abs(posicionY - centroY);

    // Para distribución lineal finita, usamos aproximación
    const cargaTotal = densidadCarga * longitud;
    const distanciaAlCentro = Math.abs(posicionX - centroX);

    // Campo aproximado para distribución lineal finita
    let magnitud = 0;
    let angulo = 0;

    if (distanciaPerpendicular > 0) {
      // Para distribución lineal, el campo debe ser horizontal (ángulo 0 o π)
      // El campo apunta hacia la línea desde arriba y abajo
      magnitud = (this.constanteCoulomb * cargaTotal) / (distanciaPerpendicular * distanciaPerpendicular);
      angulo = posicionY > centroY ? Math.PI / 2 : -Math.PI / 2; // Vertical hacia arriba o abajo
    }

    return { magnitud, angulo };
  }

  /**
   * Calcula el campo eléctrico para una distribución superficial
   * @param {number} densidadCarga - Densidad de carga superficial
   * @param {number} tamaño - Tamaño de la distribución
   * @param {number} posicionX - Posición X del sensor
   * @param {number} posicionY - Posición Y del sensor
   * @returns {Object} Campo eléctrico {magnitud, angulo}
   */
  calcularCampoSuperficial(densidadCarga, tamaño, posicionX, posicionY) {
    // Centro de la distribución superficial
    const centroX = 300;
    const centroY = 200;

    // Distancia desde el punto al centro de la superficie
    const distanciaX = posicionX - centroX;
    const distanciaY = posicionY - centroY;
    const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

    // Para distribución superficial finita, el campo es más complejo
    // Usamos aproximación: campo perpendicular cerca del centro, más complejo en los bordes
    let magnitud = 0;
    let angulo = 0;

    if (distancia > 0) {
      // Área total de la superficie
      const area = tamaño * tamaño;

      // Carga total
      const cargaTotal = densidadCarga * area;

      // Campo aproximado para superficie finita
      // Para puntos fuera de la superficie, el campo es perpendicular
      if (Math.abs(distanciaX) > tamaño/2 || Math.abs(distanciaY) > tamaño/2) {
        // Punto fuera de la superficie
        magnitud = (this.constanteCoulomb * cargaTotal) / (distancia * distancia);
        angulo = Math.atan2(distanciaY, distanciaX);
      } else {
        // Punto sobre la superficie - campo perpendicular
        magnitud = densidadCarga / (2 * this.permitividadVacío);
        angulo = Math.PI / 2; // Perpendicular hacia arriba
      }
    }

    return { magnitud, angulo };
  }

  /**
   * Calcula el campo eléctrico para una distribución volumétrica
   * @param {number} densidadCarga - Densidad de carga volumétrica
   * @param {number} radio - Radio de la distribución
   * @param {number} posicionX - Posición X del sensor
   * @param {number} posicionY - Posición Y del sensor
   * @returns {Object} Campo eléctrico {magnitud, angulo}
   */
  calcularCampoVolumetrico(densidadCarga, radio, posicionX, posicionY) {
    const distanciaCentro = Math.sqrt(
      Math.pow(posicionX - 300, 2) + 
      Math.pow(posicionY - 200, 2)
    );
    
    const cargaTotal = densidadCarga * (4 / 3) * Math.PI * Math.pow(radio, 3);
    let magnitud = 0;
    
    if (distanciaCentro > radio) {
      magnitud = (this.constanteCoulomb * cargaTotal) / Math.pow(distanciaCentro, 2);
    } else {
      magnitud = (this.constanteCoulomb * cargaTotal * distanciaCentro) / Math.pow(radio, 3);
    }
    
    const angulo = Math.atan2(posicionY - 200, posicionX - 300);
    
    return { magnitud, angulo };
  }

  /**
   * Calcula el campo eléctrico para una distribución específica
   * @param {string} tipoDistribucion - Tipo de distribución ('lineal', 'superficial', 'volumetric')
   * @param {number} densidadCarga - Densidad de carga
   * @param {number} tamaño - Tamaño de la distribución
   * @param {number} posicionX - Posición X del sensor
   * @param {number} posicionY - Posición Y del sensor
   * @returns {Object} Campo eléctrico {magnitud, angulo}
   */
  calcularCampo(tipoDistribucion, densidadCarga, tamaño, posicionX, posicionY) {
    switch (tipoDistribucion) {
      case 'lineal':
        return this.calcularCampoLineal(densidadCarga, tamaño, posicionX, posicionY);
      case 'superficial':
        return this.calcularCampoSuperficial(densidadCarga, tamaño, posicionX, posicionY);
      case 'volumetric':
        return this.calcularCampoVolumetrico(densidadCarga, tamaño, posicionX, posicionY);
      default:
        return { magnitud: 0, angulo: 0 };
    }
  }

  /**
   * Genera vectores de campo eléctrico para una grilla
   * @param {string} tipoDistribucion - Tipo de distribución
   * @param {number} densidadCarga - Densidad de carga
   * @param {number} tamaño - Tamaño de la distribución
   * @param {number} anchoGrilla - Ancho de la grilla
   * @param {number} altoGrilla - Alto de la grilla
   * @param {number} tamañoGrilla - Tamaño de cada celda de la grilla
   * @returns {Array} Array de vectores de campo
   */
  generarVectoresCampo(tipoDistribucion, densidadCarga, tamaño, anchoGrilla, altoGrilla, tamañoGrilla) {
    const vectores = [];

    // Ajustar la densidad de vectores basada en densidad y tamaño para más líneas pero no tantas como antes
    const factorDensidad = Math.max(0.5, Math.min(1.5, densidadCarga / 3)); // Factor entre 0.5 y 1.5
    const factorTamaño = Math.max(0.5, Math.min(1.5, tamaño / 150)); // Factor entre 0.5 y 1.5
    const tamañoGrillaAjustado = tamañoGrilla / (factorDensidad * factorTamaño);

    for (let x = 0; x <= anchoGrilla; x += tamañoGrillaAjustado) {
      for (let y = 0; y <= altoGrilla; y += tamañoGrillaAjustado) {
        const campo = this.calcularCampo(tipoDistribucion, densidadCarga, tamaño, x, y);

        // Verificar si el punto está dentro de la distribución
        if (this.estaDentroDistribucion(tipoDistribucion, x, y, tamaño)) {
          continue;
        }

        // Escalar la magnitud para visualización, ahora dependiente de densidad y tamaño
        const magnitudEscalada = this.escalarMagnitud(campo.magnitud, tipoDistribucion, densidadCarga, tamaño);
        const finX = x + Math.cos(campo.angulo) * magnitudEscalada;
        const finY = y + Math.sin(campo.angulo) * magnitudEscalada;

        vectores.push({
          inicioX: x,
          inicioY: y,
          finX: finX,
          finY: finY,
          magnitud: campo.magnitud,
          angulo: campo.angulo
        });
      }
    }

    return vectores;
  }

  /**
   * Verifica si un punto está dentro de la distribución
   * @param {string} tipoDistribucion - Tipo de distribución
   * @param {number} x - Posición X del punto
   * @param {number} y - Posición Y del punto
   * @param {number} tamaño - Tamaño de la distribución
   * @returns {boolean} Si el punto está dentro de la distribución
   */
  estaDentroDistribucion(tipoDistribucion, x, y, tamaño) {
    switch (tipoDistribucion) {
      case 'lineal':
        // Para lineal, usar el tamaño real de la línea (altura fija de 40)
        const inicioLinea = 300 - tamaño / 2;
        const finLinea = 300 + tamaño / 2;
        return x >= inicioLinea && x <= finLinea && y >= 180 && y <= 220;

      case 'superficial':
        // Para superficial, el tamaño es el lado del cuadrado (ya convertido de área)
        const lado = tamaño;
        const inicioSuperficie = 300 - lado / 2;
        const finSuperficie = 300 + lado / 2;
        return x >= inicioSuperficie && x <= finSuperficie &&
               y >= (200 - lado / 2) && y <= (200 + lado / 2);

      case 'volumetric':
        const distancia = Math.sqrt(Math.pow(x - 300, 2) + Math.pow(y - 200, 2));
        return distancia < tamaño;

      default:
        return false;
    }
  }

  /**
   * Escala la magnitud del campo para visualización
   * @param {number} magnitud - Magnitud original
   * @param {string} tipoDistribucion - Tipo de distribución
   * @param {number} densidadCarga - Densidad de carga
   * @param {number} tamaño - Tamaño de la distribución
   * @returns {number} Magnitud escalada
   */
  escalarMagnitud(magnitud, tipoDistribucion, densidadCarga, tamaño) {
    let divisorEscala = 1e10;
    let maximoEscala = 20;

    switch (tipoDistribucion) {
      case 'lineal':
        divisorEscala = 1e8;
        maximoEscala = 60;
        break;
      case 'superficial':
        divisorEscala = 1e9;
        maximoEscala = 40;
        break;
      case 'volumetric':
        divisorEscala = 1e10;
        maximoEscala = 20;
        break;
    }

    // Ajustar la escala basada en densidad y tamaño para mayor realismo
    const factorDensidad = Math.max(0.1, densidadCarga / 5); // Factor de densidad
    const factorTamaño = Math.max(0.5, tamaño / 100); // Factor de tamaño
    divisorEscala /= (factorDensidad * factorTamaño);
    maximoEscala *= Math.sqrt(factorDensidad * factorTamaño);

    return Math.min(magnitud / divisorEscala, maximoEscala);
  }
}

export default CalculadoraCampo;