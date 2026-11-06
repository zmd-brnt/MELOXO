export type Role = "listener" | "composer" | "admin";

export type User = {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  status: string;
  created_at: string;
};

export type Page<T> = { items: T[]; total: number; page: number; size: number };

export type Song = {
  id: string;
  title: string;
  artist_id: string;
  artist: string;
  album: string | null;
  duration: number;
  cover_url: string | null;
  source: "jamendo" | "local";
  license: string | null;
  license_url: string | null;
  jamendo_url: string | null;
  genres: string[];
  status: string;
  available: boolean;
};
