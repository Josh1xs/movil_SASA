// ===============================
// Services/CitasService.js
// ===============================
import { getToken } from "./LoginService.js";

const API_URL = "http://localhost:8080/apiCitas";

async function fetchJsonOrThrow(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorData = {};
    try { errorData = await res.json(); } catch {}
    throw new Error(`${res.status} -> ${url}\n${JSON.stringify(errorData)}`);
  }
  return res.json();
}

// ===============================
// LISTAR CITAS
// ===============================
export async function getCitas(token = getToken()) {
  const res = await fetchJsonOrThrow(`${API_URL}/consultar`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.data ?? res; // soporta backend {status,data} o lista directa
}

// ===============================
// CREAR CITA
// ===============================
export async function crearCita(dto, token = getToken()) {
  const res = await fetchJsonOrThrow(`${API_URL}/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(dto)
  });
  return res;
}

// ===============================
// ELIMINAR CITA
// ===============================
export async function eliminarCita(id, token = getToken()) {
  return fetchJsonOrThrow(`${API_URL}/eliminar/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
}
