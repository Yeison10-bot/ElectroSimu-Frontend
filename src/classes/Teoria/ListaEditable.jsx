// src/components/ListaEditable.jsx
import { useState } from "react";
import { Stack, Chip, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function ListaEditable({ label, value = "", onChange }) {
  const [input, setInput] = useState("");
  const items = (typeof value === "string" ? value.split(",") : value)
    .map(s => String(s).trim())
    .filter(Boolean);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    const nuevo = [...items, v].join(", ");
    onChange(nuevo);
    setInput("");
  };

  const remove = (i) => {
    const nuevo = items.filter((_, idx) => idx !== i).join(", ");
    onChange(nuevo);
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <TextField
          label={label}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          placeholder="Pega una URL y presiona +"
        />
        <IconButton color="primary" onClick={add}>
          <AddIcon />
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {items.map((it, idx) => (
          <Chip key={idx} label={it} onDelete={() => remove(idx)} />
        ))}
      </Stack>
    </Stack>
  );
}
