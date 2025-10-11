import { getUserId, getToken } from "../JS/Services/LoginService.js";
import { OrdenTrabajoService } from "../JS/Services/OrdenTrabajoService.js";

const $ = (s) => document.querySelector(s);
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const badge = (e) => `<span class="badge state-${e}">${e}</span>`;

function rowTpl(o) {
  const id = o.id ?? o.idOrden;
  const veh = o.vehiculoPlaca ?? o.placa ?? o.vehiculoId ?? "-";
  const total = o.total ?? o.montoTotal ?? 0;
  const estado = o.estado ?? (o.archivada ? "Archivada" : "Creada");
  const archivada = String(estado).toLowerCase() === "archivada" || !!o.archivada;

  const btnArch = archivada
    ? `<button class="icon unarch" data-action="desarchivar"><i class="fa-solid fa-box-open"></i> Desarchivar</button>`
    : `<button class="icon arch" data-action="archivar"><i class="fa-solid fa-box-archive"></i> Archivar</button>`;

  return `
  <tr data-id="${id}">
    <td>${id}</td>
    <td>${veh}</td>
    <td>${money(total)}</td>
    <td>${badge(estado)}</td>
    <td class="w-actions">
      <div class="chips">
        <button class="icon" data-action="ver" title="Ver"><i class="fa-solid fa-eye"></i> Ver</button>
        ${btnArch}
      </div>
    </td>
  </tr>`;
}

function refreshKpis(list) {
  const total = list.length;
  const archivadas = list.filter(o => (o.estado?.toLowerCase?.() === "archivada") || o.archivada).length;
  const activas = total - archivadas;
  $("#kpiTotal").textContent = total;
  $("#kpiActivas").textContent = activas;
  $("#kpiArchivadas").textContent = archivadas;
}


function renderDetalle(o) {
  if (!o) return;

  const id = o.id ?? o.idOrden ?? "—";
  const fecha = o.fecha ?? o.fechaOrden ?? o.createdAt ?? "—";
  const veh = o.vehiculoPlaca ?? o.placa ?? o.vehiculoId ?? "—";
  const estado = o.estado ?? (o.archivada ? "Archivada" : "Creada");
  const total = o.total ?? o.montoTotal ?? 0;

  $("#dOrden").textContent = id;
  $("#dFecha").textContent = (typeof fecha === "string" ? fecha : new Date(fecha).toISOString().slice(0,10));
  $("#dVehiculo").textContent = veh;
  $("#dEstado").textContent = estado;
  $("#dTotal").textContent = money(total);


  const items = o.detalles || o.items || o.detalle || o.detalleOrden || [];
  const tbody = $("#tablaDetalle tbody");
  if (!tbody) return;

  if (!Array.isArray(items) || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="muted">Sin ítems</td></tr>`;
  } else {
    tbody.innerHTML = items.map(d => {
      const did = d.id || d.idDetalle || "—";
      const desc = d.descripcion || d.mantenimiento || d.servicio || "—";
      const precio = money(d.precio ?? d.costo ?? 0);
      return `<tr><td>${did}</td><td>${desc}</td><td>${precio}</td></tr>`;
    }).join("");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const clienteId = getUserId?.() || localStorage.getItem("userId");
  const token = getToken?.() || localStorage.getItem("authToken");

  const tbody = $("#tablaOrdenes tbody");
  const pageInfo = $("#pageInfo");
  const prevPage = $("#prevPage");
  const nextPage = $("#nextPage");

  let page = 0;
  const size = 10;
  let cache = [];

  async function load() {
    try {
      const data = await OrdenTrabajoService.listar(token, clienteId, page, size);
      const arr = data?.content || data || [];
      const total = data?.totalElements ?? data?.total ?? arr.length;

      cache = arr;
      tbody.innerHTML = arr.map(rowTpl).join("") || `<tr><td colspan="5" class="muted">Sin órdenes</td></tr>`;
      pageInfo.textContent = `Página ${page + 1}`;
      prevPage.disabled = page <= 0;
      nextPage.disabled = (page + 1) * size >= total;

      refreshKpis(arr);


      const first = tbody.querySelector("tr");
      if (first) {
        first.classList.add("is-selected");
        const id = first.dataset.id;
        const found = cache.find(o => String(o.id ?? o.idOrden) === String(id));
        if (found) renderDetalle(found);
      } else {
        renderDetalle(null);
      }
    } catch (e) {
      console.error("Error listando:", e);
      tbody.innerHTML = `<tr><td colspan="5" class="muted">Error al cargar</td></tr>`;
      pageInfo.textContent = "—";
      prevPage.disabled = true;
      nextPage.disabled = true;
      refreshKpis([]);
      renderDetalle(null);
    }
  }

  prevPage?.addEventListener("click", () => { if (page > 0) { page--; load(); } });
  nextPage?.addEventListener("click", () => { page++; load(); });


  tbody?.addEventListener("click", async (e) => {
    const tr = e.target.closest("tr");
    const btn = e.target.closest("button.icon");
    const id = tr?.dataset?.id;


    if (tr && !btn) {
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("is-selected"));
      tr.classList.add("is-selected");
      const found = cache.find(o => String(o.id ?? o.idOrden) === String(id));
      if (found) renderDetalle(found);
      return;
    }

    if (!btn || !id) return;
    const action = btn.dataset.action;

    if (action === "ver") {
      try {
        const o = await OrdenTrabajoService.obtener(token, id);
        renderDetalle(o);

        tbody.querySelectorAll("tr").forEach(r => r.classList.remove("is-selected"));
        tr.classList.add("is-selected");
      } catch {
        alert("No se pudo obtener la orden.");
      }
      return;
    }

    if (action === "archivar" || action === "desarchivar") {
      try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

        const updated = action === "archivar"
          ? await OrdenTrabajoService.archivar(token, id)
          : await OrdenTrabajoService.desarchivar(token, id);

        tr.outerHTML = rowTpl(updated);

        const idx = cache.findIndex(o => String(o.id ?? o.idOrden) === String(id));
        if (idx >= 0) cache[idx] = updated;
        refreshKpis(cache);


        const newTr = tbody.querySelector(`tr[data-id="${id}"]`);
        if (newTr) newTr.classList.add("is-selected");
        renderDetalle(updated);
      } catch (err) {
        alert("No se pudo completar la acción.");
      }
    }
  });

  load();
});
