// ===============================
// Services/VehiculoService.js
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
  // Producción (ejemplo hosting real)
  API_BASE = "https://mi-backend-produccion.com"; // 👈 cámbialo cuando subas
}

const API_URL = `${API_BASE}/apiVehiculo`; // 👈 con V mayúscula

// --- Manejo de errores y JSON ---
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

// --- OBTENER VEHÍCULOS PAGINADOS ---
export async function getVehiculos(
  token,
  page = 0,
  size = 20,
  sortBy = "idVehiculo",
  sortDir = "asc"
) {
  const url = `${API_URL}/consultar?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
  const data = await fetchJsonOrThrow(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.data?.content ?? data.content ?? data;
}

// --- OBTENER POR ID ---
export async function getVehiculoById(token, id) {
  const url = `${API_URL}/consultar/${id}`; // ✅ tu backend lo tiene así
  const data = await fetchJsonOrThrow(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.data ?? data;
}

// --- REGISTRAR ---
export async function addVehiculo(token, vehiculo) {
  const url = `${API_URL}/registrar`;
  const data = await fetchJsonOrThrow(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vehiculo)
  });
  return data.data ?? data;
}

// --- ACTUALIZAR ---
export async function updateVehiculo(token, id, vehiculo) {
  const url = `${API_URL}/actualizar/${id}`;
  const data = await fetchJsonOrThrow(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vehiculo)
  });
  return data.data ?? data;
}

// --- ELIMINAR ---
export async function deleteVehiculo(id, token) {
  const url = `${API_URL}/eliminar/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    let errorMsg = `Error ${res.status} -> ${url}`;
    try {
      const errorData = await res.json();
      errorMsg += "\n" + JSON.stringify(errorData);
    } catch {}
    throw new Error(errorMsg);
  }
  return res.text();
}
