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
