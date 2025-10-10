let API_BASE;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  API_BASE = "http://localhost:8080";
} else if (location.hostname === "10.0.2.2") {
  API_BASE = "http://10.0.2.2:8080";
} else {
  API_BASE = "https://mi-backend-produccion.com";
}

async function req(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg += `: ${JSON.stringify(await res.json())}`; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export const OrdenTrabajoService = {
  listar: (token, clienteId, page = 0, size = 10) =>
    req(`${API_BASE}/api/ordenes?clienteId=${encodeURIComponent(clienteId)}&page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  obtener: (token, id) =>
    req(`${API_BASE}/api/ordenes/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  estado: (token, id, estado) =>
    req(`${API_BASE}/api/ordenes/${encodeURIComponent(id)}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado }),
    }),


  archivar: async (token, id) => {
    try {
      return await req(`${API_BASE}/api/ordenes/${encodeURIComponent(id)}/archivar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ archivada: true }),
      });
    } catch {
      return OrdenTrabajoService.estado(token, id, "Archivada");
    }
  },

  desarchivar: async (token, id) => {
    try {
      return await req(`${API_BASE}/api/ordenes/${encodeURIComponent(id)}/archivar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ archivada: false }),
      });
    } catch {

      return OrdenTrabajoService.estado(token, id, "Creada");
    }
  },
};
