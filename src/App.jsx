// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Paper, Typography, Box } from "@mui/material";

// Componentes principales
import InicioElectroSimu from "./classes/Inicio/inicio.jsx";
import CiudadWithNavigate from "./classes/Juego/ciudad.jsx";

import Perfil from "./classes/Gestion/perfil.jsx";
import Teoria from "./classes/Teoria/Teoria.jsx";
import TeoriaDetalle from "./classes/Teoria/TeoriaDetalle.jsx";
import Escenario1 from "./classes/Simulacion/Escenario1/Escenario1.jsx";
import Escenario2 from "./classes/Simulacion/Escenario2/Escenario2.jsx";
import Escenario3 from "./classes/Simulacion/Escenario3/escenario3.jsx";
import Escenario4 from "./classes/Simulacion/Escenario4/escenario4.jsx";
import Escenario5 from "./classes/Simulacion/Escenario5/Escenario5.jsx";
import Escenario6 from "./classes/Simulacion/Escenario6/Escenario6.jsx";
import Login from "./classes/Gestion/Login.jsx";
import Register from "./classes/Gestion/Registro.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";

export default function App() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Register />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <InicioElectroSimu />
              </ProtectedRoute>
            }
          >
            {/* Página principal por defecto */}
            <Route index element={<InicioPage />} />

            {/* Secciones del juego */}
            <Route path="perfil" element={<Perfil />} />
            <Route path="ciudad" element={<CiudadWithNavigate />} />
            <Route path="teoria" element={<Teoria />} />
            <Route path="teoria/:id" element={<TeoriaDetalle />} />

            {/* Escenarios */}
            <Route path="escenario1" element={<Escenario1 />} />
            <Route path="escenario2" element={<Escenario2 />} />
            <Route path="escenario3" element={<Escenario3 />} />
            <Route path="escenario4" element={<Escenario4 />} />
            <Route path="escenario5" element={<Escenario5/>} />
            <Route path="escenario6" element={<Escenario6/>} />


           
          </Route>

          {/* Cualquier ruta desconocida → redirige a inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

/* ---------------------------
   Página de bienvenida simple
--------------------------- */
function InicioPage() {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        overflow: "auto",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          maxWidth: 500,
          width: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={2}>
          Bienvenido a ElectroSimu ⚡
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
          Selecciona "Simulador" para empezar a restaurar la energía.
        </Typography>
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            💡 Explora los diferentes escenarios y aprende los fundamentos de la electricidad
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
