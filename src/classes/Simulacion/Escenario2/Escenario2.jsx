import React from 'react';
import { Stage, Layer, Circle, Arrow } from 'react-konva';
import anime from "animejs/lib/anime.js";
import { motion, AnimatePresence } from 'framer-motion';
import CalculadoraGauss from '../Contenido/CampoElectrico/CalculadoraGauss.js';
import apiCiudadService from '../../../services/ApiCiudadService.js';

class Escenario2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'flujo',
      angleDeg: 0,
      incoming: 40,
      outgoing: 40,
      intensity: 5,
      arrows: [],
      particles: [],
      mensaje: "💡 Estás en el modo *Flujo*. Usa el control de ángulo para ver cómo cambia el flujo eléctrico.",
      showTip: true,
      explicacion: "Cuando el ángulo entre el campo y la superficie es pequeño, el flujo eléctrico es máximo. Si el ángulo es 90°, el flujo es nulo.",
    };

    this.WIDTH = 700;
    this.HEIGHT = 450;
    this.globe = { x: this.WIDTH / 2, y: this.HEIGHT / 2, r: 100 };
    this.calculadoraGauss = new CalculadoraGauss();
    this.particlesRef = [];
    this.raf = null;
  }

  componentDidMount() {
    this.createArrows();
  }

  componentWillUnmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  showTip = (text) => {
    this.setState({ mensaje: text, showTip: true });
    clearTimeout(window.tipTimer);
    window.tipTimer = setTimeout(() => this.setState({ showTip: false }), 5000);
  };

  // 🔹 Crear las líneas del flujo
  createArrows = () => {
    const N = 20;
    const arrows = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const sx = this.globe.x + Math.cos(t) * 280;
      const sy = this.globe.y + Math.sin(t) * 180;
      arrows.push({ id: i, sx, sy, tx: this.globe.x, ty: this.globe.y, progress: 0 });
    }
    this.setState({ arrows });
  };

  // 🔹 Generar partículas para Divergencia
  emitParticles = () => {
    if (this.raf) cancelAnimationFrame(this.raf);
    const { intensity } = this.state;
    const count = Math.round(intensity * 10);
    this.particlesRef = Array.from({ length: count }).map(() => {
      const ang = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * intensity * 0.6;
      return {
        id: Math.random(),
        x: this.globe.x,
        y: this.globe.y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 150 + Math.random() * 150,
      };
    });
    this.animateParticles();
  };

  animateParticles = () => {
    const step = () => {
      this.particlesRef.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
      });
      this.particlesRef = this.particlesRef.filter(p => p.life > 0);
      this.setState({ particles: [...this.particlesRef] });
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  };

  // 🔹 Cambios de modo
  handleModeChange = (newMode) => {
    this.setState({ mode: newMode }, () => {
      if (newMode === "flujo") {
        this.animateFluxArrows();
        this.setState({
          explicacion: "El flujo eléctrico mide cuántas líneas atraviesan una superficie. Si el ángulo entre el campo y la normal es pequeño, el flujo es grande.",
        });
        this.showTip("💡 En *Flujo*, el ángulo controla cuántas líneas atraviesan la superficie de Gauss.");
      } else if (newMode === "gauss") {
        this.setState({
          explicacion: "Si entran y salen el mismo número de líneas, el campo no cambia dentro del volumen (divergencia = 0). Si salen más, hay una fuente; si entran más, un sumidero.",
        });
        this.showTip("💡 En *Gauss diferencial*, observa el balance entre líneas que entran y salen del volumen.");
      } else if (newMode === "divergencia") {
        this.emitParticles();
        this.setState({
          explicacion: "La divergencia representa cuánta intensidad de campo se origina o desaparece en una región. Si hay muchas líneas saliendo, el campo es divergente.",
        });
        this.showTip("💡 En *Divergencia*, las líneas que salen del centro representan una carga positiva.");
      }
    });
  };

  // 🔹 Cambios en los controles
  handleAngleChange = (newAngle) => {
    let explicacion;
    if (newAngle === 0)
      explicacion = "Ángulo 0° → Flujo máximo positivo. Las líneas son perpendiculares a la superficie.";
    else if (newAngle < 45)
      explicacion = "Ángulo pequeño → Flujo alto. El campo atraviesa casi toda la superficie.";
    else if (newAngle < 90)
      explicacion = "Ángulo grande → Flujo parcial. Menos líneas cruzan la superficie.";
    else
      explicacion = "Ángulo 90° → Flujo nulo. El campo es tangente, no atraviesa la superficie.";

    this.setState({ angleDeg: newAngle, explicacion });
  };

  handleIncomingChange = (newIncoming) => {
    this.setState({ incoming: newIncoming }, this.explainGaussBalance);
  };

  handleOutgoingChange = (newOutgoing) => {
    this.setState({ outgoing: newOutgoing }, this.explainGaussBalance);
  };

  explainGaussBalance = () => {
    const { incoming, outgoing } = this.state;
    let explicacion;
    if (incoming === outgoing)
      explicacion = "Entrando = Saliendo → Divergencia nula. No hay acumulación de carga eléctrica.";
    else if (outgoing > incoming)
      explicacion = "Más líneas saliendo → Divergencia positiva → Fuente de campo (como una carga positiva).";
    else
      explicacion = "Más líneas entrando → Divergencia negativa → Sumidero de campo (como una carga negativa).";
    this.setState({ explicacion });
  };

  handleIntensityChange = (newIntensity) => {
    this.setState({ intensity: newIntensity }, () => {
      this.emitParticles();
      let explicacion;
      if (newIntensity < 4)
        explicacion = "Intensidad baja → Campo débil, pocas líneas salen del centro.";
      else if (newIntensity < 8)
        explicacion = "Campo moderado → Aumenta la divergencia, las líneas se separan más rápido.";
      else
        explicacion = "Campo muy intenso → Alta divergencia, muchas líneas emergen simultáneamente.";
      this.setState({ explicacion });
    });
  };

  animateFluxArrows = () => {
    const { arrows } = this.state;
    const newArrows = arrows.map(a => ({ ...a }));
    anime({
      targets: newArrows,
      progress: [0, 1],
      easing: 'linear',
      duration: 2000,
      loop: true,
      update: () => this.setState({ arrows: [...newArrows] })
    });
  };

  computeArrowProps = (arrow) => {
    const { angleDeg } = this.state;
    const angleRad = (angleDeg * Math.PI) / 180;
    const offset = Math.sin(angleRad) * 60 * (arrow.progress - 0.5);
    const px = arrow.sx + (arrow.tx - arrow.sx) * arrow.progress;
    const py = arrow.sy + (arrow.ty - arrow.sy) * arrow.progress;
    const dx = arrow.tx - arrow.sx;
    const dy = arrow.ty - arrow.sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    return { points: [arrow.sx, arrow.sy, px + nx * offset, py + ny * offset] };
  };

  // 🔹 Render de la simulación
  renderKonvaSimulation = () => {
    const { mode, arrows, incoming, outgoing, particles } = this.state;
    return (
      <Stage width={this.WIDTH} height={this.HEIGHT}>
        <Layer>
          <Circle x={this.globe.x} y={this.globe.y} radius={this.globe.r} stroke="#3B82F6" strokeWidth={2} opacity={0.45} />

          {/* Flujo */}
          {mode === 'flujo' && arrows.map(a => {
            const { points } = this.computeArrowProps(a);
            return <Arrow key={a.id} points={points} stroke="#3B82F6" fill="#3B82F6" opacity={0.9} pointerLength={8} />;
          })}

          {/* Gauss diferencial */}
          {mode === 'gauss' && (
            <>
              {[...Array(incoming)].map((_, i) => {
                const t = (i / incoming) * Math.PI * 2;
                const sx = this.globe.x + Math.cos(t) * (this.globe.r + 100);
                const sy = this.globe.y + Math.sin(t) * (this.globe.r + 100);
                const tx = this.globe.x + Math.cos(t) * (this.globe.r - 5);
                const ty = this.globe.y + Math.sin(t) * (this.globe.r - 5);
                return <Arrow key={`in-${i}`} points={[sx, sy, tx, ty]} stroke="#3B82F6" opacity={0.8} pointerLength={6} />;
              })}
              {[...Array(outgoing)].map((_, i) => {
                const t = (i / outgoing) * Math.PI * 2;
                const sx = this.globe.x + Math.cos(t) * (this.globe.r - 5);
                const sy = this.globe.y + Math.sin(t) * (this.globe.r - 5);
                const tx = this.globe.x + Math.cos(t) * (this.globe.r + 100);
                const ty = this.globe.y + Math.sin(t) * (this.globe.r + 100);
                return <Arrow key={`out-${i}`} points={[sx, sy, tx, ty]} stroke="#facc15" opacity={0.8} pointerLength={6} />;
              })}
            </>
          )}

          {/* Divergencia */}
          {mode === 'divergencia' &&
            particles.map(p => (
              <Circle key={p.id} x={p.x} y={p.y} radius={2.5} fill="#EF4444" opacity={0.9} />
            ))}
        </Layer>
      </Stage>
    );
  };

  // 🔹 Panel derecho (controles + explicación)
  renderControls = () => {
    const { mode, angleDeg, incoming, outgoing, intensity, explicacion } = this.state;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Controles y Resultados</h3>

        {/* Controles */}
        {mode === 'flujo' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ángulo</label>
            <input type="range" min="0" max="90" step="1" value={angleDeg} onChange={(e) => this.handleAngleChange(parseInt(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg cursor-pointer" />
            <div className="text-center text-blue-600 text-xs font-semibold">{angleDeg}°</div>
          </div>
        )}

        {mode === 'gauss' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Entrando</label>
              <input type="range" min="0" max="80" step="1" value={incoming} onChange={(e) => this.handleIncomingChange(parseInt(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg cursor-pointer" />
              <div className="text-center text-blue-600 text-xs font-semibold">{incoming}</div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Saliendo</label>
              <input type="range" min="0" max="80" step="1" value={outgoing} onChange={(e) => this.handleOutgoingChange(parseInt(e.target.value))} className="w-full h-2 bg-green-200 rounded-lg cursor-pointer" />
              <div className="text-center text-green-600 text-xs font-semibold">{outgoing}</div>
            </div>
          </>
        )}

        {mode === 'divergencia' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Intensidad</label>
            <input type="range" min="1" max="10" step="1" value={intensity} onChange={(e) => this.handleIntensityChange(parseInt(e.target.value))} className="w-full h-2 bg-purple-200 rounded-lg cursor-pointer" />
            <div className="text-center text-purple-600 text-xs font-semibold">{intensity}</div>
          </div>
        )}

        {/* Explicación física */}
        <div className="mt-5 bg-gray-50 p-3 rounded-lg border text-xs text-gray-700">
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

  // ✅ Botón terminar simulación con ID 4
  handleTerminarSimulacion = async () => {
    try {
      const idSimulacion = 4;
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ley de Gauss y Divergencia</h1>
        </div>

        <div className="max-w-7xl mx-auto flex flex-row gap-4 h-[calc(100vh-150px)]">
          {/* Panel izquierdo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Tipo de Simulación</h3>
            {['flujo', 'gauss', 'divergencia'].map(tipo => (
              <motion.button key={tipo} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => this.handleModeChange(tipo)} className={`w-full p-3 rounded-lg font-semibold mb-3 ${mode === tipo ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}>
                {tipo === 'flujo' && 'Flujo'}
                {tipo === 'gauss' && 'Gauss diferencial'}
                {tipo === 'divergencia' && 'Divergencia'}
              </motion.button>
            ))}
            <div className="mt-auto p-3 bg-blue-50 rounded-lg text-xs">
              <h4 className="font-semibold text-blue-800 mb-1">Instrucciones:</h4>
              <p className="text-blue-600">
                • Usa los controles del panel derecho según el modo.<br />
                • Observa las líneas o partículas en tiempo real.<br />
                • Lee la explicación física debajo de los resultados.
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

export default Escenario2;
