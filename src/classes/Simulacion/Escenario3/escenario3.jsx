import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stage, Layer, Circle, Line, Text, Group } from 'react-konva';
import apiCiudadService from '../../../services/ApiCiudadService.js';



// ✅ Mostrar energía con unidades adaptativas
const displayEnergy = (energyJ) => {
  const absE = Math.abs(energyJ);
  if (absE >= 1e6) return `${(energyJ / 1e6).toFixed(3)} MJ`;
  if (absE >= 1e3) return `${(energyJ / 1e3).toFixed(3)} kJ`;
  return `${energyJ.toFixed(3)} J`;
};

// ✅ Función para mostrar voltaje con unidades adaptativas
const displayVoltage = (voltage) => {
  const absV = Math.abs(voltage);
  if (absV >= 1e6) return `${(voltage / 1e6).toFixed(2)} MV`;
  if (absV >= 1e3) return `${(voltage / 1e3).toFixed(2)} kV`;
  return `${voltage.toFixed(2)} V`;
};

const Escenario3 = () => {
  // Estados principales
  const [charges, setCharges] = useState([]);
  const [voltmeter, setVoltmeter] = useState(null);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [voltage, setVoltage] = useState(0);
  const [mensaje, setMensaje] = useState(null);
  const [showTip, setShowTip] = useState(false);

  // Constantes físicas
  const k = 8.99e9; // Constante de Coulomb
  const chargeRadius = 20;
  const voltmeterRadius = 15;
  const fieldGridSize = 30; // separación entre vectores de campo
  const fieldArrowScale = 12; // más grande, visible en pantalla
  // escala del campo eléctrico

  const stageRef = useRef();

  // 💡 Mostrar mensaje explicativo temporal
  const mostrarTip = (texto) => {
    setMensaje(texto);
    setShowTip(true);
    clearTimeout(window.tipTimer);
    window.tipTimer = setTimeout(() => setShowTip(false), 6000);
  };

  // ⚡ Cálculos físicos
  const calculateEnergyBetweenCharges = (q1, q2, distancePx) => {
    // distancia en px → metros (misma escala que usaste para voltaje)
    const scale = 5e-4;               // 1 px = 5e-4 m  (2000 px ≈ 1 m)
    const r = Math.max(1e-6, distancePx * scale);  // evita r = 0
    return (k * q1 * q2) / r;         // J
  };



  const calculateTotalEnergy = () => {
    let total = 0;
    for (let i = 0; i < charges.length; i++) {
      for (let j = i + 1; j < charges.length; j++) {
        const charge1 = charges[i];
        const charge2 = charges[j];
        const distancePx = Math.sqrt(
          Math.pow(charge1.x - charge2.x, 2) +
          Math.pow(charge1.y - charge2.y, 2)
        );
        total += calculateEnergyBetweenCharges(charge1.q, charge2.q, distancePx);
      }
    }
    return total;
  };


  const calculateVoltage = (x, y) => {
    if (charges.length === 0) return 0;

    const scale = 5e-4; // Escala espacial más realista
    let totalVoltage = 0;

    charges.forEach(charge => {
      const dx = (x - charge.x) * scale;
      const dy = (y - charge.y) * scale;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1e-4) {
        totalVoltage += (k * charge.q) / distance;
      }
    });

    // ✅ Evita que se vea 0 por redondeo o cancelaciones exactas
    const adjustedVoltage = Math.abs(totalVoltage) < 1e3 ? 0 : totalVoltage;
    return adjustedVoltage;
  };




  // 🧲 Campo eléctrico total en un punto
  const calculateElectricField = (x, y) => {
    let Ex = 0, Ey = 0;
    charges.forEach(charge => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2);
      if (r > 10) {
        const E = (k * charge.q) / r2;
        Ex += E * (dx / r);
        Ey += E * (dy / r);
      }
    });
    return { Ex, Ey };
  };

  const renderElectricField = () => {
    const arrows = [];
    for (let x = 50; x <= 550; x += fieldGridSize) {
      for (let y = 50; y <= 350; y += fieldGridSize) {
        const { Ex, Ey } = calculateElectricField(x, y);
        const magnitude = Math.sqrt(Ex * Ex + Ey * Ey);

        if (magnitude > 0) {
          const normX = (Ex / magnitude) * fieldArrowScale;
          const normY = (Ey / magnitude) * fieldArrowScale;

          // 🔹 Escalar color según intensidad
          const intensity = Math.min(1, Math.log10(magnitude + 1) / 7);
          const alpha = 0.25 + 0.5 * intensity;
          const strokeColor = `rgba(99, 102, 241, ${alpha})`; // azul-violeta variable

          arrows.push(
            <Line
              key={`field-${x}-${y}`}
              points={[x, y, x + normX, y + normY]}
              stroke={strokeColor}
              strokeWidth={1 + intensity * 2}
              pointerLength={5}
              pointerWidth={3}
              opacity={0.8}
            />
          );
        }
      }
    }
    return arrows;
  };


  useEffect(() => {
    const energy = calculateTotalEnergy();
    setTotalEnergy(energy);
  }, [charges]);

  useEffect(() => {
    if (voltmeter) {
      const voltageValue = calculateVoltage(voltmeter.x, voltmeter.y);
      setVoltage(voltageValue);
    }
  }, [charges, voltmeter]);

  const addCharge = (x, y, q) => {
    const newCharge = { id: Date.now() + Math.random(), x, y, q, isDragging: false };
    setCharges([...charges, newCharge]);
    mostrarTip(q > 0 ? "💡 Has agregado una carga positiva. Repelerá otras positivas y atraerá negativas." : "💡 Has agregado una carga negativa. Atraerá positivas y repelerá otras negativas.");
  };

  const handleChargeDrag = (chargeId, newX, newY) => {
    setCharges(charges.map(charge => charge.id === chargeId ? { ...charge, x: newX, y: newY } : charge));
    mostrarTip("💡 Moviste una carga. Observa cómo cambian las líneas del campo y las fuerzas.");
  };

  const handleVoltmeterDrag = (newX, newY) => {
    setVoltmeter({ x: newX, y: newY });
    const newVoltage = calculateVoltage(newX, newY);
    setVoltage(newVoltage);
    mostrarTip("💡 Estás midiendo el potencial eléctrico en un nuevo punto del espacio.");
  };

  const renderCharges = () => charges.map(charge => (
    <Group key={charge.id}>
      <Circle
        x={charge.x}
        y={charge.y}
        radius={chargeRadius}
        fill={charge.q > 0 ? "#EF4444" : "#3B82F6"}
        stroke="#000"
        strokeWidth={2}
        draggable
        onDragMove={(e) => handleChargeDrag(charge.id, e.target.x(), e.target.y())}
      />
      <Text x={charge.x - 5} y={charge.y - 5} text={charge.q > 0 ? "+" : ""} fontSize={16} fill="white" fontStyle="bold" />
    </Group>
  ));

  const renderForceArrows = () => {
    const arrows = [];
    if (charges.length < 2) return arrows;
    for (let i = 0; i < charges.length; i++) {
      for (let j = i + 1; j < charges.length; j++) {
        const charge1 = charges[i], charge2 = charges[j];
        const distance = Math.sqrt(Math.pow(charge1.x - charge2.x, 2) + Math.pow(charge1.y - charge2.y, 2));
        if (distance > 0) {
          const midX = (charge1.x + charge2.x) / 2;
          const midY = (charge1.y + charge2.y) / 2;
          const arrowLength = Math.min(40, Math.max(20, distance * 0.3));
          const angle = Math.atan2(charge2.y - charge1.y, charge2.x - charge1.x);
          const endX = midX + Math.cos(angle) * arrowLength;
          const endY = midY + Math.sin(angle) * arrowLength;
          const isAttraction = charge1.q * charge2.q < 0;
          const strokeColor = isAttraction ? "#10B981" : "#EF4444";
          arrows.push(
            <Line
              key={`force-${i}-${j}`}
              points={[midX, midY, endX, endY]}
              stroke={strokeColor}
              strokeWidth={6}
              pointerLength={15}
              pointerWidth={12}
            />
          );
        }
      }
    }
    return arrows;
  };

  const renderVoltmeter = () => {
    if (!voltmeter) return null;
    return (
      <Group>
        <Circle
          x={voltmeter.x}
          y={voltmeter.y}
          radius={voltmeterRadius}
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth={2}
          draggable
          onDragMove={(e) => handleVoltmeterDrag(e.target.x(), e.target.y())}
        />
        <Text
          x={voltmeter.x - 15}
          y={voltmeter.y - 30}
          text={`V = ${displayVoltage(voltage)}`}
          fontSize={12}
          fill={voltage > 0 ? "#EF4444" : "#3B82F6"}
          fontStyle="bold"
        />

      </Group>
    );
  };

  // ✅ Botón terminar simulación con ID 5
  const handleTerminarSimulacion = async () => {
    try {
      const idSimulacion = 5;
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

  const generatePairsTable = () => {
    const pairs = [];
    for (let i = 0; i < charges.length; i++) {
      for (let j = i + 1; j < charges.length; j++) {
        const c1 = charges[i];
        const c2 = charges[j];
        const distancePx = Math.sqrt(
          Math.pow(c1.x - c2.x, 2) +
          Math.pow(c1.y - c2.y, 2)
        );
        const energy = calculateEnergyBetweenCharges(c1.q, c2.q, distancePx);
        pairs.push({ pair: `${i + 1}-${j + 1}`, energy });
      }
    }
    return pairs;
  };


  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-100 p-2">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Potencial eléctrico y energía</h1>
      </div>

      <div className="max-w-7xl mx-auto flex flex-row gap-4 h-[calc(100vh-150px)]">
        {/* PANEL IZQUIERDO */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col overflow-y-auto max-h-[calc(100vh-150px)]">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Resultados</h3>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Energía Total del Sistema</h4>
            <div className="text-2xl font-bold text-blue-600">
              U = {displayEnergy(totalEnergy)}
            </div>
            <div className="text-xs text-gray-600 mt-1">U = Σ k·q₁·q₂ / r</div>
          </div>

          {voltmeter && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Potencial Eléctrico</h4>
              <div className="text-xl font-bold text-green-600">V = {(voltage / 1e6).toFixed(1)} MV</div>
              <div className="text-xs text-gray-600 mt-1">V = Σ k·q / r</div>
            </div>
          )}

          {charges.length >= 2 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Energía por Pares</h4>
              <div className="text-xs">
                {generatePairsTable().map((pair, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span>Par {pair.pair}:</span>
                    <span className="font-semibold">
                      {displayEnergy(pair.energy)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto p-3 bg-yellow-50 rounded-lg text-xs">
            <h4 className="font-semibold text-yellow-800 mb-1">Instrucciones:</h4>
            <p className="text-yellow-700">
              • Arrastra cargas desde el panel derecho<br />
              • Observa las flechas de fuerza y el campo eléctrico<br />
              • Usa el voltímetro para medir potencial<br />
              • Acerca/aleja cargas para ver cambios
            </p>
          </div>
        </motion.div>

        {/* PANEL CENTRAL */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center relative">
          <AnimatePresence>
            {showTip && mensaje && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="absolute top-3 left-3 z-20">
                <div className="flex items-start gap-2 bg-white/90 border border-gray-300 rounded-lg px-3 py-2 shadow-md max-w-[400px]">
                  <span className="text-yellow-500 text-lg">💡</span>
                  <p className="text-gray-700 text-sm leading-snug">{mensaje}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <Stage width={600} height={400} ref={stageRef}>
              <Layer>
                <Circle x={300} y={200} radius={190} fill="#F8FAFC" stroke="#E2E8F0" strokeWidth={2} />
                {renderElectricField()}
                {renderCharges()}
                {renderForceArrows()}
                {renderVoltmeter()}
                <Text x={10} y={10} text="Área de Simulación" fontSize={14} fill="#374151" />
                <Text x={10} y={30} text={`Cargas: ${charges.length}`} fontSize={12} fill="#6B7280" />
                <Text x={10} y={50} text={`Flechas: ${charges.length >= 2 ? 'Sí' : 'No'}`} fontSize={12} fill="#DC2626" />
                {voltmeter && <Text x={10} y={70} text="Voltímetro activo" fontSize={12} fill="#059669" />}
              </Layer>
            </Stage>
          </div>
        </motion.div>

        {/* PANEL DERECHO */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Herramientas</h3>
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Cargas</h4>
            <div className="space-y-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addCharge(150, 150, 1e-6)} className="w-full p-3 bg-red-100 border-2 border-red-300 rounded-lg hover:bg-red-200 transition-colors">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full mr-2 flex items-center justify-center"><span className="text-white font-bold text-sm">+</span></div>
                  <span className="font-semibold">Carga Positiva (+1μC)</span>
                </div>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addCharge(450, 150, -1e-6)} className="w-full p-3 bg-blue-100 border-2 border-blue-300 rounded-lg hover:bg-blue-200 transition-colors">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full mr-2 flex items-center justify-center"><span className="text-white font-bold text-sm">-</span></div>
                  <span className="font-semibold">Carga Negativa (-1μC)</span>
                </div>
              </motion.button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Medición</h4>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setVoltmeter({ x: 300, y: 200 }); mostrarTip("💡 Colocaste el voltímetro. Mide el potencial en diferentes posiciones."); }} className="w-full p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors">
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-500 rounded-full mr-2 flex items-center justify-center"><span className="text-white font-bold text-sm">V</span></div>
                <span className="font-semibold">Voltímetro</span>
              </div>
            </motion.button>
          </div>

          <div className="mt-auto space-y-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setCharges([]); setVoltmeter(null); setTotalEnergy(0); setVoltage(0); mostrarTip("💡 Has reiniciado la simulación."); }} className="w-full p-3 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              <span className="font-semibold">Limpiar Todo</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTerminarSimulacion}
              className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors"
            >
              Terminar Simulación
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Escenario3;
