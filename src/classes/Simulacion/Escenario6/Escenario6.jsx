import React from 'react';
import { Stage, Layer, Circle, Arrow, Line } from 'react-konva';
import anime from "animejs/lib/anime.js";
import { motion, AnimatePresence } from 'framer-motion';
import Explicacion from '../Contenido/Explicacion/Explicacion.js';
import apiCiudadService from '../../../services/ApiCiudadService.js';

class Escenario6 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'poisson',
      chargeDensity: 5,
      boundaryCondition: 'dirichlet',
      potential: [],
      fieldLines: [],
      equipotentials: [],
      mensaje: "💡 Estás en el modo *Ecuación de Poisson*. Usa los controles para ver cómo cambia el potencial eléctrico.",
      showTip: true,
      explicacion: "La ecuación de Poisson relaciona el potencial eléctrico con la densidad de carga. ∇²φ = -ρ/ε₀",
    };

    this.WIDTH = 700;
    this.HEIGHT = 450;
    this.gridSize = 20;
    this.explicacion = new Explicacion(6, "La ecuación de Poisson y Laplace son fundamentales en electromagnetismo. Poisson relaciona el potencial con fuentes de carga, mientras que Laplace describe el potencial en regiones sin carga.");
    this.particlesRef = [];
    this.raf = null;
  }

  componentDidMount() {
    this.initializeGrid();
    this.createFieldLines();
  }

  componentWillUnmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  showTip = (text) => {
    this.setState({ mensaje: text, showTip: true });
    clearTimeout(window.tipTimer);
    window.tipTimer = setTimeout(() => this.setState({ showTip: false }), 5000);
  };

  // 🔹 Inicializar grid de potencial
  initializeGrid = () => {
    const potential = [];
    for (let i = 0; i < this.WIDTH / this.gridSize; i++) {
      potential[i] = [];
      for (let j = 0; j < this.HEIGHT / this.gridSize; j++) {
        const x = i * this.gridSize;
        const y = j * this.gridSize;
        const centerX = this.WIDTH / 2;
        const centerY = this.HEIGHT / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        // Potencial básico basado en distancia (simplificado)
        let phi = 0;
        if (this.state.mode === 'poisson') {
          phi = this.state.chargeDensity * Math.exp(-distance / 100);
        } else {
          phi = Math.sin(x / 50) * Math.cos(y / 50);
        }

        potential[i][j] = phi;
      }
    }
    this.setState({ potential });
  };

  // 🔹 Crear líneas de campo
  createFieldLines = () => {
    const fieldLines = [];
    const numLines = 12;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const startX = this.WIDTH / 2 + Math.cos(angle) * 50;
      const startY = this.HEIGHT / 2 + Math.sin(angle) * 50;

      const points = [];
      let x = startX;
      let y = startY;

      for (let step = 0; step < 50; step++) {
        points.push(x, y);

        // Calcular gradiente (simplificado)
        const gradX = (this.state.mode === 'poisson' ? this.state.chargeDensity : 1) * Math.cos(x / 50);
        const gradY = (this.state.mode === 'poisson' ? this.state.chargeDensity : 1) * Math.sin(y / 50);

        x += gradX * 2;
        y += gradY * 2;

        if (x < 0 || x > this.WIDTH || y < 0 || y > this.HEIGHT) break;
      }

      fieldLines.push({ id: i, points });
    }

    this.setState({ fieldLines });
  };

  // 🔹 Crear líneas equipotenciales
  createEquipotentials = () => {
    const equipotentials = [];
    const numLevels = 8;

    for (let level = 1; level <= numLevels; level++) {
      const phiLevel = level * 0.5;
      const points = [];

      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const r = phiLevel * 100 / (this.state.mode === 'poisson' ? this.state.chargeDensity : 1);
        const x = this.WIDTH / 2 + Math.cos(angle) * r;
        const y = this.HEIGHT / 2 + Math.sin(angle) * r;
        points.push(x, y);
      }

      equipotentials.push({ id: level, points, phi: phiLevel });
    }

    this.setState({ equipotentials });
  };

  // 🔹 Cambios de modo
  handleModeChange = (newMode) => {
    this.setState({ mode: newMode }, () => {
      this.initializeGrid();
      this.createFieldLines();
      this.createEquipotentials();

      if (newMode === "poisson") {
        this.setState({
          explicacion: "Ecuación de Poisson: ∇²φ = -ρ/ε₀. El potencial depende de la densidad de carga presente.",
        });
        this.showTip("💡 En *Poisson*, el potencial varía con la densidad de carga. Aumenta la densidad para ver el efecto.");
      } else if (newMode === "laplace") {
        this.setState({
          explicacion: "Ecuación de Laplace: ∇²φ = 0. El potencial es constante en regiones sin carga.",
        });
        this.showTip("💡 En *Laplace*, no hay fuentes de carga. El potencial sigue un patrón sinusoidal.");
      }
    });
  };

  // 🔹 Cambios en los controles
  handleChargeDensityChange = (newDensity) => {
    this.setState({ chargeDensity: newDensity }, () => {
      this.initializeGrid();
      this.createFieldLines();
      this.createEquipotentials();

      let explicacion;
      if (newDensity < 3)
        explicacion = "Densidad baja → Potencial débil, líneas de campo poco intensas.";
      else if (newDensity < 7)
        explicacion = "Densidad moderada → Potencial equilibrado, campo eléctrico visible.";
      else
        explicacion = "Densidad alta → Potencial fuerte, líneas de campo muy concentradas.";
      this.setState({ explicacion });
    });
  };

  handleBoundaryChange = (newBoundary) => {
    this.setState({ boundaryCondition: newBoundary }, () => {
      this.initializeGrid();
      this.createEquipotentials();

      let explicacion;
      if (newBoundary === 'dirichlet')
        explicacion = "Condición de Dirichlet: Potencial fijo en los bordes (φ = constante).";
      else
        explicacion = "Condición de Neumann: Derivada normal del potencial fija en los bordes (∂φ/∂n = constante).";
      this.setState({ explicacion });
    });
  };

  // 🔹 Render de la simulación
  renderKonvaSimulation = () => {
    const { mode, fieldLines, equipotentials } = this.state;
    return (
      <Stage width={this.WIDTH} height={this.HEIGHT}>
        <Layer>
          {/* Fondo del grid */}
          <Circle x={this.WIDTH / 2} y={this.HEIGHT / 2} radius={150} stroke="#e5e7eb" strokeWidth={1} opacity={0.3} />

          {/* Líneas equipotenciales */}
          {equipotentials.map(eq => (
            <Line
              key={`equip-${eq.id}`}
              points={eq.points}
              stroke="#10b981"
              strokeWidth={2}
              opacity={0.7}
              tension={0.5}
            />
          ))}

          {/* Líneas de campo */}
          {fieldLines.map(line => (
            <Arrow
              key={`field-${line.id}`}
              points={line.points}
              stroke="#3B82F6"
              fill="#3B82F6"
              opacity={0.8}
              pointerLength={8}
              pointerWidth={6}
            />
          ))}

          {/* Centro de carga (solo en Poisson) */}
          {mode === 'poisson' && (
            <Circle
              x={this.WIDTH / 2}
              y={this.HEIGHT / 2}
              radius={8}
              fill="#EF4444"
              opacity={0.9}
            />
          )}
        </Layer>
      </Stage>
    );
  };

  // 🔹 Panel derecho (controles + explicación)
  renderControls = () => {
    const { mode, chargeDensity, boundaryCondition, explicacion } = this.state;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Controles y Resultados</h3>

        {/* Controles */}
        {mode === 'poisson' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Densidad de Carga (ρ)</label>
            <input type="range" min="1" max="10" step="1" value={chargeDensity} onChange={(e) => this.handleChargeDensityChange(parseInt(e.target.value))} className="w-full h-2 bg-red-200 rounded-lg cursor-pointer" />
            <div className="text-center text-red-600 text-xs font-semibold">{chargeDensity}</div>
          </div>
        )}

        {mode === 'laplace' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Condición de Frontera</label>
            <select value={boundaryCondition} onChange={(e) => this.handleBoundaryChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
              <option value="dirichlet">Dirichlet (φ = cte)</option>
              <option value="neumann">Neumann (∂φ/∂n = cte)</option>
            </select>
          </div>
        )}

        {/* Ecuaciones */}
        <div className="mt-4 bg-blue-50 p-3 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm">Ecuación:</h4>
          <div className="text-center">
            {mode === 'poisson' ? (
              <div className="text-lg font-mono text-blue-600">∇²φ = -ρ/ε₀</div>
            ) : (
              <div className="text-lg font-mono text-green-600">∇²φ = 0</div>
            )}
          </div>
        </div>

        {/* Explicación física */}
        <div className="mt-4 bg-gray-50 p-3 rounded-lg border text-xs text-gray-700">
          <h4 className="font-semibold text-gray-800 mb-1">Explicación Física:</h4>
          <p className="leading-snug">{explicacion}</p>
        </div>

        {/* Botón terminar simulación */}
        <div className="mt-auto">
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
    );
  };

  // ✅ Botón terminar simulación con ID 8
  handleTerminarSimulacion = async () => {
    try {
      const idSimulacion = 8;
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

  render() {
    const { mode, mensaje, showTip } = this.state;
    return (
      <div className="h-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-100 p-2">
        {/* Título */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ecuaciones de Poisson y Laplace</h1>
        </div>

        <div className="max-w-7xl mx-auto flex flex-row gap-4 h-[calc(100vh-150px)]">
          {/* Panel izquierdo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Tipo de Ecuación</h3>
            {['poisson', 'laplace'].map(tipo => (
              <motion.button key={tipo} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => this.handleModeChange(tipo)} className={`w-full p-3 rounded-lg font-semibold mb-3 ${mode === tipo ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}>
                {tipo === 'poisson' && 'Ecuación de Poisson'}
                {tipo === 'laplace' && 'Ecuación de Laplace'}
              </motion.button>
            ))}
            <div className="mt-auto p-3 bg-blue-50 rounded-lg text-xs">
              <h4 className="font-semibold text-blue-800 mb-1">Instrucciones:</h4>
              <p className="text-blue-600">
                • Selecciona el tipo de ecuación a estudiar.<br />
                • Usa los controles del panel derecho.<br />
                • Observa las líneas equipotenciales (verde) y de campo (azul).<br />
                • Lee la explicación física y la ecuación matemática.
              </p>
            </div>
          </motion.div>

          {/* Panel central */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center relative">
            <AnimatePresence>
              {showTip && mensaje && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="absolute top-3 left-3 z-20">
                  <div className="flex items-start gap-2 bg-white/90 border border-gray-300 rounded-lg px-3 py-2 shadow-md max-w-[420px]">
                    <span className="text-yellow-500 text-lg">💡</span>
                    <p className="text-gray-700 text-sm leading-snug">{mensaje}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">{this.renderKonvaSimulation()}</div>
          </motion.div>

          {/* Panel derecho */}
          {this.renderControls()}
        </div>
      </div>
    );
  }
}

export default Escenario6;
