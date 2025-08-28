const API_URL = "http://localhost:8080/apiCliente";

function parseResponse(json) {
  if (Array.isArray(json)) return json;                // si ya es array
  if (json.data?.content) return json.data.content;    // si viene dentro de data.content
  if (json.content) return json.content;               // si viene como content
  if (json.data) return json.data;                     // si viene solo en data
  return [];                                           // vacío o estructura rara
}

export async function getUsuarios() {
    const res = await fetch(`${API_URL}/consultar`);
    if (!res.ok) throw new ("Error al obtener usuarios");
    const json = await res.json();
    return parseResponse(json);
}