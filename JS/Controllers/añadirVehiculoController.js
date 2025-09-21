// ===============================
// Controllers/añadirVehiculoController.js
// ===============================
import { getToken, getUserId } from "../Services/LoginService.js";
import { getVehiculoById, addVehiculo, updateVehiculo } from "../Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("vehiculoForm");
  const token = getToken();
  const userId = getUserId();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Autenticacion/login.html"));
    return;
  }

  // --- Ver si estamos editando ---
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    try {
      const vehiculo = await getVehiculoById(token, id);

      // Llenar los campos del formulario
      document.getElementById("marca").value = vehiculo.marca ?? vehiculo.Marca ?? "";
      document.getElementById("modelo").value = vehiculo.modelo ?? vehiculo.Modelo ?? "";
      document.getElementById("anio").value = vehiculo.anio ?? vehiculo.Anio ?? "";
      document.getElementById("placa").value = vehiculo.placa ?? vehiculo.Placa ?? "";
      document.getElementById("vin").value = vehiculo.vin ?? vehiculo.Vin ?? "";

      if (vehiculo.idEstado ?? vehiculo.estado?.idEstado) {
        document.getElementById("estado").value = vehiculo.idEstado ?? vehiculo.estado.idEstado;
      }
    } catch (err) {
      console.error("❌ Error cargando vehiculo:", err);
      Swal.fire("Error", "No se pudo cargar el vehículo", "error");
    }
  }

  // --- Guardar (nuevo o editar) ---
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const estadoVal = document.getElementById("estado").value;
      if (!estadoVal) {
        Swal.fire("Error", "Debes seleccionar un estado válido", "error");
        return;
      }

      const vehiculo = {
        marca: document.getElementById("marca").value,
        modelo: document.getElementById("modelo").value,
        anio: document.getElementById("anio").value,
        placa: document.getElementById("placa").value,
        vin: document.getElementById("vin").value,
        idCliente: userId,
        idEstado: Number(estadoVal) // ✅ ahora lo enviamos como campo plano
      };

      try {
        if (id) {
          await updateVehiculo(token, id, vehiculo);
          Swal.fire("Actualizado", "El vehículo fue actualizado correctamente", "success")
            .then(() => location.replace("./Vehiculos.html"));
        } else {
          await addVehiculo(token, vehiculo);
          Swal.fire("Registrado", "El vehículo fue agregado correctamente", "success")
            .then(() => location.replace("./Vehiculos.html"));
        }
      } catch (err) {
        console.error("❌ Error guardando vehículo:", err);
        Swal.fire("Error", "No se pudo guardar el vehículo", "error");
      }
    });
  } else {
    console.error("❌ No se encontró el formulario con id='vehiculoForm'");
  }
});
