import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import type { TapeSummary } from "../api/types";
import { Tape, type TapeColor } from "../components/Tape";

const colors: { id: TapeColor; label: string }[] = [
  { id: "pink", label: "Rosa" },
  { id: "yellow", label: "Amarillo" },
  { id: "teal", label: "Turquesa" },
  { id: "cobalt", label: "Cobalto" },
];

export function TapeCreate() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<TapeColor>("pink");
  const create = useMutation({
    mutationFn: () => api<TapeSummary>("/api/tapes", { method: "POST", json: { title, color } }),
    onSuccess: (tape) => {
      void client.invalidateQueries({ queryKey: ["tapes"] });
      navigate(`/tapes/${tape.id}`, { replace: true });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }

  return (
    <>
      <h1 className="page-title">Crear casete</h1>
      <div className="tape-create">
        <Tape title={title || "Tu casete"} color={color} tilt={-3} />
        <form className="stack-form" onSubmit={submit}>
          <label>
            Nombre
            <input required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <fieldset>
            <legend>Color</legend>
            {colors.map((item) => (
              <label key={item.id}>
                <input type="radio" name="color" checked={color === item.id} onChange={() => setColor(item.id)} /> {item.label}
              </label>
            ))}
          </fieldset>
          {create.error instanceof ApiError && <p className="form-error" role="alert">{create.error.message}</p>}
          <button className="primary" type="submit" disabled={create.isPending}>Crear casete</button>
        </form>
      </div>
    </>
  );
}
