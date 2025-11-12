import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stage, Layer, Circle, Line, Text, Group, Rect } from 'react-konva';
// Importar las clases OOP
import PosteCarga from '../Contenido/Figuras/PosteCarga.js';
import Cable from '../Contenido/Figuras/Cable.js';
import CalculadoraMultipolo from '../Contenido/CampoElectrico/CalculadoraMultipolo.js';
import apiCiudadService from '../../../services/ApiCiudadService.js';

const Escenario4 = () => {
    // Estados principales
    const [posts, setPosts] = useState([]);
    const [cables, setCables] = useState([]);
    const [distance, setDistance] = useState(100);
    const [chargeMagnitude, setChargeMagnitude] = useState(1);
    const [dipoleDetected, setDipoleDetected] = useState(false);
    const [quadrupoleDetected, setQuadrupoleDetected] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [dipoleMoment, setDipoleMoment] = useState(0);
    const [selectedTool, setSelectedTool] = useState('post');
    const [selectedPost, setSelectedPost] = useState(null);
    const [cableStart, setCableStart] = useState(null);
    const [educationalStep, setEducationalStep] = useState(0);
    
    // Estados para las clases OOP
    const [postesOOP, setPostesOOP] = useState([]);
    const [cablesOOP, setCablesOOP] = useState([]);
    
    // Constantes físicas
    const k = 8.99e9;
    const postRadius = 25;
    const cableWidth = 6;
    
    // Referencias
    const stageRef = useRef();
    
    // Instanciar las clases OOP
    const calculadoraMultipolo = useRef(new CalculadoraMultipolo()).current;
    
    // Función para agregar un poste
    const addPost = (x, y) => {
        const id = Date.now() + Math.random();
        const numeroPoste = posts.length + 1; // Numeración secuencial
        
        // Crear poste usando la clase OOP
        const nuevoPoste = new PosteCarga(id, x, y, 0, postRadius);
        setPostesOOP([...postesOOP, nuevoPoste]);
        
        // Mantener compatibilidad con el estado existente
        const newPost = {
            id: id,
            x: x,
            y: y,
            charge: 0,
            isDragging: false,
            isSelected: false,
            numero: numeroPoste // Agregar numeración
        };
        setPosts([...posts, newPost]);
        setErrorMessage('');
        setEducationalStep(1);
    };
    
    // Función para manejar el arrastre de postes
    const handlePostDrag = (postId, newX, newY) => {
        // Actualizar poste OOP
        const posteOOP = postesOOP.find(p => p.obtenerId() === postId);
        if (posteOOP) {
            posteOOP.establecerPosicion(newX, newY);
            setPostesOOP([...postesOOP]); // Forzar re-render
        }
        
        // Mantener compatibilidad con el estado existente
        setPosts(posts.map(post => 
            post.id === postId 
                ? { ...post, x: newX, y: newY }
                : post
        ));
    };
    
    // Función para seleccionar un poste
    const selectPost = (postId) => {
        if (selectedTool === 'charge') {
            setSelectedPost(postId);
        } else if (selectedTool === 'cable') {
            if (cableStart === null) {
                setCableStart(postId);
            } else if (cableStart !== postId) {
                addCable(cableStart, postId);
                setCableStart(null);
                setEducationalStep(2);
            }
        }
    };
    
    // Función para agregar un cable
    const addCable = (startPostId, endPostId) => {
        const exists = cables.some(cable => 
            (cable.startPostId === startPostId && cable.endPostId === endPostId) ||
            (cable.startPostId === endPostId && cable.endPostId === startPostId)
        );
        
        if (!exists) {
            // Crear cable usando la clase OOP
            const posteInicio = postesOOP.find(p => p.obtenerId() === startPostId);
            const posteFin = postesOOP.find(p => p.obtenerId() === endPostId);
            
            if (posteInicio && posteFin) {
                const nuevoCable = new Cable(
                    Date.now() + Math.random(),
                    posteInicio,
                    posteFin,
                    cableWidth,
                    '#6B7280'
                );
                setCablesOOP([...cablesOOP, nuevoCable]);
            }
            
            // Mantener compatibilidad con el estado existente
            const newCable = {
                id: Date.now() + Math.random(),
                startPostId: startPostId,
                endPostId: endPostId
            };
            setCables([...cables, newCable]);
        }
    };
    
    // Función para asignar carga a un poste
    const assignCharge = (postId, charge) => {
        // Actualizar poste OOP
        const posteOOP = postesOOP.find(p => p.obtenerId() === postId);
        if (posteOOP) {
            posteOOP.establecerCarga(charge);
            setPostesOOP([...postesOOP]); // Forzar re-render
        }
        
        // Mantener compatibilidad con el estado existente
        setPosts(posts.map(post => 
            post.id === postId 
                ? { ...post, charge: charge }
                : post
        ));
        setSelectedPost(null);
        setEducationalStep(3);
    };

    // Función para eliminar un poste
    const deletePost = (postId) => {
        // Eliminar de la clase OOP
        const nuevasPostesOOP = postesOOP.filter(p => p.obtenerId() !== postId);
        setPostesOOP(nuevasPostesOOP);
        
        // Eliminar cables conectados a este poste
        const nuevosCables = cables.filter(cable => 
            cable.startPost !== postId && cable.endPost !== postId
        );
        setCables(nuevosCables);
        
        // Eliminar de la clase OOP de cables
        const nuevosCablesOOP = cablesOOP.filter(cable => 
            cable.obtenerPosteInicio().obtenerId() !== postId && 
            cable.obtenerPosteFin().obtenerId() !== postId
        );
        setCablesOOP(nuevosCablesOOP);
        
        // Eliminar del estado de React
        setPosts(posts.filter(post => post.id !== postId));
        
        // Limpiar selección si el poste eliminado estaba seleccionado
        if (selectedPost === postId) {
            setSelectedPost(null);
        }
        if (cableStart === postId) {
            setCableStart(null);
        }
        
        // Detectar dipolo después de eliminar poste
        detectDipole();
    };
    
    // Detectar dipolo eléctrico usando clases OOP
    const detectDipole = () => {
        // Usar las clases OOP para detectar multipolos
        if (calculadoraMultipolo.detectarDipolo(postesOOP)) {
            setDipoleDetected(true);
            setQuadrupoleDetected(false);
            setErrorMessage('');
            
            // Calcular momento dipolar usando la clase OOP
            const momento = calculadoraMultipolo.calcularMomentoDipolar(postesOOP);
            setDipoleMoment(momento);
        } else if (calculadoraMultipolo.detectarCuadripolo(postesOOP)) {
            setQuadrupoleDetected(true);
            setDipoleDetected(false);
            setErrorMessage('');
        } else {
            setDipoleDetected(false);
            setQuadrupoleDetected(false);
            const postesConCarga = postesOOP.filter(poste => poste.tieneCarga());
            if (postesConCarga.length >= 2) {
                setErrorMessage('Asigna cargas de signos opuestos a los postes para formar un dipolo');
            } else {
                setErrorMessage('');
            }
        }
    };
    
    // Detectar cuadripolo eléctrico
    const detectQuadrupole = () => {
        // La detección ya se maneja en detectDipole usando las clases OOP
        // Esta función se mantiene para compatibilidad
    };
    
    // Actualizar detección cuando cambien los postes
    useEffect(() => {
        detectDipole();
        detectQuadrupole();
    }, [posts, chargeMagnitude]);
    
    // Renderizar postes usando clases OOP
    const renderPosts = () => {
        return posts.map(post => {
            const posteOOP = postesOOP.find(p => p.obtenerId() === post.id);
            if (!posteOOP) {
                return null;
            }
            
            return (
                <Group key={post.id}>
                    <Circle
                        x={posteOOP.obtenerPosicionX()}
                        y={posteOOP.obtenerPosicionY()}
                        radius={posteOOP.obtenerRadio()}
                        fill={posteOOP.obtenerColor()}
                        stroke={posteOOP.obtenerColorBorde()}
                        strokeWidth={selectedPost === post.id || cableStart === post.id ? 4 : 2}
                        draggable
                        onDragMove={(e) => handlePostDrag(post.id, e.target.x(), e.target.y())}
                        onClick={() => selectPost(post.id)}
                    />
                    <Text
                        x={posteOOP.obtenerPosicionX() - 8}
                        y={posteOOP.obtenerPosicionY() - 5}
                        text={post.numero || (posts.indexOf(post) + 1)}
                        fontSize={14}
                        fill="white"
                        fontStyle="bold"
                    />
                </Group>
            );
        });
    };
    
    // Renderizar cables usando clases OOP
    const renderCables = () => {
        return cables.map(cable => {
            const cableOOP = cablesOOP.find(c => c.obtenerId() === cable.id);
            if (!cableOOP) {
                // Fallback: usar datos del cable original
                const startPost = posts.find(p => p.id === cable.startPostId);
                const endPost = posts.find(p => p.id === cable.endPostId);
                if (!startPost || !endPost) return null;
                
                return (
                    <Line
                        key={cable.id}
                        points={[startPost.x, startPost.y, endPost.x, endPost.y]}
                        stroke="#6B7280"
                        strokeWidth={cableWidth}
                        lineCap="round"
                    />
                );
            }
            
            const puntos = cableOOP.obtenerPuntos();
            return (
                <Line
                    key={cable.id}
                    points={puntos}
                    stroke={cableOOP.obtenerColor()}
                    strokeWidth={cableOOP.obtenerGrosor()}
                    lineCap="round"
                />
            );
        });
    };
    
    // Renderizar líneas de campo eléctrico mejoradas usando clases OOP
    const renderFieldLines = () => {
        if (!dipoleDetected && !quadrupoleDetected) return null;
        
        // Usar la clase CalculadoraMultipolo para generar líneas de campo
        const lineasCampo = calculadoraMultipolo.generarLineasCampo(
            postesOOP,
            1, // Usar magnitud fija para las líneas
            32, // Más líneas para cubrir mejor el campo
            200, // Radio mucho más grande para cubrir toda la simulación
            350, // centroX (centro del canvas)
            250  // centroY (centro del canvas)
        );
        
        const vectoresCampo = calculadoraMultipolo.generarVectoresCampo(
            postesOOP,
            1, // Usar magnitud fija para los vectores
            700, // Ancho completo del canvas
            500, // Alto completo del canvas
            12   // Tamaño de grilla más pequeño para más vectores
        );
        
        return [
            ...vectoresCampo.map((vector, index) => (
                <Line
                    key={`vector-${index}`}
                    points={[vector.inicioX, vector.inicioY, vector.finX, vector.finY]}
                    stroke="#8B5CF6"
                    strokeWidth={vector.grosor}
                    opacity={0.3}
                    pointerLength={3}
                    pointerWidth={2}
                    lineCap="round"
                />
            ))
        ];
    };
    
    // Calcular distancia entre postes cargados usando clases OOP
    const calculateDistance = () => {
        return calculadoraMultipolo.calcularDistanciaPromedio(postesOOP);
    };
    
    // Generar información del multipolo
    const getMultipoleInfo = () => {
        const distancia = calculateDistance();

        if (dipoleDetected) {
            return {
                tipo: 'Dipolo',
                momento: dipoleMoment,
                distancia: distancia,
                descripcion: 'Dos cargas de signos opuestos'
            };
        } else if (quadrupoleDetected) {
            return {
                tipo: 'Cuadripolo',
                momento: 0,
                distancia: distancia,
                descripcion: 'Cuatro cargas: dos positivas y dos negativas'
            };
        }

        return null;
    };

    // ✅ Botón terminar simulación con ID 6
    const handleTerminarSimulacion = async () => {
        try {
            const idSimulacion = 6;
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
    
    // Renderizar vector momento dipolar
    const renderDipoleMoment = () => {
        if (!dipoleDetected) return null;
        
        const chargedPosts = postesOOP.filter(poste => poste.tieneCarga());
        if (chargedPosts.length !== 2) return null;
        
        const [poste1, poste2] = chargedPosts;
        const centroX = (poste1.obtenerPosicionX() + poste2.obtenerPosicionX()) / 2;
        const centroY = (poste1.obtenerPosicionY() + poste2.obtenerPosicionY()) / 2;
        
        return (
            <Group>
                <Line
                    points={[centroX - 20, centroY, centroX + 20, centroY]}
                    stroke="#7C3AED"
                    strokeWidth={3}
                    pointerLength={8}
                    pointerWidth={6}
                />
                <Text
                    x={centroX - 30}
                    y={centroY - 20}
                    text="Momento Dipolar"
                    fontSize={12}
                    fill="#7C3AED"
                    fontStyle="bold"
                />
            </Group>
        );
    };
    
    return (
        <div className="h-full overflow-hidden bg-gradient-to-br from-purple-50 to-blue-100 p-2">
            {/* Título */}
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Multipolos eléctricos y campo eléctrico
                </h1>
                <p className="text-gray-600">
                    Arma circuitos, asigna cargas y observa el campo eléctrico
                </p>
            </div>

            {/* Contenedor principal */}
            <div className="max-w-7xl mx-auto flex flex-row gap-4 h-[calc(100vh-150px)]">
                {/* Panel izquierdo: Herramientas */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col"
                >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Herramientas</h3>
                    
                    {/* Selector de herramienta */}
                    <div className="mb-6">
                        <div className="space-y-2">
                            {[
                                { id: 'post', label: 'Agregar Poste', icon: '⚡' },
                                { id: 'charge', label: 'Asignar Carga', icon: '🔋' },
                                { id: 'cable', label: 'Conectar Cable', icon: '🔌' }
                            ].map((tool) => (
                                <motion.button
                                    key={tool.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={`w-full p-3 rounded-lg font-semibold transition-colors ${
                                        selectedTool === tool.id
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 shadow-md hover:bg-purple-100'
                                    }`}
                                >
                                    {tool.icon} {tool.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Controles de asignación de carga */}
                    {selectedPost && (
                        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Asignar Carga al Poste Seleccionado</h4>
                            <div className="space-y-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => assignCharge(selectedPost, chargeMagnitude)}
                                    className="w-full p-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                >
                                    + Carga Positiva
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => assignCharge(selectedPost, -chargeMagnitude)}
                                    className="w-full p-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    - Carga Negativa
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => assignCharge(selectedPost, 0)}
                                    className="w-full p-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    🚫 Sin Carga
                                </motion.button>
                                
                                {/* Botón para eliminar poste */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => deletePost(selectedPost)}
                                    className="w-full p-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    🗑️ Eliminar Poste
                                </motion.button>
                            </div>
                        </div>
                    )}
                    
                    {/* Progreso */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Progreso</h4>
                        <div className="space-y-2">
                            {[
                                { step: 1, text: 'Agregar postes', completed: posts.length > 0 },
                                { step: 2, text: 'Conectar cables', completed: cables.length > 0 },
                                { step: 3, text: 'Asignar cargas', completed: posts.filter(p => p.charge !== 0).length > 0 },
                                { step: 4, text: 'Observar campo', completed: dipoleDetected || quadrupoleDetected }
                            ].map((item) => (
                                <div key={item.step} className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full ${
                                        item.completed ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                    <span className={`text-sm ${
                                        item.completed ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Instrucciones */}
                    <div className="mt-auto p-3 bg-purple-50 rounded-lg text-xs">
                        <h4 className="font-semibold text-purple-800 mb-1">Instrucciones:</h4>
                        <p className="text-purple-600">
                            • Haz clic en el área para agregar postes<br/>
                            • Selecciona un poste y asigna carga<br/>
                            • Conecta postes con cables<br/>
                            • Observa el campo eléctrico generado
                        </p>
                    </div>
                </motion.div>

                {/* Panel central: Simulación */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center"
                >
                    <div 
                        className="border-2 border-gray-200 rounded-lg overflow-hidden cursor-crosshair"
                        onClick={(e) => {
                            if (selectedTool === 'post') {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                addPost(x, y);
                            }
                        }}
                    >
                        <Stage width={600} height={400} ref={stageRef}>
                            <Layer>
                                {/* Postes */}
                                {renderPosts()}
                                
                                {/* Cables */}
                                {renderCables()}
                                
                                {/* Líneas de campo eléctrico */}
                                {renderFieldLines()}
                                
                                {/* Vector momento dipolar */}
                                {renderDipoleMoment()}
                                
                                {/* Etiquetas */}
                                <Text x={10} y={10} text="Área de Simulación" fontSize={14} fill="#374151" />
                                <Text x={10} y={30} text={`Postes: ${posts.length}`} fontSize={12} fill="#6B7280" />
                                <Text x={10} y={50} text={`Cables: ${cables.length}`} fontSize={12} fill="#6B7280" />
                                <Text x={10} y={70} text={`Cargas asignadas: ${posts.filter(p => p.charge !== 0).length}`} fontSize={12} fill="#6B7280" />
                                {dipoleDetected && <Text x={10} y={90} text="Dipolo detectado" fontSize={12} fill="#059669" />}
                                {quadrupoleDetected && <Text x={10} y={90} text="Cuadripolo detectado" fontSize={12} fill="#7C3AED" />}
                                {errorMessage && <Text x={10} y={110} text={errorMessage} fontSize={10} fill="#DC2626" />}
                            </Layer>
                        </Stage>
                    </div>
                </motion.div>

                {/* Panel derecho: Control y Resultados */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-80 bg-white rounded-xl shadow-lg p-4 flex flex-col"
                >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Control y Resultados</h3>
                    
                    {/* Controles */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Controles</h4>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Magnitud de carga: {chargeMagnitude} μC
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="5"
                                step="0.1"
                                value={chargeMagnitude}
                                onChange={(e) => setChargeMagnitude(parseFloat(e.target.value))}
                                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        
                    </div>
                    
                    {/* Resultados */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Resultados</h4>
                        
                        {getMultipoleInfo() && (
                            <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                <div className="font-semibold text-purple-600 mb-2">
                                    {getMultipoleInfo().tipo} Detectado
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Momento:</span>
                                        <span className="font-semibold">
                                            {getMultipoleInfo().momento.toFixed(2)} μC·m
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Distancia:</span>
                                        <span className="font-semibold">
                                            {getMultipoleInfo().distancia.toFixed(1)} cm
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2">
                                        {getMultipoleInfo().descripcion}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    
                    {/* Botones de acción */}
                    <div className="space-y-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setPosts([]);
                                setCables([]);
                                setDipoleDetected(false);
                                setQuadrupoleDetected(false);
                                setErrorMessage('');
                                setPostesOOP([]);
                                setCablesOOP([]);
                                setSelectedPost(null);
                                setCableStart(null);
                            }}
                            className="w-full p-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                            🗑️ Limpiar Todo
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

export default Escenario4;