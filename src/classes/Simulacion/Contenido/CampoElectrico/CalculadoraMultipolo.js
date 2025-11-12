/**
 * Clase CalculadoraMultipolo - Calcula campos eléctricos para multipolos
 * Esta clase maneja los cálculos de campo eléctrico para dipolos y cuadripolos
 */
class CalculadoraMultipolo {
  constructor() {
    // Constante de Coulomb
    this.constanteCoulomb = 8.99e9;
  }

  /**
   * Calcula el campo eléctrico de un dipolo en un punto
   * @param {Array} postes - Array de postes con carga
   * @param {number} posicionX - Posición X del punto
   * @param {number} posicionY - Posición Y del punto
   * @param {number} magnitudCarga - Magnitud de la carga
   * @returns {Object} Campo eléctrico {magnitud, angulo, componenteX, componenteY}
   */
  calcularCampoDipolo(postes, posicionX, posicionY, magnitudCarga) {
    let campoX = 0;
    let campoY = 0;

    postes.forEach(poste => {
      if (poste.obtenerCarga() !== 0) {
        const dx = posicionX - poste.obtenerPosicionX();
        const dy = posicionY - poste.obtenerPosicionY();
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        if (distancia > 0) {
          // Usar la carga real del poste en lugar de magnitudCarga
          const cargaReal = poste.obtenerCarga();
          const campoMagnitud = (this.constanteCoulomb * Math.abs(cargaReal)) / (distancia * distancia);
          const campoAngulo = Math.atan2(dy, dx);
          
          // El campo apunta hacia la carga negativa y alejándose de la positiva
          const direccion = cargaReal > 0 ? 1 : -1;
          campoX += Math.cos(campoAngulo) * campoMagnitud * direccion;
          campoY += Math.sin(campoAngulo) * campoMagnitud * direccion;
        }
      }
    });

    const magnitud = Math.sqrt(campoX * campoX + campoY * campoY);
    const angulo = Math.atan2(campoY, campoX);

    return {
      magnitud,
      angulo,
      componenteX: campoX,
      componenteY: campoY
    };
  }

  /**
   * Detecta si hay un dipolo en los postes
   * @param {Array} postes - Array de postes
   * @returns {boolean} Si hay un dipolo
   */
  detectarDipolo(postes) {
    const postesConCarga = postes.filter(poste => poste.tieneCarga());
    if (postesConCarga.length !== 2) return false;
    
    const [poste1, poste2] = postesConCarga;
    return poste1.obtenerCarga() * poste2.obtenerCarga() < 0; // Cargas opuestas
  }

  /**
   * Detecta si hay un cuadripolo en los postes
   * @param {Array} postes - Array de postes
   * @returns {boolean} Si hay un cuadripolo
   */
  detectarCuadripolo(postes) {
    const postesConCarga = postes.filter(poste => poste.tieneCarga());
    if (postesConCarga.length !== 4) return false;
    
    // Verificar que hay 2 cargas positivas y 2 negativas
    const cargasPositivas = postesConCarga.filter(poste => poste.obtenerCarga() > 0).length;
    const cargasNegativas = postesConCarga.filter(poste => poste.obtenerCarga() < 0).length;
    
    return cargasPositivas === 2 && cargasNegativas === 2;
  }

  /**
   * Calcula el momento dipolar
   * @param {Array} postes - Array de postes con carga
   * @returns {number} Momento dipolar
   */
  calcularMomentoDipolar(postes) {
    const postesConCarga = postes.filter(poste => poste.tieneCarga());
    if (postesConCarga.length !== 2) return 0;
    
    const [poste1, poste2] = postesConCarga;
    // Calcular distancia entre los dos postes
    const dx = poste2.obtenerPosicionX() - poste1.obtenerPosicionX();
    const dy = poste2.obtenerPosicionY() - poste1.obtenerPosicionY();
    const distancia = Math.sqrt(dx * dx + dy * dy) / 100; // Convertir cm a metros
    
    // Momento dipolar = carga * distancia
    const carga1 = poste1.obtenerCarga();
    const carga2 = poste2.obtenerCarga();
    const momento = Math.abs(carga1) * distancia; // Usar la magnitud de la carga
    
    return momento;
  }

