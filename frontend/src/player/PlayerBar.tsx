import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Icon } from "../components/Icon";
import { Tape } from "../components/Tape";
import { clock } from "./format";
import { usePlayer } from "./PlayerProvider";
import { Reels } from "./Reels";

const repeatLabels = { off: "Repetir: apagado", all: "Repetir: toda la cola", one: "Repetir: esta pista" } as const;
const nextRepeat = { off: "all", all: "one", one: "off" } as const;

export function useFavorite(songId: string | undefined) {
  const client = useQueryClient();
  const ids = useQuery({ queryKey: ["favorite-ids"], queryFn: () => api<string[]>("/api/favorites/ids") });
  const isFavorite = !!songId && !!ids.data?.includes(songId);
  const toggle = useMutation({
    mutationFn: () => api(`/api/favorites/${songId}`, { method: isFavorite ? "DELETE" : "PUT" }),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ["favorite-ids"] });
      void client.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
  return { isFavorite, toggle: () => toggle.mutate(), busy: toggle.isPending };
}

function Transport() {
  const { current, isPlaying, shuffle, repeat, toggle, next, prev, setShuffle, setRepeat } = usePlayer();
  return (
    <div className="transport">
      <button
        className={shuffle ? "plain on" : "plain"}
        type="button"
        aria-label="Aleatorio"
        aria-pressed={shuffle}
        onClick={() => setShuffle(!shuffle)}
      >
        <Icon name="shuffle" />
      </button>
      <button className="plain" type="button" aria-label="Anterior" onClick={prev} disabled={!current}>
        <Icon name="prev" />
      </button>
      <button className="play" type="button" aria-label={isPlaying ? "Pausar" : "Reproducir"} onClick={toggle} disabled={!current}>
        <Icon name={isPlaying ? "pause" : "play"} filled={!isPlaying} />
      </button>
      <button className="plain" type="button" aria-label="Siguiente" onClick={next} disabled={!current}>
        <Icon name="next" />
      </button>
      <button
        className={repeat === "off" ? "plain" : "plain on"}
        type="button"
        aria-label={repeatLabels[repeat]}
        onClick={() => setRepeat(nextRepeat[repeat])}
      >
        <Icon name="repeat" />
        {repeat === "one" && <em className="repeat-one">1</em>}
      </button>
    </div>
  );
}

function Seek() {
  const { current, position, duration, isPlaying, seek } = usePlayer();
  const total = duration || 0;
  const progress = total ? Math.min(1, position / total) : 0;
  return (
    <div className="seek">
      <span>{clock(position)}</span>
      <Reels progress={progress} spinning={isPlaying}>
        <input
          className="band"
          type="range"
          min={0}
          max={total || 1}
          step={1}
          value={Math.min(position, total || 1)}
          disabled={!current}
          aria-label="Posición en la pista"
          aria-valuetext={`${clock(position)} de ${clock(total)}`}
          style={{ "--fill": `${progress * 100}%` } as React.CSSProperties}
          onChange={(event) => seek(Number(event.target.value))}
        />
      </Reels>
      <span>{clock(total)}</span>
    </div>
  );
}

function Popover({ label, icon, active, children }: { label: string; icon: "note" | "queue"; active?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="pop" ref={root}>
      <button
        className={active || open ? "plain on" : "plain"}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon name={icon} />
      </button>
      {open && <div className="pop-body" role="group" aria-label={label}>{children}</div>}
    </div>
  );
}

function QueueList() {
  const { queue, jump } = usePlayer();
  if (!queue.length) return <p className="pop-empty">No hay más pistas en la cola.</p>;
  return (
    <ol className="queue-list">
      {queue.map((song, offset) => (
        <li key={`${song.id}-${offset}`}>
          <button type="button" onClick={() => jump(offset)}>
            <b>{song.title}</b>
            <small>{song.artist}</small>
          </button>
        </li>
      ))}
    </ol>
  );
}

function FullScreen({ onClose }: { onClose: () => void }) {
  const { current, context } = usePlayer();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    element?.requestFullscreen?.().catch(() => undefined);
    const onChange = () => {
      if (!document.fullscreenElement) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) void document.exitFullscreen();
    };
  }, [onClose]);

  return (
    <div className="full" ref={root} role="dialog" aria-modal="true" aria-label="Pantalla completa">
      <button className="round full-close" type="button" aria-label="Salir de pantalla completa" onClick={onClose}>
        <Icon name="close" />
      </button>
      <Tape title={context?.title ?? current?.title ?? "MELOXO"} color={context?.color ?? "pink"} tilt={-2} className="full-tape" />
      <h2>{current?.title}</h2>
      <p>{current?.artist}</p>
      <Seek />
      <Transport />
    </div>
  );
}

export function PlayerBar({ extra }: { extra?: ReactNode }) {
  const { current, volume, setVolume, notice, dismissNotice } = usePlayer();
  const favorite = useFavorite(current?.id);
  const [full, setFull] = useState(false);
  const lastVolume = useRef(volume || 0.8);

  return (
    <div className="bar">
      <div className="bar-left">
        <div className="cover-sm" style={current?.cover_url ? { backgroundImage: `url(${current.cover_url})` } : undefined} />
        {current ? (
          <div className="bar-title">
            <b>{current.title}</b>
            <small><Link to={`/artists/${current.artist_id}`}>{current.artist}</Link></small>
          </div>
        ) : (
          <div className="bar-title"><small>Elige una pista para empezar</small></div>
        )}
        <button
          className={favorite.isFavorite ? "plain on" : "plain"}
          type="button"
          aria-label={favorite.isFavorite ? "Quitar de favoritas" : "Agregar a favoritas"}
          aria-pressed={favorite.isFavorite}
          disabled={!current || favorite.busy}
          onClick={favorite.toggle}
        >
          <Icon name="heart" filled={favorite.isFavorite} />
        </button>
        {extra}
      </div>
      <div className="bar-center">
        <Transport />
        <Seek />
      </div>
      <div className="bar-right">
        <Popover label="Dedicatoria" icon="note" active={!!current?.dedication}>
          {current?.dedication ? (
            <p className="pop-note">{current.dedication}<small>Dedicatoria de {current.dedicatedBy}</small></p>
          ) : (
            <p className="pop-empty">Esta pista no tiene dedicatoria.</p>
          )}
        </Popover>
        <Popover label="Cola" icon="queue"><QueueList /></Popover>
        <button
          className="plain"
          type="button"
          aria-label={volume === 0 ? "Activar sonido" : "Silenciar"}
          onClick={() => {
            if (volume > 0) lastVolume.current = volume;
            setVolume(volume === 0 ? lastVolume.current : 0);
          }}
        >
          <Icon name={volume === 0 ? "mute" : "volume"} />
        </button>
        <input
          className="band volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          aria-label="Volumen"
          aria-valuetext={`${Math.round(volume * 100)} %`}
          style={{ "--fill": `${volume * 100}%` } as React.CSSProperties}
          onChange={(event) => setVolume(Number(event.target.value))}
        />
        <button className="plain" type="button" aria-label="Pantalla completa" disabled={!current} onClick={() => setFull(true)}>
          <Icon name="expand" />
        </button>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button className="plain" type="button" aria-label="Cerrar aviso" onClick={dismissNotice}><Icon name="close" /></button>
        </div>
      )}
      {full && <FullScreen onClose={() => setFull(false)} />}
    </div>
  );
}
