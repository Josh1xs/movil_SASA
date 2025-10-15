// ===============================
// OrdenTrabajoController.js (Móvil) ✅ FINAL FULL FUNCIONAL HEROKU DTO PLANO
// ===============================

import { getUserId, getToken } from "../Services/LoginService.js";
import { listarOrdenesPorVehiculo, obtenerOrdenPorId } from "../Services/OrdenTrabajoService.js";
import { getDetallesByOrden } from "../Services/DetalleOrdenService.js";
import { getVehiculoById } from "../Services/VehiculoService.js";

// ===============================
// Utils
// ===============================
const $ = (s) => document.querySelector(s);
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

// ===============================
// Estado global
// ===============================
const state = {
  vehiculoId: null,
  vehiculoInfo: null,
  ordenes: [],
  seleccionada: null,
  page: 0,
};

// ===============================
// 🔹 Verificar sesión real del cliente
// ===============================
function validarSesion() {
  const userId = getUserId?.() || localStorage.getItem("userId");
  const token = getToken?.() || localStorage.getItem("token");

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Authenticator/login.html"));
    return null;
  }

  return { userId, token };
}

// ===============================
// 🔹 Renderizar órdenes
// ===============================
function renderOrdenes() {
  const cont = $("#ordenesList");
  const vacio = $("#noOrdenes");
  const pager = $("#pager");

  if (!state.ordenes.length) {
    vacio.innerHTML = `
      <i class="fa-solid fa-clipboard-xmark empty-icon"></i>
      <p>No hay órdenes registradas para este vehículo</p>
    `;
    vacio.style.display = "flex";
    cont.innerHTML = "";
    pager.style.display = "none";
    renderDetalle(null);
    return;
  }

  vacio.style.display = "none";
  pager.style.display = "flex";

  cont.innerHTML = state.ordenes
    .map((o) => {
      const id = o.id ?? o.idOrden ?? "-";
      const placa = o.placaVehiculo ?? o.vehiculoPlaca ?? o.vehiculo?.placa ?? "—";
      const marca = o.marcaVehiculo ?? o.vehiculoMarca ?? o.vehiculo?.marca ?? "";
      const fecha = o.fecha ?? o.fechaOrden ?? "—";
      const estado = o.estado ?? "Activa";
      const total = o.total ?? o.montoTotal ?? 0;

      return `
        <div class="orden-card" data-id="${id}">
          <div class="orden-card-header">
            <span class="orden-id">#${id}</span>
            <span class="estado badge-${estado.toLowerCase()}">${estado}</span>
          </div>
          <div class="orden-card-body">
            <div class="orden-info">
              <div class="orden-vehiculo">${placa} ${marca}</div>
              <small class="muted">${String(fecha).substring(0, 10)}</small>
            </div>
            <div class="orden-total">${money(total)}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ===============================
// 🔹 Renderizar detalle seleccionado
// ===============================
async function renderDetalle(o) {
  const tbody = $("#tablaDetalle tbody");

  if (!o) {
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="3" class="muted text-center">Selecciona una orden</td></tr>`;
    $("#dOrden").textContent = "—";
    $("#dFecha").textContent = "—";
    $("#dVehiculo").textContent = "—";
    $("#dEstado").textContent = "—";
    $("#dTotal").textContent = "—";
    return;
  }

  const id = o?.id ?? o?.idOrden ?? "—";
  const fecha = o?.fecha ?? o?.fechaOrden ?? "—";
  const placa = o?.placaVehiculo ?? o?.vehiculoPlaca ?? "—";
  const marca = o?.marcaVehiculo ?? o?.vehiculoMarca ?? "";
  const estado = o?.estado ?? "—";
  let total = o?.total ?? o?.montoTotal ?? 0;

  $("#dOrden").textContent = id;
  $("#dFecha").textContent =
    typeof fecha === "string"
      ? fecha.substring(0, 10)
      : new Date(fecha).toISOString().slice(0, 10);
  $("#dVehiculo").textContent = `${placa} ${marca}`.trim();
  $("#dEstado").textContent = estado;

  if (!tbody) return;

  try {
    const detalles = await getDetallesByOrden(id);

    if (!Array.isArray(detalles) || !detalles.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="muted text-center">Sin detalles registrados</td></tr>`;
      $("#dTotal").textContent = money(0);
      return;
    }

    // 🔹 Calcular total acumulado real
    let totalSum = 0;

    tbody.innerHTML = detalles
      .map((d) => {
        const did = d.id || d.idDetalle || "—";

        // Soporte DTO plano o anidado (Heroku DTO plano)
        const desc =
          d.mantenimientoDTO?.nombre ||
          d.mantenimiento?.nombre ||
          d.mantenimiento ||
          d.descripcion ||
          d.servicio ||
          "—";

        const precioRaw =
          d.mantenimientoDTO?.precio ??
          d.mantenimiento?.precio ??
          d.subtotal ??
          d.precio ??
          d.costo ??
          0;

        totalSum += Number(precioRaw) || 0;
        const precio = money(precioRaw);

        return `<tr><td>${did}</td><td>${desc}</td><td>${precio}</td></tr>`;
      })
      .join("");

    // 🔹 Mostrar total real
    $("#dTotal").textContent = money(totalSum);

    // 🔹 Actualizar total también en la tarjeta seleccionada
    const card = document.querySelector(`.orden-card.is-selected .orden-total`);
    if (card) card.textContent = money(totalSum);
  } catch (err) {
    console.error("❌ Error cargando detalle:", err);
    tbody.innerHTML = `<tr><td colspan="3" class="text-danger text-center">Error al cargar detalles</td></tr>`;
  }
}

// ===============================
// 🔹 Cargar órdenes (con token ✅)
// ===============================
async function cargarOrdenes() {
  const sesion = validarSesion();
  if (!sesion) return;

  try {
    console.log("📡 Cargando órdenes por vehículo...");

    const vehiculoId = Number(localStorage.getItem("vehiculoId"));
    if (!vehiculoId) {
      Swal.fire("Vehículo no seleccionado", "Selecciona un vehículo antes de continuar", "info");
      return;
    }

    state.vehiculoId = vehiculoId;
    const token = sesion.token;

    // 🔹 Info del vehículo
    try {
      const vehiculo = await getVehiculoById(token, vehiculoId);
      state.vehiculoInfo = vehiculo;
      console.log("🚗 Vehículo cargado:", vehiculo);
    } catch (err) {
      console.warn("⚠️ No se pudo cargar la información del vehículo:", err);
    }

    // 🔹 Traer todas las órdenes con token ✅
    const todas = await listarOrdenesPorVehiculo(vehiculoId, state.page, token);
    console.log("📦 Todas las órdenes (raw):", todas);

    // 🔍 Filtro adaptable
    const data = (Array.isArray(todas) ? todas : []).filter((o) => {
      const idDetectado =
        o.idVehiculo ??
        o.idvehiculo ??
        o.id_vehiculo ??
        o.vehiculo?.idVehiculo ??
        o.vehiculo?.idvehiculo ??
        o.vehiculoId ??
        null;

      return Number(idDetectado) === Number(vehiculoId);
    });

    console.log("✅ Órdenes filtradas del vehículo actual:", data);

    state.ordenes = data ?? [];
    renderOrdenes();

    // 🔹 Si solo hay una, mostrarla automáticamente
    if (state.ordenes.length === 1) {
      console.log("🎯 Mostrando automáticamente detalle de la única orden...");
      await renderDetalle(state.ordenes[0]);
    }

    // 🔹 KPIs
    $("#kpiTotal").textContent = state.ordenes.length;
    const activas = state.ordenes.filter(
      (o) => (o.estado ?? "activa").toLowerCase() === "activa"
    ).length;
    $("#kpiActivas").textContent = activas;
  } catch (err) {
    console.error("💥 Error cargando órdenes:", err);
    Swal.fire("Error", "No se pudieron cargar las órdenes del vehículo", "error");
  }
}

// ===============================
// 🔹 Paginación
// ===============================
$("#prevPage")?.addEventListener("click", () => {
  if (state.page > 0) {
    state.page--;
    cargarOrdenes();
  }
});

$("#nextPage")?.addEventListener("click", () => {
  state.page++;
  cargarOrdenes();
});

// ===============================
// 🔹 Click en una orden (mostrar detalle)
// ===============================
$("#ordenesList")?.addEventListener("click", async (e) => {
  const card = e.target.closest(".orden-card");
  if (!card) return;
  const id = card.dataset.id;

  document.querySelectorAll(".orden-card").forEach((c) => c.classList.remove("is-selected"));
  card.classList.add("is-selected");

  try {
    const o = await obtenerOrdenPorId(id);
    state.seleccionada = o;
    await renderDetalle(o);
  } catch (err) {
    console.error("❌ Error al cargar detalle:", err);
  }
});

// ===============================
// 🔹 Inicializar
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Iniciando vista móvil de órdenes de trabajo...");
  cargarOrdenes();
});