  /**
   * Genera líneas de campo eléctrico mejoradas
   * @param {Array} postes - Array de postes con carga
   * @param {number} magnitudCarga - Magnitud de la carga
   * @param {number} numLineas - Número de líneas a generar
   * @param {number} radio - Radio de las líneas
   * @param {number} centroX - Centro X
   * @param {number} centroY - Centro Y
   * @returns {Array} Array de líneas de campo
   */
  generarLineasCampo(postes, magnitudCarga, numLineas = 16, radio = 60, centroX = 300, centroY = 200) {
    const lineas = [];
    
    // Calcular la magnitud total de carga de todos los postes
    const cargaTotal = postes.reduce((total, poste) => total + Math.abs(poste.obtenerCarga()), 0);
    const factorCarga = cargaTotal > 0 ? cargaTotal : 1; // Evitar división por cero
    
    // Generar solo las líneas esenciales para mostrar la interacción entre cargas
    const anchoCanvas = 700;
    const altoCanvas = 500;
    
    // Solo generar líneas en puntos estratégicos alrededor de las cargas
    const postesConCarga = postes.filter(poste => poste.obtenerCarga() !== 0);
    
    if (postesConCarga.length >= 2) {
      // Generar líneas desde puntos específicos alrededor de cada carga
      postesConCarga.forEach(poste => {
        const centroX = poste.obtenerPosicionX();
        const centroY = poste.obtenerPosicionY();
        const radio = 60; // Radio alrededor de cada carga
        
        // Solo 8 líneas por carga en direcciones específicas
        for (let i = 0; i < 8; i++) {
          const angulo = (i / 8) * Math.PI * 2;
          const startX = centroX + Math.cos(angulo) * radio;
          const startY = centroY + Math.sin(angulo) * radio;
          
          // Verificar que esté dentro del canvas
          if (startX < 50 || startX > anchoCanvas - 50 || startY < 50 || startY > altoCanvas - 50) continue;
          
          const campo = this.calcularCampoDipolo(postes, startX, startY, magnitudCarga);
          
          if (campo.magnitud > 0.01) { // Solo campos significativos
            const longitud = Math.min(40, Math.max(15, campo.magnitud * 2000 * factorCarga));
            const endX = startX + Math.cos(campo.angulo) * longitud;
            const endY = startY + Math.sin(campo.angulo) * longitud;
            
            lineas.push({
              inicioX: startX,
              inicioY: startY,
              finX: endX,
              finY: endY,
              magnitud: campo.magnitud,
              angulo: campo.angulo,
              color: '#8B5CF6',
              grosor: Math.max(1, Math.min(3, campo.magnitud * 1000 * factorCarga))
            });
          }
        }
      });
      
      // Generar algunas líneas entre las cargas para mostrar la interacción
      if (postesConCarga.length === 2) {
        const [poste1, poste2] = postesConCarga;
        const centroX = (poste1.obtenerPosicionX() + poste2.obtenerPosicionX()) / 2;
        const centroY = (poste1.obtenerPosicionY() + poste2.obtenerPosicionY()) / 2;
        
        // 4 líneas adicionales en el centro para mostrar la interacción
        for (let i = 0; i < 4; i++) {
          const angulo = (i / 4) * Math.PI * 2;
          const startX = centroX + Math.cos(angulo) * 30;
          const startY = centroY + Math.sin(angulo) * 30;
          
          const campo = this.calcularCampoDipolo(postes, startX, startY, magnitudCarga);
          
          if (campo.magnitud > 0.01) {
            const longitud = Math.min(35, Math.max(20, campo.magnitud * 1500 * factorCarga));
            const endX = startX + Math.cos(campo.angulo) * longitud;
            const endY = startY + Math.sin(campo.angulo) * longitud;
            
            lineas.push({
              inicioX: startX,
              inicioY: startY,
              finX: endX,
              finY: endY,
              magnitud: campo.magnitud,
              angulo: campo.angulo,
              color: '#8B5CF6',
              grosor: Math.max(1, Math.min(3, campo.magnitud * 1000 * factorCarga))
            });
          }
        }
      }
    }
    
    return lineas;
  }

