import { getVehiculos } from "./Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("vehiculosLista");
  const emptyMsg = document.getElementById("vehEmpty");
  const userId = localStorage.getItem("userId");

  function card(v) {
    return `
      <div class="vcard">
        <div class="vbody">
          <h3>${v.marca} ${v.modelo}</h3>
          <p>Año: ${v.anio ?? "—"}</p>
          <p>Placa: ${v.placa || "—"} · VIN: ${v.vin || "—"}</p>
          <div class="meta"><span class="chip">Estado: ${v.estado?.nombreEstado || "—"}</span></div>
        </div>
      </div>`;
  }

  async function load() {
    if (!userId) {
      list.innerHTML = "<p class='muted'>Debes iniciar sesión.</p>";
      return;
    }
    try {
      const data = await getVehiculos();
      const mios = data.filter(v => String(v.idCliente) === String(userId));

      if (!mios.length) {
        list.innerHTML = "";
        emptyMsg.classList.remove("hidden");

        // ✅ guardar vacío en localStorage
        localStorage.setItem("vehiculos", "[]");
        return;
      }

      // ✅ guardar vehículos propios en localStorage
      localStorage.setItem("vehiculos", JSON.stringify(mios));

      list.innerHTML = mios.map(card).join("");
      emptyMsg.classList.add("hidden");
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      list.innerHTML = "<p class='muted'>Error cargando vehículos.</p>";

      // fallback: si falla, limpiar localStorage
      localStorage.setItem("vehiculos", "[]");
    }
  }

  load();
});
