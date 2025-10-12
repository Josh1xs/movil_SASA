// ===============================
// 📅 CitasService.js (Heroku versión limpia)
// ===============================

// 🌐 URL base del backend (Heroku)
const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";

// 📦 Endpoint base de Citas
const API_URL = `${API_BASE}/apiCitas`;

// ===============================
// Helper genérico para peticiones fetch
// ===============================
async function fetchJsonOrThrow(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `❌ Error ${res.status} -> ${url}`;
    try {
      const errData = await res.json();
      errorMsg += "\n" + JSON.stringify(errData);
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

// ===============================
// CRUD CITAS
// ===============================

// 🔹 Obtener todas las citas
export async function getCitas(token) {
  const res = await fetchJsonOrThrow(`${API_URL}/listar`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data ?? res;
}

// 🔹 Obtener citas paginadas
export async function getCitasPaginadas(token, page = 0, size = 10) {
  const res = await fetchJsonOrThrow(
    `${API_URL}/consultar?page=${page}&size=${size}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data?.content ?? res.content ?? res.data ?? res;
}

// 🔹 Obtener cita por ID
export async function getCitaById(token, id) {
  const res = await fetchJsonOrThrow(`${API_URL}/consultar/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data ?? res;
}

// 🔹 Registrar nueva cita
export async function crearCita(cita, token) {
  const res = await fetchJsonOrThrow(`${API_URL}/registrar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cita),
  });
  return res.data ?? res;
}

// 🔹 Actualizar cita existente
export async function actualizarCita(id, cita, token) {
  const res = await fetchJsonOrThrow(`${API_URL}/actualizar/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cita),
  });
  return res.data ?? res;
}

// 🔹 Eliminar cita
export async function eliminarCita(id, token) {
  const res = await fetchJsonOrThrow(`${API_URL}/eliminar/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data ?? res;
}
