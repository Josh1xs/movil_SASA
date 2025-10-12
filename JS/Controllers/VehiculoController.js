import { getToken, getUserId } from "../Services/LoginService.js";
import { getVehiculos, deleteVehiculo } from "../Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("vehiculosLista");
  const emptyMsg = document.getElementById("vehEmpty");

  const token = getToken();
  const userId = getUserId();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Authenticator/login.html"));
    return;
  }

  try {
    // 🔹 Traer vehículos desde la API
    const raw = await getVehiculos(token, 0, 100, "idVehiculo", "asc");
    console.log("Respuesta bruta del backend:", raw);

    // ✅ Normaliza la estructura del backend
    const listaVehiculos = raw.data?.content || raw.data || raw.content || raw;

    if (!Array.isArray(listaVehiculos)) {
      console.error("Formato inesperado:", listaVehiculos);
      throw new Error("Formato de respuesta no válido");
    }

    console.log("Vehículos normalizados:", listaVehiculos);

    // 🔹 Filtrar solo los del cliente logueado (si el campo existe)
    const misVehiculos = listaVehiculos.filter((v) => {
      const idC =
        v.idCliente ??
        v.IdCliente ??
        v.cliente?.idCliente ??
        v.cliente?.IdCliente ??
        v.clienteId;
      return !idC || String(idC) === String(userId);
    });

    // ===============================
    // 🔹 Mostrar u ocultar mensaje vacío correctamente
    // ===============================
    if (misVehiculos.length === 0) {
      emptyMsg.classList.remove("hidden");
      lista.innerHTML = "";
    } else {
      emptyMsg.classList.add("hidden");
      lista.innerHTML = misVehiculos
        .map(
          (v) => `
          <div class="vcard" data-id="${v.idVehiculo ?? v.IdVehiculo ?? v.id}">
            <div class="vbody">
              <h3>${v.marca ?? v.Marca ?? "Sin marca"} ${v.modelo ?? v.Modelo ?? ""}</h3>
              ${v.anio || v.Anio ? `<p><strong>Año:</strong> ${v.anio ?? v.Anio}</p>` : ""}
              ${
                v.estado?.nombre
                  ? `<p><strong>Estado:</strong> ${v.estado.nombre}</p>`
                  : ""
              }
              <p><span class="chip">Placa: ${v.placa ?? v.Placa ?? "N/A"}</span></p>
              <p><strong>VIN:</strong> ${v.vin ?? v.Vin ?? "N/A"}</p>
            </div>
            <div class="actions">
              <button class="btn edit-btn editar">
                <i class="fa fa-pen"></i> Editar
              </button>
              <button class="btn delete-btn eliminar">
                <i class="fa fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        `
        )
        .join("");
    }
  } catch (err) {
    console.error("❌ Error cargando vehículos:", err);
    Swal.fire("Error", "No se pudieron cargar los vehículos", "error");
  }

  // ===============================
  // EVENTO ELIMINAR
  // ===============================
  lista.addEventListener("click", async (e) => {
    const card = e.target.closest(".vcard");
    if (e.target.closest(".eliminar") && card) {
      const id = Number(card.dataset.id);

      if (!id || isNaN(id)) {
        Swal.fire("Error", "ID de vehículo no válido", "error");
        return;
      }

      const conf = await Swal.fire({
        title: "¿Eliminar vehículo?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C91A1A",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
      });

      if (conf.isConfirmed) {
        try {
          await deleteVehiculo(id, token);
          Swal.fire(
            "Eliminado",
            "El vehículo fue eliminado correctamente",
            "success"
          ).then(() => location.reload());
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
    const card = e.target.closest(".vcard");
    if (e.target.closest(".editar") && card) {
      const id = Number(card.dataset.id);

      if (!id || isNaN(id)) {
        Swal.fire("Error", "ID de vehículo no válido", "error");
        return;
      }

      // ✅ Redirección segura con ID correcto
      location.href = `./anadirVehiculo.html?id=${encodeURIComponent(id)}`;
    }
  });
});
