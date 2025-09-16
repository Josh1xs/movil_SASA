// ===============================
// Controllers/VehiculoController.js
// ===============================
import { getToken, getUserId } from "../Services/LoginService.js";
import { getVehiculos, deleteVehiculo } from "../Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("vehiculosLista");
  const emptyMsg = document.getElementById("vehEmpty");

  const token = getToken();
  const userId = getUserId();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Autenticacion/login.html"));
    return;
  }

  try {
    // 🔹 Traer vehículos paginados desde la API
    const response = await getVehiculos(token, 0, 50, "idVehiculo", "asc");
    const vehiculos = response.data?.content || response; // algunos services devuelven directo []

    // 🔹 Filtrar solo los del cliente logueado
    const misVehiculos = vehiculos.filter(v => String(v.idCliente) === String(userId));

    if (!misVehiculos.length) {
      emptyMsg.classList.remove("hidden");
      lista.innerHTML = "";
      return;
    }

    emptyMsg.classList.add("hidden");
    lista.innerHTML = misVehiculos.map(v => `
      <div class="vcard" data-id="${v.idVehiculo}">
        <div class="vbody">
          <h3>${v.marca} ${v.modelo}</h3>
          ${v.anio ? `<p><strong>Año:</strong> ${v.anio}</p>` : ""}
          ${v.estado ? `<p><strong>Estado:</strong> ${v.estado}</p>` : ""}
          <p><span class="chip">Placa: ${v.placa}</span></p>
          <p><strong>VIN:</strong> ${v.vin}</p>
        </div>
        <div class="actions">
          <button class="btn edit-btn editar" data-id="${v.idVehiculo}">
            <i class="fa fa-pen"></i> Editar
          </button>
          <button class="btn delete-btn eliminar" data-id="${v.idVehiculo}">
            <i class="fa fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error("❌ Error cargando vehículos:", err);
    Swal.fire("Error", "No se pudieron cargar los vehículos", "error");
  }

  // ===============================
  // EVENTO ELIMINAR
  // ===============================
  lista.addEventListener("click", async (e) => {
    if (e.target.closest(".eliminar")) {
      const id = e.target.closest(".eliminar").dataset.id;

      const conf = await Swal.fire({
        title: "¿Eliminar vehículo?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C91A1A",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar"
      });

      if (conf.isConfirmed) {
        try {
          await deleteVehiculo(token, id);
          Swal.fire("Eliminado", "El vehículo fue eliminado correctamente", "success")
            .then(() => location.reload());
        } catch (err) {
          console.error("❌ Error eliminando vehículo:", err);
          Swal.fire("Error", "No se pudo eliminar el vehículo", "error");
        }
      }
    }
  });

  // ===============================
  // EVENTO EDITAR
  // ===============================
  lista.addEventListener("click", (e) => {
    if (e.target.closest(".editar")) {
      const id = e.target.closest(".editar").dataset.id;

      // ✅ Redirección segura con ID correcto
      if (id && id !== "undefined") {
        location.href = `./anadirVehiculo.html?id=${encodeURIComponent(id)}`;
      } else {
        Swal.fire("Error", "ID de vehículo no válido", "error");
      }
    }
  });
});
