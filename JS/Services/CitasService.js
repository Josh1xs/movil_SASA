let API_BASE;

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {

  API_BASE = "http://localhost:8080";
} else if (window.location.hostname === "10.0.2.2") {

  API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";
} else {

  API_BASE = "https://mi-backend-produccion.com";
}

const API_URL = `${API_BASE}/apiCitas`;


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


export async function getCitas(token) {
  const res = await fetchJsonOrThrow(`${API_URL}/listar`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data ?? res;
}


export async function getCitasPaginadas(token, page = 0, size = 10) {
  const res = await fetchJsonOrThrow(`${API_URL}/consultar?page=${page}&size=${size}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data?.content ?? res.content ?? res.data ?? res;
}


export async function getCitaById(token, id) {
  const res = await fetchJsonOrThrow(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data ?? res;
}


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


export async function eliminarCita(id, token) {
  const res = await fetchJsonOrThrow(`${API_URL}/eliminar/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res;
}
