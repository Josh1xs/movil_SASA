// ===============================
// VehiculosService.js (versión fija para Heroku + token automático)
// ===============================

// 🌐 URL base del backend (Heroku)
const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";

// 📦 Endpoint base de Vehículo
const API_URL = `${API_BASE}/apiVehiculo`;

// ===============================
// Helper genérico para peticiones fetch
// ===============================
async function fetchJsonOrThrow(url, options = {}) {
  // ✅ Inyección automática de token si no viene en options
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token && !options.headers?.Authorization
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  const res = await fetch(url, { ...options, headers });

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
  const authToken = token || localStorage.getItem("token"); // ✅ fallback automático
  const url = `${API_URL}/consultar?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
  const data = await fetchJsonOrThrow(url, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return data.data?.content ?? data.content ?? data;
}

// 🔹 Obtener vehículo por ID
export async function getVehiculoById(token, id) {
  const authToken = token || localStorage.getItem("token"); // ✅ usa token local si no se pasa
  const url = `${API_URL}/consultar/${id}`;
  const data = await fetchJsonOrThrow(url, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return data.data ?? data;
}

// 🔹 Registrar nuevo vehículo
export async function addVehiculo(token, vehiculo) {
  const authToken = token || localStorage.getItem("token");
  const url = `${API_URL}/registrar`;
  const data = await fetchJsonOrThrow(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehiculo),
  });
  return data.data ?? data;
}

// 🔹 Actualizar vehículo existente
export async function updateVehiculo(token, id, vehiculo) {
  const authToken = token || localStorage.getItem("token");
  const url = `${API_URL}/actualizar/${id}`;
  const data = await fetchJsonOrThrow(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehiculo),
  });
  return data.data ?? data;
}

// 🔹 Eliminar vehículo por ID
export async function deleteVehiculo(id, token) {
  const authToken = token || localStorage.getItem("token");
  const url = `${API_URL}/eliminar/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
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
