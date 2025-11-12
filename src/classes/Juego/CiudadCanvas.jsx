import React, { useRef, useEffect } from "react";

/**
 * 🎨 CiudadCanvas - Vista Isométrica 2D Interactiva
 * Renderiza una ciudad en perspectiva isométrica con edificios,
 * luces dinámicas y efectos según el nivel de energía.
 */
const CiudadCanvas = ({ energia = 0, niveles = [] }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId = null;

    // Configuración
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = 400);

    // Almacenamiento de edificios
    let edificios = [];
    let lucesParpadeo = {};

    // 🔹 Configuración para perspectiva isométrica
    const setup = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = 400;
      generarCiudad();
    };

    // 🔹 Calcular iluminación de edificio según su posición y niveles completados
    const calcularIluminacionEdificio = (edificio, index) => {
      const totalEdificios = edificios.length;
      const numNiveles = niveles.length || 1;
      const porcionPorNivel = totalEdificios / numNiveles;
      
      // Determinar qué nivel corresponde a este edificio
      const nivelIndex = Math.floor(index / porcionPorNivel);
      
      // Obtener si ese nivel está completado
      if (niveles[nivelIndex]) {
        return niveles[nivelIndex].completado ? 1 : 0;
      }
      
      // Fallback a energía general si no hay niveles definidos
      return energia / 100;
    };

    // 🔹 Generar ciudad isométrica
    const generarCiudad = () => {
      edificios = [];
      const filas = 5;
      const columnas = Math.floor(width / 120);
      let indexGlobal = 0;

      for (let fila = 0; fila < filas; fila++) {
        for (let col = 0; col < columnas; col++) {
          const tipo = Math.random();
          let edificio = {
            x: col * 120 - fila * 60,
            y: 350 - fila * 40,
            ancho: tipo > 0.7 ? 80 : tipo > 0.4 ? 60 : 50,
            alto: tipo > 0.7 ? 120 : tipo > 0.4 ? 80 : 60,
            tipo: tipo > 0.8 ? 'industrial' : tipo > 0.5 ? 'residencial' : 'comercial',
            ventanas: [],
            color: obtenerColorEdificio(tipo),
            indexGlobal: indexGlobal // Guardar índice global
          };

          // Generar ventanas con iluminación inicial
          const numVentanas = Math.floor(edificio.alto / 25) * Math.floor(edificio.ancho / 20);
          for (let v = 0; v < numVentanas; v++) {
            edificio.ventanas.push(Math.random() < energia / 100);
            lucesParpadeo[`${col}-${fila}-${v}`] = Math.random() * 1000;
          }

          edificios.push(edificio);
          indexGlobal++;
        }
      }
    };

    // 🔹 Obtener color según tipo de edificio
    const obtenerColorEdificio = (tipo) => {
      if (tipo > 0.8) return { r: 200, g: 150, b: 150 }; // Rosa industrial
      if (tipo > 0.6) return { r: 150, g: 150, b: 180 }; // Azul
      if (tipo > 0.4) return { r: 180, g: 180, b: 150 }; // Amarillo
      return { r: 150, g: 160, b: 140 }; // Gris
    };

    // 🔹 Dibujar cielo con gradiente
    const dibujarCielo = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#1a0a2e");
      grad.addColorStop(0.5, "#16213e");
      grad.addColorStop(1, "#0f1419");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    // 🔹 Dibujar montañas al fondo
    const dibujarMontañas = () => {
      ctx.fillStyle = "#2a1a3a";
      
      // Montaña izquierda
      ctx.beginPath();
      ctx.moveTo(0, height * 0.6);
      ctx.lineTo(width * 0.2, height * 0.3);
      ctx.lineTo(width * 0.35, height * 0.5);
      ctx.lineTo(width * 0.3, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Montaña derecha
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.5);
      ctx.lineTo(width * 0.7, height * 0.25);
      ctx.lineTo(width * 0.85, height * 0.45);
      ctx.lineTo(width * 1, height);
      ctx.lineTo(width * 0.5, height);
      ctx.closePath();
      ctx.fill();
    };

    // 🔹 Dibujar edificio en perspectiva isométrica
    const dibujarEdificio = (edif, time) => {
      const { x, y, ancho, alto, color, ventanas, indexGlobal } = edif;
      
      // 🔹 Calcular iluminación según nivel completado
      const totalEdificios = edificios.length;
      const numNiveles = niveles.length || 1;
      const porcionPorNivel = totalEdificios / numNiveles;
      const nivelIndex = Math.floor(indexGlobal / porcionPorNivel);
      const nivelCompletado = niveles[nivelIndex]?.completado || false;
      
      // Si está completado, usar brillo alto, si no usar muy bajo (casi apagado)
      const factorBrillo = nivelCompletado ? 1 : 0.05;
      const brillo = 0.2 + factorBrillo * 0.8;

      // Sombra del edificio
      ctx.fillStyle = nivelCompletado ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.moveTo(x, height - 5);
      ctx.lineTo(x - ancho * 0.3, height - 5);
      ctx.lineTo(x - ancho * 0.3 + ancho, height - 5);
      ctx.lineTo(x + ancho, height - 5);
      ctx.closePath();
      ctx.fill();

      // Cara frontal del edificio
      ctx.fillStyle = `rgb(
        ${Math.floor(color.r * brillo)}, 
        ${Math.floor(color.g * brillo)}, 
        ${Math.floor(color.b * brillo)}
      )`;
      ctx.fillRect(x, y - alto, ancho, alto);

      // Línea de separación isométrica
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * brillo})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - ancho * 0.3, y - alto);
      ctx.lineTo(x, y - alto);
      ctx.lineTo(x, height - 5);
      ctx.lineTo(x - ancho * 0.3, height - 5);
      ctx.closePath();
      ctx.stroke();

      // Cara lateral (isométrica)
      ctx.fillStyle = `rgb(
        ${Math.floor(color.r * brillo * 0.7)}, 
        ${Math.floor(color.g * brillo * 0.7)}, 
        ${Math.floor(color.b * brillo * 0.7)}
      )`;
      ctx.beginPath();
      ctx.moveTo(x - ancho * 0.3, y - alto);
      ctx.lineTo(x, y - alto);
      ctx.lineTo(x, height - 5);
      ctx.lineTo(x - ancho * 0.3, height - 5);
      ctx.closePath();
      ctx.fill();

      // Dibujar ventanas
      const ventanasPorFila = 3;
      const ventanasPorColumna = Math.floor(alto / 25);
      const anchoVentana = ancho / (ventanasPorFila + 2);
      const altoVentana = 15;

      ventanas.forEach((encendida, idx) => {
        const fila = Math.floor(idx / ventanasPorFila);
        const col = idx % ventanasPorFila;
        if (fila >= ventanasPorColumna) return;

        const ventanaX = x + (col + 1) * anchoVentana;
        const ventanaY = y - alto + fila * 20 + 5;

        // Efecto parpadeo solo si el nivel está completado
        const key = `${indexGlobal}-${idx}`;
        const parpadeo = Math.sin(time * 0.002 + lucesParpadeo[key] || 0) * 0.3 + 0.7;
        
        // La ventana solo se ilumina si el nivel está completado
        if (nivelCompletado) {
          const luminosidad = parpadeo;
          ctx.fillStyle = `rgba(255, 240, 100, ${0.8 * luminosidad})`;
        } else {
          // Ventanas completamente apagadas (oscuro)
          ctx.fillStyle = `rgba(10, 10, 10, 0.95)`;
        }
        ctx.fillRect(ventanaX, ventanaY, anchoVentana - 2, altoVentana);
      });
    };

    // 🔹 Dibujar luces de calle
    const dibujarLucesCalle = (time) => {
      const numLuces = Math.floor(width / 150);
      const nivelesCompletados = niveles.filter(n => n.completado).length;
      const hayNivelesCompletados = nivelesCompletados > 0;
      
      for (let i = 0; i < numLuces; i++) {
        const x = i * 150 + 50;
        const parpadeo = Math.sin(time * 0.001 + i) * 0.5 + 0.5;

        // Solo encender luces si hay al menos un nivel completado
        if (hayNivelesCompletados) {
          // Poste
          ctx.strokeStyle = "#444";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, height - 10);
          ctx.lineTo(x, height - 40);
          ctx.stroke();

          // Luz
          ctx.fillStyle = `rgba(255, 255, 200, ${0.9 * parpadeo})`;
          ctx.beginPath();
          ctx.arc(x, height - 40, 4, 0, Math.PI * 2);
          ctx.fill();

          // Halo (más brillante cuando más niveles completados)
          const intensidadLuz = Math.min(nivelesCompletados / niveles.length, 1);
          const haloGrad = ctx.createRadialGradient(x, height - 40, 0, x, height - 40, 20);
          haloGrad.addColorStop(0, `rgba(255, 255, 200, ${0.5 * parpadeo * intensidadLuz})`);
          haloGrad.addColorStop(1, "rgba(255, 255, 200, 0)");
          ctx.fillStyle = haloGrad;
          ctx.fillRect(x - 30, height - 60, 60, 30);
        }
      }
    };

    // 🔹 Dibujar efectos de energía
    const dibujarEfectosEnergia = (time) => {
      const nivelesCompletados = niveles.filter(n => n.completado).length;
      const totalNiveles = niveles.length || 1;
      const porcentajeCompletado = (nivelesCompletados / totalNiveles) * 100;
      
      // Solo mostrar efectos si hay niveles completados
      if (porcentajeCompletado > 0) {
        const intensidad = porcentajeCompletado / 100;
        const numParticulas = Math.floor(2 + intensidad * 8);
        
        for (let i = 0; i < numParticulas; i++) {
          const x = Math.random() * width;
          const y = height - 50 - Math.random() * 100;
          const alpha = 0.4 + Math.random() * 0.5 * intensidad;
          
          ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // 🔹 Loop de animación
    const animar = (time) => {
      ctx.clearRect(0, 0, width, height);
      
      dibujarCielo();
      dibujarMontañas();
      dibujarLucesCalle(time);
      dibujarEfectosEnergia(time);
      
      edificios.forEach((edif) => dibujarEdificio(edif, time));
      
      animationId = requestAnimationFrame(animar);
    };

    // Inicializar
    setup();
    animar(0);

    // Event listener para redimensionar
    const handleResize = () => {
      setup();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [energia, niveles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "400px",
        zIndex: 1,
      }}
    />
  );
};

export default CiudadCanvas;
