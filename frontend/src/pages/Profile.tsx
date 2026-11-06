import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type ComposerRequest = { id: string; status: string; reason: string | null };

const statusText: Record<string, string> = {
  pending: "Tu solicitud está en revisión.",
  approved: "Tu solicitud fue aprobada.",
  rejected: "Tu solicitud fue rechazada.",
};

function ComposerSection() {
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const requests = useQuery({
    queryKey: ["composer-requests"],
    queryFn: () => api<ComposerRequest[]>("/api/composer-requests/mine"),
  });
  const send = useMutation({
    mutationFn: () => api("/api/composer-requests", { method: "POST", json: { message } }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["composer-requests"] }),
  });
  const latest = requests.data?.[0];

  function submit(event: FormEvent) {
    event.preventDefault();
    send.mutate();
  }

  return (
    <section>
      <h2>Publica tu música</h2>
      {latest && <p className="muted">{statusText[latest.status]}{latest.reason ? ` Motivo: ${latest.reason}` : ""}</p>}
      {latest?.status !== "pending" && (
        <form className="stack-form" onSubmit={submit}>
          <label>
            Cuéntanos sobre tu música
            <textarea rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          {send.error instanceof ApiError && <p className="form-error" role="alert">{send.error.message}</p>}
          <button className="primary" type="submit" disabled={send.isPending}>Solicitar ser Compositor</button>
        </form>
      )}
    </section>
  );
}

export function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.display_name ?? "");
  const save = useMutation({
    mutationFn: () => api("/api/users/me", { method: "PATCH", json: { display_name: name } }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <>
      <h1 className="page-title">Tu perfil</h1>
      <p className="muted">{user?.email}</p>
      <form className="stack-form" onSubmit={submit}>
        <label>
          Tu nombre
          <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {save.isSuccess && <p className="muted" role="status">Nombre guardado.</p>}
        {save.error instanceof ApiError && <p className="form-error" role="alert">{save.error.message}</p>}
        <button className="ghost" type="submit" disabled={save.isPending}>Guardar nombre</button>
      </form>
      {user?.role === "listener" && <ComposerSection />}
      <button className="ghost" type="button" onClick={() => void logout()}>Cerrar sesión</button>
    </>
  );
}
