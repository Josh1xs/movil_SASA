// ===============================
// OrdenTrabajoService.js ✅ FINAL MÓVIL FUNCIONAL (Heroku DTO PLANO)
// ===============================

// 🌎 Detección de entorno (local o producción)
const isProd =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("herokuapp.com") ||
    window.location.hostname !== "localhost");

// 🌐 Base dinámica del backend
const API_BASE = isProd
  ? "https://sasaapi-73d5de493985.herokuapp.com"
  : "http://localhost:8080";

const BASE = `${API_BASE}/apiOrdenTrabajo`;

// ===============================
// 🔧 Helper HTTP universal
// ===============================
async function http(url, { method = "GET", headers = {}, body } = {}) {
  const token = localStorage.getItem("token");
  const baseHeaders = { "Content-Type": "application/json" };
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    method,
    headers: { ...baseHeaders, ...auth, ...headers },
    body,
    credentials: "include",
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status} -> ${url}`);
    throw new Error(`HTTP ${res.status} -> ${url}\n${text}`);
  }

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// ===============================
// 🔹 Listar TODAS las órdenes
// ===============================
export async function listarOrdenes({ page = 0, size = 10 } = {}) {
  const url = `${BASE}/consultar?page=${page}&size=${size}`;
  const json = await http(url);
  return json?.data ?? json ?? [];
}

// ===============================
// 🔹 Obtener una orden por ID
// ===============================
export async function obtenerOrdenPorId(idOrden) {
  if (!idOrden) throw new Error("⚠️ ID de orden requerido.");
  const url = `${BASE}/consultar/${encodeURIComponent(idOrden)}`;
  const json = await http(url);
  return json?.data ?? json;
}

// ===============================
// 🔹 Crear nueva orden
// ===============================
export async function crearOrden({ idVehiculo, fecha }) {
  const payload = { idVehiculo, fecha };
  const json = await http(`${BASE}/crear`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json?.data ?? json;
}

// ===============================
// 🔹 Actualizar orden existente
// ===============================
export async function actualizarOrden(idOrden, { idVehiculo, fecha }) {
  const payload = { idVehiculo, fecha };
  const json = await http(`${BASE}/actualizar/${encodeURIComponent(idOrden)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json?.data ?? json;
}

// ===============================
// 🔹 Eliminar orden
// ===============================
export async function eliminarOrden(idOrden) {
  const json = await http(`${BASE}/eliminar/${encodeURIComponent(idOrden)}`, {
    method: "DELETE",
  });
  return json?.data ?? json;
}

// ===============================
// 🔹 Listar órdenes por vehículo (Heroku sin endpoint /porVehiculo)
// ===============================
export async function listarOrdenesPorVehiculo(idVehiculo, page = 0, token) {
  if (!idVehiculo) throw new Error("⚠️ ID de vehículo requerido.");

  console.log("📡 [Móvil] Solicitando órdenes por vehículo:", idVehiculo);

  // 🔹 Traer todas las órdenes con token
  const json = await http(`${BASE}/consultar?page=${page}&size=100`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const ordenes = json?.data ?? json ?? [];

  console.log("🧩 [DEBUG] Todas las órdenes sin filtrar:", ordenes);

  // 🔹 Filtro adaptable por vehículo
  const filtradas = Array.isArray(ordenes)
    ? ordenes.filter((o) => {
        const idDetectado =
          o.idVehiculo ??
          o.idvehiculo ??
          o.vehiculo?.idVehiculo ??
          o.vehiculo?.idvehiculo ??
          o.id_vehiculo ??
          null;
        return Number(idDetectado) === Number(idVehiculo);
      })
    : [];

  console.log("✅ [Service] Órdenes filtradas por vehículo:", filtradas);
  return filtradas;
}
