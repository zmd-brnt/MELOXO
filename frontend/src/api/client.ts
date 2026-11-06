export type Tokens = { access_token: string; refresh_token: string };

type Options = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

const REFRESH_KEY = "meloxo.refresh";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;
const endedListeners = new Set<() => void>();

function storedRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setSession(tokens: Tokens | null): void {
  accessToken = tokens?.access_token ?? null;
  try {
    if (tokens) localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Sin almacenamiento la sesión dura lo que dure la pestaña.
  }
}

export const getAccessToken = () => accessToken;
export const hasSession = () => accessToken !== null || storedRefresh() !== null;
export const getRefreshToken = storedRefresh;

export function onSessionEnded(listener: () => void): () => void {
  endedListeners.add(listener);
  return () => endedListeners.delete(listener);
}

async function send(path: string, options: Options): Promise<Response> {
  const { json, headers, ...rest } = options;
  const merged = new Headers(headers);
  if (accessToken) merged.set("authorization", `Bearer ${accessToken}`);
  if (json !== undefined) merged.set("content-type", "application/json");
  const init: RequestInit = { ...rest, headers: merged };
  if (json !== undefined) init.body = JSON.stringify(json);
  try {
    return await fetch(path, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "network_error", "No hay conexión con MELOXO. Revisa tu red e intenta de nuevo.");
  }
}

async function renew(): Promise<boolean> {
  const token = storedRefresh();
  if (!token) return false;
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  }).catch(() => null);
  if (!response?.ok) return false;
  setSession((await response.json()) as Tokens);
  return true;
}

/** Varias peticiones con el token vencido comparten una sola renovación. */
function renewOnce(): Promise<boolean> {
  refreshing ??= renew().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function toError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const error = body?.error;
  return new ApiError(
    response.status,
    error?.code ?? "unknown_error",
    error?.message ?? "Algo salió mal. Intenta de nuevo.",
  );
}

export async function api<T = unknown>(path: string, options: Options = {}): Promise<T> {
  let response = await send(path, options);
  if (response.status === 401 && !path.startsWith("/api/auth/")) {
    const original = accessToken;
    const failure = await toError(response);
    if (await renewOnce()) {
      response = await send(path, options);
      if (response.status === 401) throw await toError(response);
    } else {
      if (original === accessToken) setSession(null);
      endedListeners.forEach((listener) => listener());
      throw failure;
    }
  }
  if (!response.ok) throw await toError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** `fetch` no informa el avance de una subida, por eso esta ruta usa XMLHttpRequest. */
export async function upload<T>(path: string, form: FormData, onProgress?: (fraction: number) => void): Promise<T> {
  await api("/api/users/me"); // Renueva el token antes de una petición que puede tardar.
  return new Promise<T>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", path);
    if (accessToken) request.setRequestHeader("authorization", `Bearer ${accessToken}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    request.onerror = () => reject(new ApiError(0, "network_error", "Se perdió la conexión durante la subida."));
    request.onload = () => {
      const body = (() => {
        try {
          return JSON.parse(request.responseText);
        } catch {
          return null;
        }
      })();
      if (request.status >= 200 && request.status < 300) resolve(body as T);
      else {
        reject(
          new ApiError(
            request.status,
            body?.error?.code ?? "unknown_error",
            body?.error?.message ?? "No se pudo subir el archivo.",
          ),
        );
      }
    };
    request.send(form);
  });
}
