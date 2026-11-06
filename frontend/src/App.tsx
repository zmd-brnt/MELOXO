import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { AddSongProvider } from "./components/AddSong";
import { AppShell } from "./components/AppShell";
import { NoticesBell } from "./components/NoticesBell";
import { SearchBox } from "./components/SearchBox";
import { Sidebar } from "./components/Sidebar";
import { Artist } from "./pages/Artist";
import { Favorites } from "./pages/Favorites";
import { History } from "./pages/History";
import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Playlist } from "./pages/Playlist";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { Search } from "./pages/Search";
import { TapeCreate } from "./pages/TapeCreate";
import { TapeDetail } from "./pages/TapeDetail";
import { TapeInvite } from "./pages/TapeInvite";
import { NowPanel } from "./player/NowPanel";
import { PlayerBar } from "./player/PlayerBar";

function Shell() {
  return (
    <AddSongProvider>
      <AppShell
        library={<Sidebar />}
        nowPlaying={<NowPanel />}
        player={<PlayerBar />}
        topActions={<><SearchBox /><NoticesBell /></>}
      />
    </AddSongProvider>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="playlists/:id" element={<Playlist />} />
          <Route path="artists/:id" element={<Artist />} />
          <Route path="tapes/new" element={<TapeCreate />} />
          <Route path="tapes/:id" element={<TapeDetail />} />
          <Route path="invite/:token" element={<TapeInvite />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
