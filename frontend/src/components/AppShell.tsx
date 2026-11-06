import { type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/meloxo-horizontal-color-dark.svg";
import { useAuth } from "../auth/AuthContext";
import { Icon, type IconName } from "./Icon";

const nav: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Inicio", icon: "home" },
  { to: "/search", label: "Buscar", icon: "search" },
  { to: "/library", label: "Tu biblioteca", icon: "library" },
  { to: "/stats", label: "Estadísticas", icon: "stats" },
];

const roleNav: Record<string, { to: string; label: string; icon: IconName }> = {
  composer: { to: "/composer", label: "Tu música", icon: "note" },
  admin: { to: "/admin", label: "Administración", icon: "shield" },
};

type Props = { library?: ReactNode; nowPlaying?: ReactNode; player?: ReactNode; topActions?: ReactNode };

export function AppShell({ library, nowPlaying, player, topActions }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const extra = user ? roleNav[user.role] : undefined;
  return (
    <div className="shell">
      <a className="skip" href="#content">Saltar al contenido</a>
      <aside className="panel side" aria-label="Navegación">
        <Link to="/" aria-label="MELOXO, inicio">
          <img className="brand" src={logo} alt="" />
        </Link>
        <nav className="nav">
          {(extra ? [...nav, extra] : nav).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {library}
      </aside>
      <main className="panel center">
        <header className="top">
          <button className="round" type="button" aria-label="Atrás" onClick={() => navigate(-1)}>
            <Icon name="left" />
          </button>
          <button className="round" type="button" aria-label="Adelante" onClick={() => navigate(1)}>
            <Icon name="right" />
          </button>
          <div className="top-actions">{topActions}</div>
          <Link className="round avatar" to="/profile" aria-label={`Tu perfil, ${user?.display_name}`}>
            {user?.display_name.slice(0, 1).toUpperCase()}
          </Link>
        </header>
        <div id="content" className="content" tabIndex={-1}>
          <Outlet />
        </div>
      </main>
      <aside className="panel now" aria-label="Sonando">
        {nowPlaying}
      </aside>
      <footer className="player">{player}</footer>
    </div>
  );
}
