import type { Song } from "../api/types";

/** La licencia de Jamendo pide acreditar al artista, a Jamendo y enlazar cada pista. */
export function Attribution({ song }: { song: Song }) {
  if (song.source !== "jamendo") {
    return <small>{[song.artist, song.license].filter(Boolean).join(" · ")}</small>;
  }
  return (
    <small className="credit">
      {song.artist} · vía{" "}
      <a href={song.jamendo_url ?? "https://www.jamendo.com"} target="_blank" rel="noreferrer">Jamendo</a>
      {song.license && (
        <>
          {" · "}
          {song.license_url ? (
            <a href={song.license_url} target="_blank" rel="noreferrer">{song.license}</a>
          ) : (
            song.license
          )}
        </>
      )}
    </small>
  );
}
