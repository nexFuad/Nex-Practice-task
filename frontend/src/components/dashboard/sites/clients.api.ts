import type { Client } from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function searchClients(query: string) {
  const response = await fetch(`${apiBaseUrl}/api/clients?query=${encodeURIComponent(query)}`, { credentials: "include" });
  if (!response.ok) throw new Error("Unable to load clients.");
  return response.json() as Promise<Client[]>;
}
