import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Link as MuiLink,
  Divider,
} from "@mui/material";
import ModuloTeoria from "./ModuloTeoria.js";

export default function TeoriaDetalle() {
  const { id } = useParams();
  const modulo = useMemo(() => new ModuloTeoria(), []);
  const [tema, setTema] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await modulo.cargarTematicas();
        const t = modulo.getTematicaPorId(Number(id));
        if (!t) throw new Error("Tema no encontrado");
        setTema(t);
      } catch (e) {
        setError(e.message || "Error al cargar");
      }
    })();
  }, [id, modulo]);

  if (error)
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  if (!tema)
    return (
      <Box p={2}>
        <Typography>Cargando…</Typography>
      </Box>
    );

  // función para renderizar video embebido
  const renderVideo = (url) => {
    if (!url) return null;
    let embedUrl = url;
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <Box sx={{ mt: 2, width: "100%", aspectRatio: "16/9" }}>
        <iframe
          src={embedUrl}
          title="Video recurso"
          width="100%"
          height="100%"
          allowFullScreen
          style={{ border: "none", borderRadius: "8px" }}
        />
      </Box>
    );
  };

  return (
    <Box
      p={3}
      sx={{
        maxWidth: 1000,
        mx: "auto",
        height: "100vh",       // ocupar todo el alto de la pantalla
        overflowY: "auto",     // scroll vertical
      }}
    >
      {/* Título y unidad */}
      <Typography variant="overline" color="text.secondary" align="center">
        Unidad: {tema.unidad || "N/A"}
      </Typography>
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
        color="primary"
      >
        {tema.nombre_tema}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Contenido textual */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography whiteSpace="pre-wrap">
          {tema.contenido_textual || "Sin contenido"}
        </Typography>
      </Paper>

      {/* Imágenes */}
      {tema.imagenes && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Imágenes
          </Typography>
          {String(tema.imagenes)
            .split(",")
            .map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img.trim()}
                alt={`Imagen ${idx + 1}`}
                sx={{
                  maxWidth: "100%",
                  borderRadius: 2,
                  mb: 2,
                  display: "block",
                  mx: "auto",
                }}
              />
            ))}
        </Box>
      )}

      {/* Video */}
      {renderVideo(tema.contenido_visual)}

      {/* PDFs */}
      {tema.recursos_pdf && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recursos PDF
          </Typography>
          {String(tema.recursos_pdf)
            .split(",")
            .map((pdf, idx) => (
              <MuiLink
                key={idx}
                href={pdf.trim()}
                target="_blank"
                rel="noopener"
                underline="hover"
                sx={{ display: "block", mb: 1 }}
              >
                📄 PDF {idx + 1}
              </MuiLink>
            ))}
        </Box>
      )}

      {/* Enlaces externos */}
      {tema.enlaces_externos && (
        <Box sx={{ mt: 3, mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            Enlaces externos
          </Typography>
          {String(tema.enlaces_externos)
            .split(",")
            .map((link, idx) => (
              <MuiLink
                key={idx}
                href={link.trim()}
                target="_blank"
                rel="noopener"
                underline="hover"
                sx={{ display: "block", mb: 1 }}
              >
                🔗 Recurso {idx + 1}
              </MuiLink>
            ))}
        </Box>
      )}
    </Box>
  );
}
