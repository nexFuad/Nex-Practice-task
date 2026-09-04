const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const isAuthPath = (path: string) =>
  path.includes("/api/auth/login") ||
  path.includes("/api/auth/refresh") ||
  path.includes("/api/auth/logout");

function apiUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

/** Shared client for every request to the Nexstack backend. */
export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  let response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
  if (response.status === 401 && !isAuthPath(path)) {
    const refreshResponse = await fetch(apiUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
    });
    if (refreshResponse.ok)
      response = await fetch(apiUrl(path), {
        ...init,
        headers,
        credentials: "include",
      });
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Unable to complete the request.");
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}
