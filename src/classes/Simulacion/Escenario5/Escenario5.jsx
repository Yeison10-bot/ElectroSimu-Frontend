import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stage, Layer, Rect as KonvaRect, Arrow as KonvaArrow } from "react-konva";
import apiCiudadService from "../../../services/ApiCiudadService.js";
import Simulacion from "../Simulacion.js";
import Explicacion from "../Contenido/Explicacion/Explicacion.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";


class Escenario5 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      material: "Aire",
      area: 0.05,
      distancia: 0.01,
      combinacion: "individual",
      velocidadReal: false,
      capacitancia: 0,
      Ctotal: 0,
      dipolos: [],
      history: [],
      mensajeActual: null,
      showTip: false,
    };

    this.epsilon0 = 8.85e-12;

    this.materiales = {
      Aire: { k: 1.0, color: "rgba(229,231,235,0.35)", tip: "El aire apenas modifica el campo eléctrico." },
      Vidrio: { k: 4.7, color: "rgba(147,197,253,0.35)", tip: "El vidrio incrementa moderadamente la capacitancia." },
      Teflon: { k: 2.1, color: "rgba(191,219,254,0.35)", tip: "El teflón mejora la estabilidad y reduce las pérdidas." },
      Agua: { k: 80.0, color: "rgba(59,130,246,0.25)", tip: "El agua tiene una permitividad muy alta, por eso la capacitancia aumenta mucho." },
    };

    this.simulacion = new Simulacion(7, "Capacitancia y Materiales", 5, "en_progreso");

    this.explicaciones = {
      inicio: new Explicacion(501, "Explora cómo el área (A), la distancia (d) y el material (κ) afectan la capacitancia: C = κ·ε₀·A / d."),
      material: new Explicacion(502, "Cambiaste el material: observa la polarización y cómo varía la capacitancia."),
      area: new Explicacion(503, "Al aumentar el área, hay más espacio para acumular carga, por eso la capacitancia crece."),
      distancia: new Explicacion(504, "Cuando las placas se separan, las cargas se atraen menos, por eso la capacitancia baja."),
      combinacion: new Explicacion(505, "En serie la capacitancia total disminuye. En paralelo la capacitancia total aumenta."),
      velocidad: new Explicacion(506, "Has cambiado la velocidad de los dipolos: en modo real, se alinean rápidamente con el campo."),
    };

    this.tiempoAnimacion = 0;
    this.animacionId = null;
  }

  componentDidMount() {
    Object.values(this.explicaciones).forEach((exp) =>
      exp.crear_explicacion(exp.getId(), exp.getContenido(), this.simulacion)
    );
    this.calcularCapacitancia();
    this.regenerarDipolos();
    this.iniciarAnimacion();
    this.mostrarTip("inicio");
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animacionId);
  }

  componentDidUpdate(prevProps, prevState) {
    const changed =
      prevState.material !== this.state.material ||
      prevState.area !== this.state.area ||
      prevState.distancia !== this.state.distancia ||
      prevState.combinacion !== this.state.combinacion;

    if (changed) {
      this.calcularCapacitancia();
      this.regenerarDipolos();
    }
  }

  calcularCapacitancia = () => {
    const { material, area, distancia, combinacion } = this.state;
    const k = this.materiales[material].k;
    const d = Math.max(1e-4, distancia);
    const A = Math.max(1e-4, area);
    const C = (k * this.epsilon0 * A) / d;

    const C2 = C * 0.8;
    let Ctotal = C;
    if (combinacion === "serie") Ctotal = 1 / ((1 / C) + (1 / C2));
    if (combinacion === "paralelo") Ctotal = C + C2;

    this.setState((prev) => ({
      capacitancia: C,
      Ctotal,
      history: [...prev.history.slice(-25), { x: d, y: C * 1e6 }],
    }));
  };

  regenerarDipolos = () => {
    const { material } = this.state;
    const k = this.materiales[material].k;
    const dipolos = [];
    for (let i = 0; i < 30; i++) {
      dipolos.push({
        x: 200 + Math.random() * 250,
        y: 100 + Math.random() * 100,
        fase: Math.random() * Math.PI * 2,
        longitud: 12 + Math.random() * 8,
        intensidad: Math.min(2.5, k / 20),
      });
    }
    this.setState({ dipolos });
  };

  iniciarAnimacion = () => {
    const animar = () => {
      const { velocidadReal } = this.state;
      this.tiempoAnimacion += velocidadReal ? 0.04 : 0.0008;
      this.setState((prev) => ({
        dipolos: prev.dipolos.map((d) => {
          const vib = Math.sin(this.tiempoAnimacion + d.fase) * 5;
          return { ...d, vib };
        }),
      }));
      this.animacionId = requestAnimationFrame(animar);
    };
    this.animacionId = requestAnimationFrame(animar);
  };

  mostrarTip = (tipo, extra = "") => {
    let texto = this.explicaciones[tipo]?.getContenido() || "";
    if (tipo === "material" && extra)
      texto = `Has seleccionado ${extra.toLowerCase()}. ${this.materiales[extra].tip}`;
    const mensaje = new Explicacion(Date.now(), texto);
    this.setState({ mensajeActual: mensaje, showTip: true });
    clearTimeout(this.tipHideTimer);
    this.tipHideTimer = setTimeout(() => this.setState({ showTip: false }), 6000);
  };

  handleMaterialChange = (mat) => this.setState({ material: mat }, () => this.mostrarTip("material", mat));
  handleAreaChange = (e) => this.setState({ area: parseFloat(e.target.value) }, () => this.mostrarTip("area"));
  handleDistanciaChange = (e) => this.setState({ distancia: parseFloat(e.target.value) }, () => this.mostrarTip("distancia"));
  handleCombinacionChange = (e) => this.setState({ combinacion: e.target.value }, () => this.mostrarTip("combinacion"));
  handleVelocidadToggle = () => this.setState((prev) => ({ velocidadReal: !prev.velocidadReal }), () => this.mostrarTip("velocidad"));

  // ✅ Botón terminar simulación con ID 7
  handleTerminarSimulacion = async () => {
    try {
      const idSimulacion = 7;
      const user =
        JSON.parse(localStorage.getItem("usuarioElectroSimu")) ||
        JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id_usuario) {
        alert("⚠️ Inicia sesión para guardar tu progreso.");
        return;
      }

      const response = await apiCiudadService.completarSimulacion(idSimulacion, user.id_usuario);
      if (response?.exito || response?.mensaje?.includes("actualizado")) {
        alert("🎉 ¡Simulación completada exitosamente!");
        window.location.href = "/ciudad";
      } else {
        alert("❌ No se pudo completar la simulación.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al registrar el progreso.");
    }
  };

  // 🎨 Render capacitor visual
  renderCapacitor = () => {
    const { material, dipolos, area, distancia } = this.state;
    const colorDiel = this.materiales[material].color;
    const ancho = 400 + area * 1500;
    const baseSeparacion = 60 + distancia * 1200;
    const centroX = 325;
    const centroY = 140;

    const placaSuperiorY = centroY - baseSeparacion / 2;
    const placaInferiorY = centroY + baseSeparacion / 2;
    const dielY = placaSuperiorY + 10;
    const dielAltura = Math.max(20, baseSeparacion - 20);

    return (
      <>
        <KonvaRect x={centroX - ancho / 2} y={placaSuperiorY} width={ancho} height={10} fill="#3B82F6" stroke="#1D4ED8" strokeWidth={2} />
        <KonvaRect x={centroX - ancho / 2} y={placaInferiorY} width={ancho} height={10} fill="#3B82F6" stroke="#1D4ED8" strokeWidth={2} />
        <KonvaRect x={centroX - ancho / 2} y={dielY} width={ancho} height={dielAltura} fill={colorDiel} />
        {dipolos.map((d, i) => {
          const x = centroX - ancho / 2 + Math.random() * ancho;
          const y = placaSuperiorY + 20 + Math.random() * (baseSeparacion - 40);
          const dy = d.longitud + d.vib * d.intensidad;
          return (
            <KonvaArrow
              key={i}
              points={[x, y, x, y + dy]}
              stroke="#F59E0B"
              fill="#F59E0B"
              strokeWidth={1.2}
              pointerLength={6}
              pointerWidth={6}
            />
          );
        })}
      </>
    );
  };

  // 📈 Gráfica
  // 📈 Gráfica visible con tres líneas y leyenda correcta
  renderGrafica = () => {
    const { history } = this.state;
    if (history.length === 0) return null;

    // Datos en microfaradios
    const data = history.map((p) => {
      const C = p.y; // μF
      const Cparalelo = C + C * 0.8;
      const Cserie = 1 / ((1 / C) + (1 / (C * 0.8)));
      return { x: p.x.toFixed(3), C, Cparalelo, Cserie };
    });

    return (
      <div className="w-[85%] h-[180px] mx-auto mt-3 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 25, left: 35, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 9 }}
              label={{
                value: "Distancia (m)",
                position: "insideBottomRight",
                offset: -5,
                fontSize: 10,
              }}
            />
            <YAxis
              tick={{ fontSize: 9 }}
              label={{
                value: "Capacitancia (μF)",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
              domain={[0, "auto"]}
              allowDecimals={true}
              tickFormatter={(val) => val.toExponential(1)}
            />

            {/* Tooltip con nombres y colores correctos */}
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                padding: "4px 6px",
                fontSize: "11px",
              }}
              formatter={(value, name, entry) => {
                let label = "";
                switch (entry.dataKey) {
                  case "C":
                    label = "Individual";
                    break;
                  case "Cparalelo":
                    label = "Paralelo";
                    break;
                  case "Cserie":
                    label = "Serie";
                    break;
                  default:
                    label = entry.dataKey;
                }
                return [`${value.toExponential(3)} μF`, label];
              }}
              labelStyle={{ fontSize: "10px" }}
            />

            {/* ✅ Líneas con colores diferenciados */}
            <Line
              type="monotone"
              dataKey="C"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              name="Individual"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Cparalelo"
              stroke="#16A34A"
              strokeWidth={2}
              dot={false}
              name="Paralelo"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Cserie"
              stroke="#DC2626"
              strokeWidth={2}
              dot={false}
              name="Serie"
              isAnimationActive={false}
            />

            {/* Leyenda inferior centrada */}
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "11px",
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-center text-[11px] text-gray-500 mt-1">
          Variación de Capacitancia (μF) — Individual (azul), Paralelo (verde), Serie (rojo)
        </p>
      </div>
    );
  };


  render() {
    const { material, area, distancia, combinacion, velocidadReal, capacitancia, Ctotal, mensajeActual, showTip } = this.state;

    return (
      <div className="h-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-100 p-2">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Capacitancia y Materiales</h1>
        </div>

        <div className="max-w-7xl mx-auto flex flex-row gap-4 h-[calc(100vh-150px)]">
          {/* PANEL IZQUIERDO */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Tipo de Material</h3>
            <div className="mb-6 space-y-3">
              {Object.keys(this.materiales).map((mat) => (
                <motion.button
                  key={mat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => this.handleMaterialChange(mat)}
                  className={`w-full p-3 rounded-lg font-semibold transition-colors ${material === mat ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-blue-100"}`}
                >
                  {mat}
                </motion.button>
              ))}
            </div>

            <div className="mt-auto p-3 bg-blue-50 rounded-lg text-xs">
              <h4 className="font-semibold text-blue-800 mb-1">Instrucciones:</h4>
              <p className="text-blue-600 mb-3">
                • Cambia el material dieléctrico.<br />• Ajusta el área y la distancia.<br />• Observa cómo varía la capacitancia.<br />• Prueba combinaciones y velocidades.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={this.handleTerminarSimulacion} className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors">
                Terminar Simulación
              </motion.button>
            </div>
          </motion.div>

          {/* PANEL CENTRAL */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-white rounded-xl shadow-lg p-4 flex flex-col justify-between items-center relative min-h-[500px]">
            <AnimatePresence>
              {showTip && mensajeActual && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="absolute top-3 left-3 z-20">
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg shadow-md bg-white/80 border border-gray-200 max-w-[520px]">
                    <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-yellow-500 text-xl">💡</motion.span>
                    <p className="text-gray-700 text-sm leading-snug">{mensajeActual.getContenido()}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-2 border-gray-200 rounded-lg overflow-hidden flex justify-center mt-2">
              <Stage width={600} height={240}>
                <Layer>{this.renderCapacitor()}</Layer>
              </Stage>
            </div>

            {this.renderGrafica()}
          </motion.div>

          {/* PANEL DERECHO */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Controles y Resultados</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Área de placa (m²)</label>
                <input type="range" min="0.01" max="0.1" step="0.005" value={area} onChange={this.handleAreaChange} className="w-full h-2 bg-blue-200 rounded-lg cursor-pointer" />
                <div className="text-center text-blue-600 text-xs font-semibold">{area.toFixed(3)} m²</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Distancia (m)</label>
                <input type="range" min="0.005" max="0.05" step="0.001" value={distancia} onChange={this.handleDistanciaChange} className="w-full h-2 bg-green-200 rounded-lg cursor-pointer" />
                <div className="text-center text-green-600 text-xs font-semibold">{distancia.toFixed(3)} m</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Combinación</label>
                <select value={combinacion} onChange={this.handleCombinacionChange} className="w-full p-2 border border-gray-300 rounded-lg text-xs">
                  <option value="individual">Individual</option>
                  <option value="serie">Serie</option>
                  <option value="paralelo">Paralelo</option>
                </select>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-700 font-medium">Velocidad de dipolos</span>
                <div onClick={this.handleVelocidadToggle} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${velocidadReal ? "bg-blue-500" : "bg-gray-300"}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${velocidadReal ? "translate-x-6" : "translate-x-0"}`}></div>
                </div>
              </div>
            </div>

            <div className="w-full mt-6 p-2 bg-gray-50 rounded-lg text-xs">
              <h3 className="text-base font-semibold mb-1 text-gray-800">Resultados</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacitancia:</span>
                  <span className="font-semibold text-blue-600">{(capacitancia * 1e6).toExponential(3)} μF</span>
                </div>
                {combinacion !== "individual" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">C total:</span>
                    <span className="font-semibold text-green-600">{(Ctotal * 1e6).toExponential(3)} μF</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Ecuación:</span>
                  <span className="font-semibold text-gray-800">C = κ · ε₀ · A / d</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
}

export default Escenario5;
