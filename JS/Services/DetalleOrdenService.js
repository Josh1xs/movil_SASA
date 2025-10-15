// ===============================
// DetalleOrdenService.js ✅ FINAL (Cliente Móvil - Solo Heroku / Solo Lectura)
// ===============================

// 🔹 URL fija (solo Heroku)
const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";
const BASE = `${API_BASE}/apiDetalleOrden`;

// ===============================
// 🌐 Helper HTTP universal (con JWT y manejo 401)
// ===============================
async function http(url, { method = "GET", headers = {}, body } = {}) {
  const isForm = body instanceof FormData;
  const baseHeaders = isForm ? {} : { "Content-Type": "application/json" };
const token = localStorage.getItem("token");
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(url, {
      method,
      headers: { ...baseHeaders, ...auth, ...headers },
      body,
      credentials: "include",
    });

    // 🔒 Sesión expirada
    if (res.status === 401) {
      localStorage.clear();
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Por favor inicia sesión nuevamente.",
        confirmButtonColor: "#C91A1A",
      }).then(() => (window.location.href = "../Autenticacion/login.html"));
      throw new Error("401 Unauthorized");
    }

    const text = await res.text();
    if (!res.ok) {
      console.error(`❌ Error HTTP ${res.status} -> ${url}`);
      console.error("🧾 Respuesta:", text);
      throw new Error(`HTTP ${res.status} -> ${url}\n${text}`);
    }

    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error("❌ Error de conexión o servidor:", err);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor SASA en Heroku.",
      confirmButtonColor: "#C91A1A",
    });
    throw err;
  }
}

// ===============================
// 🧩 Normalización de respuesta
// ===============================
function normalizeResponse(json) {
  if (!json) return [];
  if (json?.data) return json.data;
  if (json?.content) return json.content;
  if (Array.isArray(json)) return json;
  return [json];
}

// ===============================
// 🔹 ENDPOINTS PERMITIDOS (solo lectura)
// ===============================

// 🔹 Obtener detalles de una orden
export async function getDetallesByOrden(idOrden) {
  if (!idOrden) throw new Error("Debe proporcionar un ID de orden válido.");
  const url = `${BASE}/porOrden/${encodeURIComponent(idOrden)}`;
  const json = await http(url);
  return normalizeResponse(json);
}
