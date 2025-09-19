// ===============================
// Services/VehiculoService.js
// ===============================
const API_URL = "http://localhost:8080/apiVehiculo";

// --- Manejo de errores y JSON ---
async function fetchJsonOrThrow(url, options = {}) {
  const res = await fetch(url, options);
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
  // El backend puede devolver {status, data:{content:[]}} o un array directo
  return data.data?.content ?? data;
}

// --- OBTENER POR ID ---
export async function getVehiculoById(token, id) {
  const url = `${API_URL}/consultar/${id}`;
  const data = await fetchJsonOrThrow(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.data ?? null;
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
  return data.data ?? null;
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
  return data.data ?? null;
}

// --- ELIMINAR ---
export async function deleteVehiculo(id, token) {
  const url = `${API_URL}/eliminar/${id}`; // ✅ ahora el id va en la URL
  return fetchJsonOrThrow(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}
