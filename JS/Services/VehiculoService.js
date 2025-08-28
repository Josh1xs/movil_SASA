const API_URL = "https://localhost:8080/apiVehiculo"

function parseResponse(json) {
  if (Array.isArray(json)) return json;                // si ya es array
  if (json.data?.content) return json.data.content;    // si viene dentro de data.content
  if (json.content) return json.content;               // si viene como content
  if (json.data) return json.data;                     // si viene solo en data
  return [];                                           // vacío o estructura rara
}

export async function getVehiculos() {
    const res = await fetch(`${API_URL}/consultar`);
    if (!res.ok) throw new Error("Error al obtener vehiculos");
    const json = await res.json();
    return parseResponse(json);
}

export async function createVehiculo(data) {
    const res = await fetch(`${API_URL}/registrar`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al registrar vehículo");
    const json = await res.json();
    return parseResponse(json)
}

export async function updateVehiculo(id, data) {
    const res = await fetch(`${API_URL}/actualizar/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al actualizar vehículo");
    const json = res.json();
    return parseResponse(json);
}

export async function deleteVehiculo(id) {
    const res = await fetch(`${API_URL}/eliminar/${id}`, {
        method: "DELETE"
    })
}