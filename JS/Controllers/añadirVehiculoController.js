// ===============================
// Controllers/añadirVehiculoController.js
// ===============================
import { getToken, getUserId } from "../Services/LoginService.js";
import { addVehiculo } from "../Services/añadirVehiculoService.js";
import { getVehiculoById, updateVehiculo } from "../Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formVehiculo");
  const btnLimpiar = document.getElementById("btnLimpiar");

  const token = getToken();
  const userId = getUserId();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Autenticacion/login.html"));
    return;
  }

  // ==========================
  // Obtener ID de URL (modo edición)
  // ==========================
  const params = new URLSearchParams(window.location.search);
  const vehiculoId = params.get("id");

  if (vehiculoId && vehiculoId !== "undefined" && !isNaN(Number(vehiculoId))) {
    try {
      const vehiculo = await getVehiculoById(token, vehiculoId);

      if (!vehiculo) {
        Swal.fire("Error", "Vehículo no encontrado", "error")
          .then(() => location.replace("./Vehiculos.html"));
        return;
      }

      // Precargar datos en formulario
      document.getElementById("marca").value  = vehiculo.marca ?? "";
      document.getElementById("modelo").value = vehiculo.modelo ?? "";
      document.getElementById("anio").value   = vehiculo.anio ?? "";
      document.getElementById("placa").value  = vehiculo.placa ?? "";
      document.getElementById("vin").value    = vehiculo.vin ?? "";

      // Precargar estado
      if (vehiculo.idEstado) {
        document.getElementById("estado").value = vehiculo.idEstado;
      } else if (vehiculo.estado?.idEstado) {
        document.getElementById("estado").value = vehiculo.estado.idEstado;
      }
    } catch (err) {
      console.error("Error cargando vehículo:", err);
      Swal.fire("Error", "No se pudo cargar el vehículo", "error")
        .then(() => location.replace("./Vehiculos.html"));
    }
  }

  // ==========================
  // Limpiar formulario
  // ==========================
  btnLimpiar.addEventListener("click", () => {
    form.reset();
  });

  // ==========================
  // Guardar o actualizar
  // ==========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const marca  = document.getElementById("marca").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const anio   = parseInt(document.getElementById("anio").value);
    const placa  = document.getElementById("placa").value.trim().toUpperCase();
    const vin    = document.getElementById("vin").value.trim().toUpperCase();
    const idEstado = parseInt(document.getElementById("estado").value);

    // 🔹 Validaciones antes de enviar
    if (!marca || !modelo || !anio || !placa || !vin || !idEstado) {
      Swal.fire("Campos requeridos", "Todos los campos son obligatorios", "warning");
      return;
    }
    if (anio < 1900 || anio > new Date().getFullYear() + 1) {
      Swal.fire("Año inválido", "El año debe estar entre 1900 y el próximo año", "warning");
      return;
    }
    if (vin.length !== 17) {
      Swal.fire("VIN inválido", "El VIN debe tener exactamente 17 caracteres", "warning");
      return;
    }
    if (!/^[A-Z0-9]+$/.test(vin)) {
      Swal.fire("VIN inválido", "El VIN solo puede contener letras y números", "warning");
      return;
    }
    if (!/^[A-Z0-9-]+$/.test(placa)) {
      Swal.fire("Placa inválida", "La placa solo puede contener letras, números y guiones", "warning");
      return;
    }

    const vehiculo = {
      marca,
      modelo,
      anio,
      placa,
      vin,
      idCliente: Number(userId),
      idEstado
    };

    try {
      if (vehiculoId && vehiculoId !== "undefined" && !isNaN(Number(vehiculoId))) {
        await updateVehiculo(token, Number(vehiculoId), vehiculo);
        Swal.fire("Éxito", "Vehículo actualizado correctamente", "success")
          .then(() => location.replace("./Vehiculos.html"));
      } else {
        await addVehiculo(token, vehiculo);
        Swal.fire("Éxito", "Vehículo registrado correctamente", "success")
          .then(() => location.replace("./Vehiculos.html"));
      }
    } catch (err) {
      console.error("❌ Error al guardar vehículo:", err);
      Swal.fire("Error", err.message || "No se pudo guardar el vehículo. Verifica los datos.", "error");
    }
  });
});
