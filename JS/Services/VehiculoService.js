const API_URL = "http://localhost:8080/apiVehiculo";

function parseResponse(json) {
  if (Array.isArray(json)) return json;
  if (json.data?.content) return json.data.content; // Paginado
  if (json.data) return json.data;                 
  if (json.content) return json.content;           
  return [];
}

export async function getVehiculos(page = 0, size = 20) {
  const res = await fetch(`${API_URL}/consultar?page=${page}&size=${size}`);
  if (!res.ok) throw new Error("Error al obtener vehículos");
  const json = await res.json();
  return parseResponse(json);
}

export async function createVehiculo(data) {
  const res = await fetch(`${API_URL}/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al registrar vehículo");
  const json = await res.json();
  return json.data;
}

export async function updateVehiculo(id, data) {
  const res = await fetch(`${API_URL}/actualizar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar vehículo");
  const json = await res.json();
  return json.data;
}

export async function deleteVehiculo(id) {
  const res = await fetch(`${API_URL}/eliminar/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar vehículo");
  return true;
}
