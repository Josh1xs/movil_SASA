// ===============================
// VehiculosService.js (versión fija para Heroku)
// ===============================

// 🌐 URL base del backend (Heroku)
const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";

// 📦 Endpoint base de Vehículo
const API_URL = `${API_BASE}/apiVehiculo`;

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
// CRUD VEHÍCULOS
// ===============================

// 🔹 Listar vehículos (paginado y ordenado)
export async function getVehiculos(
  token,
  page = 0,
  size = 20,
  sortBy = "idVehiculo",
  sortDir = "asc"
) {
  const url = `${API_URL}/consultar?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
  const data = await fetchJsonOrThrow(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.data?.content ?? data.content ?? data;
}

// 🔹 Obtener vehículo por ID
export async function getVehiculoById(token, id) {
  const url = `${API_URL}/consultar/${id}`;
  const data = await fetchJsonOrThrow(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.data ?? data;
}

// 🔹 Registrar nuevo vehículo
export async function addVehiculo(token, vehiculo) {
  const url = `${API_URL}/registrar`;
  const data = await fetchJsonOrThrow(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehiculo),
  });
  return data.data ?? data;
}

// 🔹 Actualizar vehículo existente
export async function updateVehiculo(token, id, vehiculo) {
  const url = `${API_URL}/actualizar/${id}`;
  const data = await fetchJsonOrThrow(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehiculo),
  });
  return data.data ?? data;
}

// 🔹 Eliminar vehículo por ID
export async function deleteVehiculo(id, token) {
  const url = `${API_URL}/eliminar/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let errorMsg = `❌ Error ${res.status} -> ${url}`;
    try {
      const errData = await res.json();
      errorMsg += "\n" + JSON.stringify(errData);
    } catch {}
    throw new Error(errorMsg);
  }

  return res.text();
}
