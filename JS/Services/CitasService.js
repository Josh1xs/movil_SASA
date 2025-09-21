// ===============================
// Services/CitasService.js
// ===============================

// Detectar el host dinámicamente
let API_BASE;

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  // PC navegador
  API_BASE = "http://localhost:8080";
} else if (window.location.hostname === "10.0.2.2") {
  // Emulador Android
  API_BASE = "http://10.0.2.2:8080";
} else {
  // Producción (ejemplo en hosting real)
  API_BASE = "https://mi-backend-produccion.com"; // 👈 cámbialo al desplegar
}

const API_URL = `${API_BASE}/apiCitas`;

// ----------------------------------
// Manejo genérico de fetch + errores
// ----------------------------------
async function fetchJsonOrThrow(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `Error ${res.status} -> ${url}`;
    try {
      const errorData = await res.json();
      errorMsg += "\n" + JSON.stringify(errorData);
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

// -------- LISTAR TODAS --------
export async function getCitas(token) {
  const res = await fetchJsonOrThrow(`${API_URL}/listar`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data ?? res;
}

// -------- LISTAR PAGINADO --------
export async function getCitasPaginadas(token, page = 0, size = 10) {
  const res = await fetchJsonOrThrow(`${API_URL}/consultar?page=${page}&size=${size}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data?.content ?? res.content ?? res.data ?? res;
}

// -------- OBTENER POR ID --------
export async function getCitaById(token, id) {
  const res = await fetchJsonOrThrow(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data ?? res;
}

// -------- CREAR --------
export async function crearCita(cita, token) {
  const res = await fetchJsonOrThrow(`${API_URL}/registrar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cita),
  });
  return res.data ?? res;
}

// -------- ACTUALIZAR --------
export async function actualizarCita(id, cita, token) {
  const res = await fetchJsonOrThrow(`${API_URL}/actualizar/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cita),
  });
  return res.data ?? res;
}

// -------- ELIMINAR --------
export async function eliminarCita(id, token) {
  const res = await fetchJsonOrThrow(`${API_URL}/eliminar/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res;
}
