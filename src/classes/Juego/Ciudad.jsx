import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CiudadVirtual from "./ciudadVirtual";
import CiudadCanvas from "./CiudadCanvas";
import "../../classes/Juego/ciudad.css";

class Ciudad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ciudad: null,
      usuario: null,
      loading: true,
      error: null,
      energia: 0,
    };
  }

  // ============================================================
  // 🔹 Ciclo de vida
  // ============================================================
  async componentDidMount() {
    try {
      const user =
        JSON.parse(localStorage.getItem("usuarioElectroSimu")) ||
        JSON.parse(localStorage.getItem("user")) ||
        null;

      if (!user) {
        this.setState({ error: "No hay usuario logueado", loading: false });
        return;
      }

      this.setState({ usuario: user, loading: true });
      await this.cargarCiudadDesdeBackend(user.id_usuario);
    } catch (error) {
      console.error("❌ Error al montar Ciudad:", error);
      this.setState({ error: "Error al cargar ciudad", loading: false });
    }
  }

  async cargarCiudadDesdeBackend(idUsuario) {
    try {
      console.log("📡 Cargando ciudad virtual para usuario:", idUsuario);
      const ciudad = new CiudadVirtual(1, false);
      const exito = await ciudad.inicializarCiudad(idUsuario);
      if (!exito) throw new Error("Error al inicializar ciudad");

      this.setState({
        ciudad,
        energia: ciudad.getProgreso(),
        loading: false,
      });
    } catch (error) {
      console.error("❌ Error al cargar ciudad virtual:", error);
      this.setState({ error: error.message, loading: false });
    }
  }

  // ============================================================
  // 🎮 Abrir simulación
  // ============================================================
  manejarAbrirSimulacion = (nivel) => {
    try {
      console.log("🎮 Intentando abrir simulación:", nivel);

      if (!nivel || !nivel.escenario) {
        alert("⚠️ Esta simulación no tiene escenario definido.");
        return;
      }

      const slug = nivel.escenario
        .toLowerCase()
        .replace(/\s+/g, "") // quita espacios
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // quita acentos

      const route = `/escenario${nivel.nivel || slug}`;
      console.log("🚀 Navegando a:", route);

      if (this.props.navigate) this.props.navigate(route);
      else window.location.href = route;

      console.log("🚀 Navegando a:", route);

      if (this.props.navigate) this.props.navigate(route);
      else window.location.href = route;
    } catch (error) {
      console.error("🔥 Error al abrir simulación:", error);
    }
  };

  // ============================================================
  // 🧩 Completar nivel (desde la ciudad)
  // ============================================================
  manejarCompletarNivel = async (idSimulacion) => {
    const { ciudad } = this.state;
    if (!ciudad) return;

    console.log("✅ Completando nivel:", idSimulacion);

    const exito = await ciudad.completarNivel(idSimulacion);
    if (exito) {
      const nuevoProgreso = ciudad.getProgreso();
      this.setState({ energia: nuevoProgreso });

      this.mostrarNotificacion(`¡Nivel completado! Progreso: ${nuevoProgreso}%`);

      // 🎉 Si llega a 100%, mostrar mensaje de celebración
      if (nuevoProgreso >= 100) {
        this.setState({ mostrarMensaje: true });
        setTimeout(() => this.setState({ mostrarMensaje: false }), 7000); // opcional: desaparece en 7s
      }
    }

  };

  // ============================================================
  // 🧱 Función estática: llamada desde los escenarios
  // ============================================================
  static async completarNivelDesdeSimulacion(idSimulacion) {
    try {
      const user =
        JSON.parse(localStorage.getItem("usuarioElectroSimu")) ||
        JSON.parse(localStorage.getItem("user"));

      if (!user) {
        console.error("❌ No hay usuario logueado");
        return false;
      }

      console.log(`🏁 Completando nivel desde simulación (ID: ${idSimulacion})`);

      const ciudad = new CiudadVirtual(1, false);
      await ciudad.inicializarCiudad(user.id_usuario);

      const exito = await ciudad.completarNivel(idSimulacion);
      if (exito) {
        ciudad.guardarLocal();
        console.log("✅ Nivel completado correctamente y guardado localmente");
        return true;
      }

      console.warn("⚠️ No se pudo completar el nivel en backend");
      return false;
    } catch (error) {
      console.error("🔥 Error al completar nivel desde simulación:", error);
      return false;
    }
  }

  mostrarNotificacion = (mensaje) => {
    console.log("✨", mensaje);
  };

  // ============================================================
  // 🎨 Render
  // ============================================================
render() {
  const { loading, error, ciudad, energia, mostrarMensaje } = this.state;

  if (loading)
    return <p className="texto-cargando">Cargando ciudad... ⏳</p>;
  if (error)
    return <p className="texto-error">{error} ❌</p>;
  if (!ciudad)
    return <p>No hay datos disponibles. 📭</p>;

  const niveles = ciudad.getNiveles();
  console.log("🧩 Niveles en render:", niveles);

  return (
    <div className={`ciudad-contenedor ${energia >= 100 ? "completa" : ""}`}>
      <CiudadCanvas energia={energia} niveles={niveles} />

      <motion.h1
        className="titulo-ciudad"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ⚡ Ciudad Virtual ⚡
      </motion.h1>

      <motion.div
        className="barra-progreso"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          className="progreso"
          style={{ width: `${energia.toFixed(1)}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${energia.toFixed(1)}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        />
        <span className="porcentaje">{energia.toFixed(0)}%</span>
      </motion.div>

      <motion.div
        className="niveles-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {niveles.map((nivel, i) => {
          const bloqueado = !ciudad.puedeAccederNivel(nivel.id_simulacion);

          return (
            <motion.div
              key={nivel.id_simulacion}
              className={`nivel-card ${
                nivel.completado ? "completado" : ""
              } ${bloqueado ? "bloqueado" : ""}`}
            >
              <div className="nivel-numero">{i + 1}</div>
              <h3>{nivel.nombre}</h3>
              <p>
                {nivel.completado
                  ? "✅ Completado"
                  : bloqueado
                  ? "🔒 Bloqueado"
                  : "⏳ Pendiente"}
              </p>

              {!bloqueado && (
                <button
                  className="btn-jugar"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("🟢 Click en botón Jugar:", nivel);
                    this.manejarAbrirSimulacion(nivel);
                  }}
                >
                  {nivel.completado ? "Ver de nuevo" : "Jugar"}
                </button>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ⚡ Mensaje cuando se completa el 100% */}
      {mostrarMensaje && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="mensaje-ciudad-restaurada"
        >
          ⚡ ¡Has restaurado toda la energía de la ciudad! ⚡
        </motion.div>
      )}
    </div>
  );
}
}

// ✅ Exporta ambos: la clase original y el componente con navigate
export { Ciudad };
export default function CiudadWithNavigate(props) {
  const navigate = useNavigate();
  return <Ciudad {...props} navigate={navigate} />;
}
