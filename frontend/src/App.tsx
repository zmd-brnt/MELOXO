import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { AppShell } from "./components/AppShell";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NowPanel } from "./player/NowPanel";
import { PlayerBar } from "./player/PlayerBar";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell nowPlaying={<NowPanel />} player={<PlayerBar />} />}>
          <Route index element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}