  /**
   * Genera vectores de campo en una grilla
   * @param {Array} postes - Array de postes con carga
   * @param {number} magnitudCarga - Magnitud de la carga
   * @param {number} anchoGrilla - Ancho de la grilla
   * @param {number} altoGrilla - Alto de la grilla
   * @param {number} tamañoGrilla - Tamaño de cada celda
   * @returns {Array} Array de vectores de campo
   */
  generarVectoresCampo(postes, magnitudCarga, anchoGrilla = 600, altoGrilla = 400, tamañoGrilla = 20) {
    const vectores = [];
    
    // Calcular la magnitud total de carga de todos los postes
    const cargaTotal = postes.reduce((total, poste) => total + Math.abs(poste.obtenerCarga()), 0);
    const factorCarga = cargaTotal > 0 ? cargaTotal : 1; // Evitar división por cero
    
    // Grilla más densa que cubra todo el canvas
    const espaciado = 12; // Espaciado más pequeño para mejor cobertura
    const margen = 5;     // Margen mínimo para cubrir toda el área
    
    for (let x = margen; x < anchoGrilla - margen; x += espaciado) {
      for (let y = margen; y < altoGrilla - margen; y += espaciado) {
        // Verificar si el punto está muy cerca de algún poste
        let muyCerca = false;
        postes.forEach(poste => {
          const dx = x - poste.obtenerPosicionX();
          const dy = y - poste.obtenerPosicionY();
          const distancia = Math.sqrt(dx * dx + dy * dy);
          if (distancia < 25) muyCerca = true;
        });
        
        if (muyCerca) continue;
        
        const campo = this.calcularCampoDipolo(postes, x, y, magnitudCarga);
        
        if (campo.magnitud > 0.0001) { // Umbral muy bajo para mostrar vectores en todas las áreas
          // Longitud proporcional al campo
          const longitudVector = Math.min(20, Math.max(8, campo.magnitud * 5000 * factorCarga));
          const endX = x + Math.cos(campo.angulo) * longitudVector;
          const endY = y + Math.sin(campo.angulo) * longitudVector;
          
          // Color morado como en Escenario1
          const color = '#8B5CF6';
          
          vectores.push({
            inicioX: x,
            inicioY: y,
            finX: endX,
            finY: endY,
            magnitud: campo.magnitud,
            angulo: campo.angulo,
            color: color,
            grosor: Math.max(0.5, Math.min(1.5, campo.magnitud * 4000 * factorCarga))
          });
        }
      }
    }
    
    return vectores;
  }

  /**
   * Calcula la distancia promedio entre postes cargados
   * @param {Array} postes - Array de postes
   * @returns {number} Distancia promedio
   */
  calcularDistanciaPromedio(postes) {
    const postesConCarga = postes.filter(poste => poste.tieneCarga());
    if (postesConCarga.length < 2) return 0;
    
    let distanciaTotal = 0;
    let contadorPares = 0;
    
    for (let i = 0; i < postesConCarga.length; i++) {
      for (let j = i + 1; j < postesConCarga.length; j++) {
        const distancia = postesConCarga[i].calcularDistancia(postesConCarga[j]);
        distanciaTotal += distancia;
        contadorPares++;
      }
    }
    
    return contadorPares > 0 ? distanciaTotal / contadorPares : 0;
  }
}

export default CalculadoraMultipolo;
