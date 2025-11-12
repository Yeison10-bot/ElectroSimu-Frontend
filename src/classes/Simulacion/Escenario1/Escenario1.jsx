import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stage,
  Layer,
  Circle as KonvaCircle,
  Rect as KonvaRect,
  Line as KonvaLine,
} from "react-konva";
import FiguraGeometrica from "../Contenido/Figuras/FiguraGeometrica.js";
import SensorCampo from "../Contenido/Figuras/SensorCampo.js";
import CalculadoraCampo from "../Contenido/CampoElectrico/CalculadoraCampo.js";
import apiCiudadService from "../../../services/ApiCiudadService.js";

class Escenario1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      distributionType: "lineal",
      chargeDensity: 1,
      size: 100,
      sensorPosition: { x: 300, y: 200 },
      electricField: { magnitude: 0, angle: 0 },
      isDragging: false,
      loading: false,
      error: null,
      mensaje: null,
      showTip: false,
    };

    this.tipHideTimer = null;
    this.calculadoraCampo = new CalculadoraCampo();
    this.sensor = new SensorCampo(1, 300, 200, 8);
    this.figuras = [];
    this.vectoresCampo = [];
  }

  componentDidMount() {
    this.initializeScenario();
  }

  componentWillUnmount() {
    clearTimeout(this.tipHideTimer);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.distributionType !== this.state.distributionType) {
      this.resetToInitialState();
    }

    if (
      prevState.distributionType !== this.state.distributionType ||
      prevState.chargeDensity !== this.state.chargeDensity ||
      prevState.size !== this.state.size ||
      prevState.sensorPosition !== this.state.sensorPosition
    ) {
      this.calculateElectricField();
    }
  }

  mostrarTip = (texto) => {
    // evita repetir el mismo mensaje dos veces seguidas
    if (this.state.mensaje === texto && this.state.showTip) return;

    this.setState({ mensaje: texto, showTip: true });
    clearTimeout(window.tipTimer);
    window.tipTimer = setTimeout(() => this.setState({ showTip: false }), 5000);
  };


  initializeScenario = () => {
    this.setState(
      {
        chargeDensity: 1,
        size: 100,
        sensorPosition: { x: 300, y: 200 },
      },
      () => {
        this.crearFigurasGeometricas();
        this.calculateElectricField();
      }
    );
  };

  crearFigurasGeometricas = () => {
    const { distributionType, size } = this.state;
    this.figuras = [];

    switch (distributionType) {
      case "lineal":
        const figuraLineal = new FiguraGeometrica(
          1,
          "rectangulo",
          300,
          200,
          size,
          "#3B82F6",
          { altura: 40, colorBorde: "#1D4ED8" }
        );
        this.figuras.push(figuraLineal);
        break;
      case "superficial":
        const lado = size;
        const figuraSuperficial = new FiguraGeometrica(
          2,
          "rectangulo",
          300,
          200,
          lado,
          "#10B981",
          { altura: lado, colorBorde: "#047857" }
        );
        this.figuras.push(figuraSuperficial);
        break;
      case "volumetric":
        const figuraVolumetrica = new FiguraGeometrica(
          3,
          "circulo",
          300,
          200,
          size,
          "#EF4444",
          { colorBorde: "#B91C1C" }
        );
        this.figuras.push(figuraVolumetrica);
        break;
      default:
        break;
    }
  };

  resetToInitialState = () => {
    this.setState({
      chargeDensity: 1,
      size: 100,
      sensorPosition: { x: 300, y: 200 },
    });
  };

  calculateElectricField = () => {
    const { distributionType, chargeDensity, size, sensorPosition } =
      this.state;
    const campo = this.calculadoraCampo.calcularCampo(
      distributionType,
      chargeDensity,
      size,
      sensorPosition.x,
      sensorPosition.y
    );

    this.sensor.establecerMedicionCampo(campo.magnitud, campo.angulo);
    this.vectoresCampo = this.calculadoraCampo.generarVectoresCampo(
      distributionType,
      chargeDensity,
      size,
      600,
      400,
      25
    );

    this.setState({
      electricField: { magnitude: campo.magnitud, angle: campo.angulo },
    });
  };

  handleDistributionChange = (newType) => {
    this.setState({ distributionType: newType }, () => {
      this.crearFigurasGeometricas();
      if (newType === "lineal")
        this.mostrarTip(
          "💡 En una distribución lineal, el campo eléctrico es perpendicular a la línea y decrece con la distancia."
        );
      if (newType === "superficial")
        this.mostrarTip(
          "💡 Una distribución superficial genera un campo casi uniforme cerca de la superficie."
        );
      if (newType === "volumetric")
        this.mostrarTip(
          "💡 En una distribución volumétrica, el campo se propaga radialmente desde el centro."
        );
    });
  };

  handleChargeDensityChange = (newDensity) => {
    this.setState({ chargeDensity: newDensity });
    this.mostrarTip(
      "💡 A mayor densidad de carga, mayor intensidad del campo eléctrico."
    );
  };

  handleSizeChange = (newSize) => {
    this.setState({ size: newSize }, () => {
      this.actualizarTamañoFiguras(newSize);
      const { distributionType } = this.state;
      if (distributionType === "lineal")
        this.mostrarTip(
          "💡 Aumentar la longitud efectiva incrementa el campo cercano a la línea cargada."
        );
      else if (distributionType === "superficial")
        this.mostrarTip(
          "💡 Un área mayor distribuye la carga en una región más grande, afectando el campo."
        );
      else
        this.mostrarTip(
          "💡 Un radio mayor cambia cómo se reparte la carga y el campo dentro/fuera del volumen."
        );
    });
  };

  actualizarTamañoFiguras = (nuevoTamaño) => {
    const { distributionType } = this.state;
    this.figuras.forEach((figura) => {
      if (distributionType === "superficial") {
        figura.establecerTamaño(nuevoTamaño);
        figura.propiedades.altura = nuevoTamaño;
      } else {
        figura.establecerTamaño(nuevoTamaño);
      }
    });
  };

  handleDragMove = (e) => {
    const nuevaPosicion = { x: e.target.x(), y: e.target.y() };
    this.sensor.establecerPosicion(nuevaPosicion.x, nuevaPosicion.y);
    this.setState({ sensorPosition: nuevaPosicion });
    this.mostrarTip(
      "💡 Moviste el sensor: observa cómo cambian dirección y magnitud del campo en ese punto."
    );
  };

  handleDragEnd = (e) => {
    const nuevaPosicion = { x: e.target.x(), y: e.target.y() };
    this.sensor.establecerPosicion(nuevaPosicion.x, nuevaPosicion.y);
    this.sensor.establecerArrastrando(false);
    this.setState({
      isDragging: false,
      sensorPosition: nuevaPosicion,
    });
  };

  handleDragStart = () => {
    this.sensor.establecerArrastrando(true);
    this.setState({ isDragging: true });
  };

  renderDistribution = () => {
    return this.figuras.map((figura) => {
      const x = figura.obtenerPosicionX();
      const y = figura.obtenerPosicionY();
      const tamaño = figura.obtenerTamaño();
      const color = figura.obtenerColor();
      const props = figura.obtenerPropiedades();

      switch (figura.obtenerTipo()) {
        case "rectangulo":
          return (
            <KonvaRect
              key={figura.id}
              x={x - tamaño / 2}
              y={y - (props.altura || tamaño) / 2}
              width={tamaño}
              height={props.altura || tamaño}
              fill={color}
              stroke={props.colorBorde}
              strokeWidth={2}
            />
          );
        case "circulo":
          return (
            <KonvaCircle
              key={figura.id}
              x={x}
              y={y}
              radius={tamaño}
              fill={color}
              stroke={props.colorBorde}
              strokeWidth={2}
            />
          );
        default:
          return null;
      }
    });
  };

  renderFieldVectors = () => {
    const { distributionType, size } = this.state;
    const extraDensity = distributionType === "lineal" ? 15 : 0;
    const vectors = [];
    const sampleStep = 3; // reduce carga, mantiene apariencia

    this.vectoresCampo.forEach((vector, index) => {
      if (index % sampleStep !== 0) return;

      const dx = vector.finX - vector.inicioX;
      const dy = vector.finY - vector.inicioY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const intensity = Math.min(1, Math.log10(length + 1) / 3);
      const baseColor =
        distributionType === "lineal"
          ? `rgba(59,130,246,${0.3 + 0.6 * intensity})`
          : `rgba(139,92,246,${0.4 + 0.5 * intensity})`;

      const angle = Math.atan2(dy, dx);
      const arrowLength = Math.min(length * 0.3, 10);
      const arrowAngle = Math.PI / 6;

      const tipX = vector.finX;
      const tipY = vector.finY;
      const leftX = tipX - arrowLength * Math.cos(angle - arrowAngle);
      const leftY = tipY - arrowLength * Math.sin(angle - arrowAngle);
      const rightX = tipX - arrowLength * Math.cos(angle + arrowAngle);
      const rightY = tipY - arrowLength * Math.sin(angle + arrowAngle);

      // ⚡ Evitar vectores dentro del conductor (rectángulo lineal)
      if (distributionType === "lineal") {
        const centerX = 300;
        const centerY = 200;
        const halfWidth = size / 2; // depende del slider
        const halfHeight = 20; // altura fija del rectángulo (40px total)

        // si el vector está dentro del rectángulo, no dibujar
        const insideRect = (x, y) =>
          x > centerX - halfWidth &&
          x < centerX + halfWidth &&
          y > centerY - halfHeight &&
          y < centerY + halfHeight;

        if (
          insideRect(vector.inicioX, vector.inicioY) ||
          insideRect(vector.finX, vector.finY)
        ) {
          return; // no dibujar flecha dentro de la figura
        }
      }

      // ⚡ Flecha principal
      vectors.push(
        <React.Fragment key={`vector-${index}`}>
          <KonvaLine
            points={[vector.inicioX, vector.inicioY, vector.finX, vector.finY]}
            stroke={baseColor}
            strokeWidth={1.8}
          />
          <KonvaLine
            points={[tipX, tipY, leftX, leftY]}
            stroke={baseColor}
            strokeWidth={1.8}
          />
          <KonvaLine
            points={[tipX, tipY, rightX, rightY]}
            stroke={baseColor}
            strokeWidth={1.8}
          />
        </React.Fragment>
      );

      // 🔵 Líneas extra (para apariencia densa)
      if (distributionType === "lineal" && Math.abs(vector.inicioY - 200) < 80) {
        for (let n = 1; n <= extraDensity; n++) {
          if (n % 2 !== 0) continue;
          const offset = (n - extraDensity / 2) * 5;
          const factor = 1 / (1 + Math.abs(offset) / 30);
          const lineColor = `rgba(37,99,235,${0.15 + 0.4 * factor})`;

          // no dibujar líneas extra dentro del conductor
          const centerX = 300;
          const centerY = 200;
          const halfWidth = size / 2;
          const halfHeight = 20;
          const insideRect = (x, y) =>
            x > centerX - halfWidth &&
            x < centerX + halfWidth &&
            y > centerY - halfHeight &&
            y < centerY + halfHeight;

          const y1 = vector.inicioY + offset;
          const y2 = vector.finY + offset;
          if (
            insideRect(vector.inicioX, y1) ||
            insideRect(vector.finX, y2)
          )
            continue;

          vectors.push(
            <KonvaLine
              key={`extra-${index}-${n}`}
              points={[
                vector.inicioX,
                y1,
                vector.finX,
                y2,
              ]}
              stroke={lineColor}
              strokeWidth={1.2}
            />
          );
        }
      }
    });

    return vectors;
  };




  renderKonvaSimulation = () => {
    const { sensorPosition, electricField } = this.state;

    return (
      <div className="relative">
        <Stage width={600} height={400}>
          <Layer>
            {this.renderDistribution()}
            {this.renderFieldVectors()}
            <KonvaCircle
              x={sensorPosition.x}
              y={sensorPosition.y}
              radius={this.sensor.obtenerRadio()}
              fill={this.sensor.obtenerColor()}
              stroke="#D97706"
              strokeWidth={2}
              draggable
              onDragStart={this.handleDragStart}
              onDragMove={this.handleDragMove}
              onDragEnd={this.handleDragEnd}
            />
            <KonvaLine
              points={[
                sensorPosition.x,
                sensorPosition.y,
                sensorPosition.x + Math.cos(electricField.angle) * 30,
                sensorPosition.y + Math.sin(electricField.angle) * 30,
              ]}
              stroke="#DC2626"
              strokeWidth={3}
              pointerLength={8}
              pointerWidth={8}
            />
          </Layer>
        </Stage>
      </div>
    );
  };

  // 🟢 el resto de tu código (controles, render, API) queda intacto
  handleTerminarSimulacion = async () => {
    try {
      const idSimulacion = 3;
      const user =
        JSON.parse(localStorage.getItem("usuarioElectroSimu")) ||
        JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id_usuario) {
        alert("⚠️ No hay usuario logueado. Inicia sesión para guardar tu progreso.");
        return;
      }

      const response = await apiCiudadService.completarSimulacion(
        idSimulacion,
        user.id_usuario
      );

      if (response?.exito || response?.mensaje?.includes("actualizado")) {
        alert("🎉 ¡Simulación completada exitosamente! Serás redirigido a la ciudad virtual.");
        window.location.href = "/ciudad";
      } else {
        alert("❌ No se pudo completar la simulación. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("❌ Error al terminar simulación:", error);
      alert("Error al registrar el progreso. Revisa la consola para más detalles.");
    }
  };

  renderControls = () => super.renderControls?.() || null;
  render() {
    const { distributionType, showTip, mensaje, chargeDensity, size, electricField, sensorPosition } = this.state;

    return (
      <div className="h-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-100 p-2">
        {/* Título */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Distribuciones continuas de carga y campo eléctrico
          </h1>
        </div>

        {/* Contenedor principal con 3 paneles */}
        <div className="max-w-7xl mx-auto flex flex-row gap-4 h-[calc(100vh-150px)]">
          {/* PANEL IZQUIERDO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Tipo de Distribución</h3>

            {/* Selector de distribución */}
            <div className="mb-6">
              <div className="space-y-3">
                {["lineal", "superficial", "volumetric"].map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => this.handleDistributionChange(type)}
                    className={`w-full p-3 rounded-lg font-semibold transition-colors ${distributionType === type
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 shadow-md hover:bg-blue-100"
                      }`}
                  >
                    {type === "lineal" && "Distribución Lineal"}
                    {type === "superficial" && "Distribución Superficial"}
                    {type === "volumetric" && "Distribución Volumétrica"}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Instrucciones */}
            <div className="mt-auto p-3 bg-blue-50 rounded-lg text-xs">
              <h4 className="font-semibold text-blue-800 mb-1">Instrucciones:</h4>
              <p className="text-blue-600 mb-3">
                • Arrastra el sensor amarillo para medir el campo eléctrico<br />
                • Ajusta los sliders para cambiar la densidad y el tamaño<br />
                • Observa cómo cambian los vectores en tiempo real
              </p>

              {/* Botón Terminar Simulación */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleTerminarSimulacion}
                className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors"
              >
                Terminar Simulación
              </motion.button>
            </div>
          </motion.div>

          {/* PANEL CENTRAL */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center relative"
          >
            {/* 💡 Mensajes explicativos dinámicos */}
            <AnimatePresence>
              {showTip && mensaje && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-3 left-3 z-20"
                >
                  <div className="flex items-start gap-2 bg-white/90 border border-gray-300 rounded-lg px-3 py-2 shadow-md max-w-[420px]">
                    <span className="text-yellow-500 text-lg">💡</span>
                    <p className="text-gray-700 text-sm leading-snug">{mensaje}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              {this.renderKonvaSimulation()}
            </div>
          </motion.div>

          {/* PANEL DERECHO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Controles y Resultados</h3>

            {/* Sliders */}
            <div className="w-full space-y-9 mb-9">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Densidad ({distributionType === 'lineal' ? 'λ' :
                    distributionType === 'superficial' ? 'σ' : 'ρ'})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={chargeDensity}
                  onChange={(e) => this.handleChargeDensityChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-blue-600 text-xs font-semibold">
                  {chargeDensity} μC/m{distributionType === 'lineal' ? '' :
                    distributionType === 'superficial' ? '²' : '³'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {distributionType === 'lineal' ? 'Longitud' :
                    distributionType === 'superficial' ? 'Lado' : 'Radio'}
                </label>
                <input
                  type="range"
                  min="50"
                  max={distributionType === 'volumetric' ? 150 : 300}
                  step="5"
                  value={size}
                  onChange={(e) => this.handleSizeChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-green-600 text-xs font-semibold">
                  {size} {distributionType === 'lineal' ? 'cm' :
                    distributionType === 'superficial' ? 'cm' : 'cm'}
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="w-full mt-6 p-2 bg-gray-50 rounded-lg text-xs">
              <h3 className="text-base font-semibold mb-1 text-gray-800">
                Mediciones del Sensor
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posición:</span>
                  <span className="font-semibold">
                    ({Math.round(sensorPosition.x - 300)}, {Math.round(200 - sensorPosition.y)}) cm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Campo:</span>
                  <span className="font-semibold text-red-600">
                    {electricField.magnitude.toExponential(2)} N/C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dirección:</span>
                  <span className="font-semibold">
                    {Math.round(electricField.angle * 180 / Math.PI)}°
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
}

export default Escenario1;
