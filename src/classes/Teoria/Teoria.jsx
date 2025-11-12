import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import ModuloTeoria from "./ModuloTeoria.js";
import Tematica from "./Tematica.js";
import ListaEditable from "./ListaEditable.jsx";

// Helper: asegurar que los inputs sean string
const toInputString = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

export default function Teoria() {
  const modulo = useMemo(() => new ModuloTeoria(), []);
  const navigate = useNavigate();

  // 👇 Obtener usuario y rol
  const user =
    JSON.parse(localStorage.getItem("usuarioElectroSimu")) ||
    JSON.parse(localStorage.getItem("user"));
  const esProfesor = user?.rol === "profesor";

  const [tematicas, setTematicas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Diálogo crear/editar
  const [openDialog, setOpenDialog] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    unidad: "",
    nombre_tema: "",
    contenido_textual: "",
    contenido_visual: "",
    recursos_pdf: "",
    imagenes: "",
    enlaces_externos: "",
  });

  async function cargar() {
    try {
      setCargando(true);
      setError(null);
      const lista = await modulo.cargarTematicas();
      setTematicas(lista);
    } catch (e) {
      setError(e.message || "Error al cargar");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const irADetalle = (item) => {
    navigate(`/teoria/${item.id_tematica}`);
  };

  const abrirDialogCrear = () => {
    if (!esProfesor) return; // 🔒 bloquea a estudiantes
    setEditandoId(null);
    setForm({
      unidad: "",
      nombre_tema: "",
      contenido_textual: "",
      contenido_visual: "",
      recursos_pdf: "",
      imagenes: "",
      enlaces_externos: "",
    });
    setOpenDialog(true);
  };

  const abrirDialogEditar = (item) => {
    if (!esProfesor) return;
    setEditandoId(item.id_tematica);
    setForm({
      unidad: toInputString(item.unidad),
      nombre_tema: toInputString(item.nombre_tema),
      contenido_textual: toInputString(item.contenido_textual),
      contenido_visual: toInputString(item.contenido_visual),
      recursos_pdf: toInputString(item.recursos_pdf),
      imagenes: toInputString(item.imagenes),
      enlaces_externos: toInputString(item.enlaces_externos),
    });
    setOpenDialog(true);
  };

  const cerrarDialog = () => setOpenDialog(false);

  async function guardarDialog() {
    if (!esProfesor) return;
    try {
      validar(form);

      if (editandoId == null) {
        const t = new Tematica(
          null,
          form.nombre_tema,
          form.unidad,
          form.contenido_textual,
          form.contenido_visual,
          form.recursos_pdf,
          form.imagenes,
          form.enlaces_externos
        );
        await t.crear();
      } else {
        const t = new Tematica(
          editandoId,
          form.nombre_tema,
          form.unidad,
          form.contenido_textual,
          form.contenido_visual,
          form.recursos_pdf,
          form.imagenes,
          form.enlaces_externos
        );
        await t.modificar();
      }

      await cargar();
      cerrarDialog();
    } catch (e) {
      alert(e.message || "Error");
    }
  }

  async function eliminar(item) {
    if (!esProfesor) return;
    const ok = window.confirm(`¿Eliminar la temática "${item.nombre_tema}"?`);
    if (!ok) return;
    try {
      const t = new Tematica(item.id_tematica);
      await t.eliminar();
      await cargar();
    } catch (e) {
      alert(e.message || "Error al eliminar");
    }
  }

  function validar(f) {
    if (!f.unidad?.trim()) throw new Error("Unidad es obligatoria");
    if (!f.nombre_tema?.trim()) throw new Error("Nombre del tema es obligatorio");
  }

  return (
    <Box
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
      className="bg-gray-50"
    >
      {/* Header serio y profesional */}
      <div className="mb-6">
        <div className="relative">
          <div className="text-center mb-4">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1f2937",
                letterSpacing: "-0.02em",
                position: "relative",
                display: "inline-block",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: "-50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "30px",
                  height: "2px",
                  background: "linear-gradient(90deg, #3b82f6, #1e40af)",
                  borderRadius: "1px",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: "-50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "30px",
                  height: "2px",
                  background: "linear-gradient(90deg, #1e40af, #3b82f6)",
                  borderRadius: "1px",
                },
              }}
            >
              📚 Módulo de Teoría 📖
            </Typography>
          </div>

          {/* 🔒 Botón solo para profesores */}
          {esProfesor && (
            <div className="absolute top-0 right-0">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={abrirDialogCrear}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 3,
                  py: 1.5,
                  background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                  },
                }}
              >
                ➕ Agregar Temática
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto pr-1">
        {cargando && <Typography className="text-slate-600">Cargando…</Typography>}
        {error && <Typography color="error">Error: {error}</Typography>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tematicas.map((t) => (
            <Card
              key={t.id_tematica}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)",
                  borderColor: "#3b82f6",
                  "&::before": { opacity: 1 },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, #3b82f6, #1e40af)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
              }}
              onClick={(e) => {
                if (e.target.closest?.("button, a, svg, path")) return;
                irADetalle(t);
              }}
            >
              <div className="px-4 pt-4 pb-2">
                <Chip
                  label={t.unidad || "Sin unidad"}
                  size="small"
                  sx={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>

              <CardContent className="flex-1 cursor-pointer select-none">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1e293b",
                    fontSize: "1.1rem",
                    lineHeight: 1.4,
                    mb: 2,
                  }}
                >
                  {t.nombre_tema}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {(t.contenido_textual || "").slice(0, 120)}
                  {t.contenido_textual?.length > 120 ? "…" : ""}
                </Typography>
              </CardContent>

              {/* 🔒 Mostrar edición solo a profesores */}
              <CardActions sx={{ px: 2, py: 2, justifyContent: "space-between" }}>
                <Tooltip title="Ver contenido">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      irADetalle(t);
                    }}
                    sx={{
                      color: "#3b82f6",
                      "&:hover": {
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {esProfesor && (
                  <>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          abrirDialogEditar(t);
                        }}
                        sx={{
                          color: "#059669",
                          "&:hover": {
                            backgroundColor: "#f0fdf4",
                            color: "#047857",
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          eliminar(t);
                        }}
                        sx={{
                          color: "#dc2626",
                          "&:hover": {
                            backgroundColor: "#fef2f2",
                            color: "#b91c1c",
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </CardActions>
            </Card>
          ))}
        </div>
      </div>

      {/* 🔒 Diálogo Crear/Editar solo visible a profesores */}
      {esProfesor && (
        <Dialog open={openDialog} onClose={cerrarDialog} fullWidth maxWidth="sm">
          <DialogTitle>
            {editandoId == null ? "Agregar temática" : "Modificar temática"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Unidad"
              value={form.unidad}
              onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Nombre del tema"
              value={form.nombre_tema}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre_tema: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Contenido textual"
              value={form.contenido_textual}
              onChange={(e) =>
                setForm((f) => ({ ...f, contenido_textual: e.target.value }))
              }
              multiline
              minRows={4}
              fullWidth
            />

            <ListaEditable
              label="Imágenes (agrega varias)"
              value={form.imagenes}
              onChange={(val) => setForm((f) => ({ ...f, imagenes: val }))}
            />
            <ListaEditable
              label="Recursos PDF (agrega varios)"
              value={form.recursos_pdf}
              onChange={(val) => setForm((f) => ({ ...f, recursos_pdf: val }))}
            />
            <ListaEditable
              label="Enlaces externos (agrega varios)"
              value={form.enlaces_externos}
              onChange={(val) =>
                setForm((f) => ({ ...f, enlaces_externos: val }))
              }
            />
            <ListaEditable
              label="Videos (YouTube/Vimeo/MP4)"
              value={form.contenido_visual}
              onChange={(val) =>
                setForm((f) => ({ ...f, contenido_visual: val }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarDialog}>Cancelar</Button>
            <Button variant="contained" onClick={guardarDialog}>
              {editandoId == null ? "Crear" : "Guardar cambios"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
