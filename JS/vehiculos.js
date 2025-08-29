import { getVehiculos, deleteVehiculo } from "./Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("vehiculosLista");
  const emptyMsg = document.getElementById("vehEmpty");
  const userId = localStorage.getItem("userId");

  // Tarjeta con botones Editar y Eliminar
  function card(v) {
    return `
      <div class="vcard">
        <div class="vbody">
          <h3>${v.marca} ${v.modelo}</h3>
          <p>Año: ${v.anio ?? "—"}</p>
          <p>Placa: ${v.placa || "—"} · VIN: ${v.vin || "—"}</p>
          <div class="meta">
            <span class="chip">Estado: ${v.estado?.nombreEstado || "—"}</span>
          </div>
          <div class="actions">
            <button class="edit-btn" data-id="${v.idVehiculo}">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button class="delete-btn" data-id="${v.idVehiculo}">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          </div>
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
        localStorage.setItem("vehiculos", "[]");
        return;
      }

      localStorage.setItem("vehiculos", JSON.stringify(mios));
      list.innerHTML = mios.map(card).join("");
      emptyMsg.classList.add("hidden");
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      list.innerHTML = "<p class='muted'>Error cargando vehículos.</p>";
      localStorage.setItem("vehiculos", "[]");
    }
  }

  // Manejar clics en botones
  document.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    // Editar
    if (editBtn) {
      const id = editBtn.dataset.id;
      window.location.href = `anadirVehiculo.html?id=${id}`;
    }

    // Eliminar
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const confirm = await Swal.fire({
        title: "¿Eliminar vehículo?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (confirm.isConfirmed) {
        try {
          await deleteVehiculo(id);
          Swal.fire("Eliminado", "El vehículo ha sido eliminado", "success");
          load(); // recargar lista
        } catch (err) {
          Swal.fire("Error", "No se pudo eliminar el vehículo", "error");
        }
      }
    }
  });

  load();
});
