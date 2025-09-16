// ===============================
// CitasService.js
// ===============================
const API_URL = "http://localhost:8080/apiCitas";

// -------- fetchJsonOrThrow --------
async function fetchJsonOrThrow(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch {}
    throw new Error(`${res.status} -> ${url}\n${JSON.stringify(errorData)}`);
  }

  return res.json();
}

// -------- LISTAR CITAS --------
export async function getCitas(token) {
  const res = await fetchJsonOrThrow(`${API_URL}/consultar`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return res.data?.content ?? res;
}

// -------- CREAR CITA --------
export async function createCita(token, cita) {
  return fetchJsonOrThrow(`${API_URL}/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(cita)
  });
}

// -------- ACTUALIZAR CITA --------
export async function updateCita(token, id, cita) {
  return fetchJsonOrThrow(`${API_URL}/actualizar/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(cita)
  });
}

// -------- ELIMINAR CITA --------
export async function deleteCita(token, id) {
  return fetchJsonOrThrow(`${API_URL}/eliminar/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
}
