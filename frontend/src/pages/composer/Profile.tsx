import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { Artist } from "../../api/types";

export function ComposerProfile() {
  const profile = useQuery({ queryKey: ["composer-profile"], queryFn: () => api<Artist>("/api/composer/profile") });
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.name);
      setBio(profile.data.bio ?? "");
    }
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () =>
      api("/api/composer/profile", { method: "PUT", json: { name, bio, links: profile.data?.links ?? {} } }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <>
      <h1 className="page-title">Perfil de artista</h1>
      <form className="stack-form" onSubmit={submit}>
        <label>Nombre artístico<input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Biografía<textarea rows={5} maxLength={2000} value={bio} onChange={(e) => setBio(e.target.value)} /></label>
        {save.isSuccess && <p className="muted" role="status">Perfil guardado.</p>}
        {save.error instanceof ApiError && <p className="form-error" role="alert">{save.error.message}</p>}
        <button className="primary" type="submit" disabled={save.isPending}>Guardar</button>
      </form>
    </>
  );
}
