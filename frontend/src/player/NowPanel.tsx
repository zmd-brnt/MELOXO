import { Link } from "react-router-dom";
import { Note } from "../components/Note";
import { Tape } from "../components/Tape";
import { usePlayer } from "./PlayerProvider";

/** El crédito es parte de la licencia de Jamendo: artista, Jamendo y enlace a cada pista. */
export function Credit() {
  const { current } = usePlayer();
  if (!current) return null;
  if (current.source !== "jamendo") return <small>Subida a MELOXO{current.license ? ` · ${current.license}` : ""}</small>;
  return (
    <small className="credit">
      {current.artist} · vía{" "}
      <a href={current.jamendo_url ?? "https://www.jamendo.com"} target="_blank" rel="noreferrer">Jamendo</a>
      {current.license && (
        <> · {current.license_url ? <a href={current.license_url} target="_blank" rel="noreferrer">{current.license}</a> : current.license}</>
      )}
    </small>
  );
}

export function NowPanel() {
  const { current, context, queue, jump } = usePlayer();
  if (!current) {
    return (
      <>
        <h3 className="now-title">Sonando</h3>
        <Tape title="Nada todavía" color="cobalt" tilt={-3} className="now-tape" />
        <small>Cuando pongas algo, aparece aquí.</small>
      </>
    );
  }
  return (
    <>
      <h3 className="now-title">{context?.label ?? "Sonando"}</h3>
      {context ? (
        <Link to={context.href} aria-label={`Abrir ${context.title}`}>
          <Tape title={context.title} color={context.color} tilt={-3} className="now-tape" />
        </Link>
      ) : (
        <Tape title={current.title} color="pink" tilt={-3} className="now-tape" />
      )}
      <b className="now-song">{current.title}</b>
      <Credit />
      {current.dedication && (
        <Note tape className="now-note">
          {current.dedication}
          <small>Dedicatoria de {current.dedicatedBy}</small>
        </Note>
      )}
      {queue.length > 0 && (
        <div className="now-next">
          <small>Sigue</small>
          <ol>
            {queue.slice(0, 3).map((song, offset) => (
              <li key={`${song.id}-${offset}`}>
                <button type="button" onClick={() => jump(offset)}>{song.title}</button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
